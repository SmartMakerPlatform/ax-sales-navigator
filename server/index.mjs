import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import multer from "multer";
import { parseBuffer } from "music-metadata";
import { normalizeAudioForTranscription } from "./audioNormalization.mjs";
import { transcribeWithGoogle } from "./googleSpeechV2.mjs";

if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile(fileURLToPath(new URL("./.env", import.meta.url)));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

const app = express();
const port = Number(process.env.TRANSCRIPTION_RELAY_PORT || 8787);
const maxAudioBytes = 10_000_000;
const maxAudioSeconds = 60;
const allowedExtensions = new Set([".m4a", ".mp3", ".wav"]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: maxAudioBytes },
});

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function validateFile(file) {
  if (!file) {
    throw new HttpError(400, "AUDIO_REQUIRED", "전사할 음성 파일을 선택해 주세요.");
  }
  const extension = path.extname(file.originalname).toLowerCase();
  if (!allowedExtensions.has(extension)) {
    throw new HttpError(415, "UNSUPPORTED_AUDIO_TYPE", "M4A, MP3, WAV 파일만 전사할 수 있습니다.");
  }
}

async function validateDuration(file) {
  let metadata;
  try {
    metadata = await parseBuffer(
      file.buffer,
      { mimeType: file.mimetype, size: file.size },
      { duration: true },
    );
  } catch {
    throw new HttpError(422, "INVALID_AUDIO", "재생 가능한 음성 파일인지 확인해 주세요.");
  }

  const duration = metadata.format.duration;
  if (!Number.isFinite(duration)) {
    throw new HttpError(422, "UNKNOWN_AUDIO_DURATION", "음성 길이를 확인할 수 없습니다.");
  }
  if (duration > maxAudioSeconds) {
    throw new HttpError(413, "AUDIO_TOO_LONG", "60초 이하 음성 파일만 전사할 수 있습니다.");
  }
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", transcriptionProvider: "google-v2" });
});

app.post("/api/transcriptions", upload.single("audio"), async (request, response, next) => {
  try {
    validateFile(request.file);
    await validateDuration(request.file);
    const audioContent = Buffer.from(request.file.buffer);
    let normalizedAudio;
    try {
      normalizedAudio = await normalizeAudioForTranscription(
        audioContent,
        path.extname(request.file.originalname),
      );
    } catch {
      throw new HttpError(
        422,
        "AUDIO_NORMALIZATION_FAILED",
        "음성 파일을 전사 가능한 표준 형식으로 변환하지 못했습니다.",
      );
    }
    console.log(
      `[transcription-relay] normalized ${audioContent.byteLength} bytes to ${normalizedAudio.byteLength} bytes`,
    );
    const result = await transcribeWithGoogle(normalizedAudio);
    if (!result.transcript) {
      throw new HttpError(422, "SPEECH_NOT_RECOGNIZED", "음성에서 인식 가능한 발화를 찾지 못했습니다.");
    }
    response.json(result);
  } catch (error) {
    next(error);
  }
});

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(currentDirectory, "../frontend/dist");
app.use(express.static(frontendDist));
app.get(/^(?!\/api\/).*/, (_request, response) => {
  response.sendFile(path.join(frontendDist, "index.html"));
});

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    response.status(413).json({
      code: "AUDIO_TOO_LARGE",
      message: "음성 파일은 10MB 이하여야 합니다.",
    });
    return;
  }

  if (error instanceof HttpError) {
    response.status(error.status).json({ code: error.code, message: error.message });
    return;
  }

  const configurationError = error?.code === "GOOGLE_PROJECT_NOT_CONFIGURED";
  const serviceDisabled = error?.reason === "SERVICE_DISABLED";
  const permissionError =
    !serviceDisabled && (error?.code === 7 || error?.reason === "IAM_PERMISSION_DENIED");
  const authenticationError = error?.code === 16;
  console.error("[transcription-relay]", error);
  response.status(permissionError ? 403 : 503).json({
    code: configurationError
      ? error.code
      : serviceDisabled
        ? "TRANSCRIPTION_API_DISABLED"
      : permissionError
        ? "TRANSCRIPTION_PERMISSION_DENIED"
        : authenticationError
          ? "TRANSCRIPTION_AUTHENTICATION_FAILED"
          : "TRANSCRIPTION_PROVIDER_ERROR",
    message: configurationError
      ? "전사 서버의 Google Cloud 프로젝트 설정이 필요합니다."
      : serviceDisabled
        ? "SmartMaer 프로젝트에서 Google Speech-to-Text API를 활성화해 주세요."
      : permissionError
        ? "전사 서버 계정에 Google Cloud Speech 인식 권한이 없습니다."
        : authenticationError
          ? "전사 서버의 Google Cloud 인증 정보를 확인해 주세요."
          : "음성인식 서비스에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Transcription relay listening on http://localhost:${port}`);
});

import { spawn } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const normalizationTimeoutMs = 15_000;

function transcodeFile(inputPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, [
      "-hide_banner",
      "-loglevel", "error",
      "-i", inputPath,
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-c:a", "flac",
      "-f", "flac",
      "pipe:1",
    ], {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const output = [];
    const errors = [];
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback();
    };
    const timer = setTimeout(() => {
      child.kill();
      finish(() => reject(new Error("Audio normalization timed out.")));
    }, normalizationTimeoutMs);

    child.stdout.on("data", (chunk) => output.push(chunk));
    child.stderr.on("data", (chunk) => errors.push(chunk));
    child.on("error", (error) => finish(() => reject(error)));
    child.on("close", (code) => {
      finish(() => {
        if (code !== 0 || output.length === 0) {
          const detail = Buffer.concat(errors).toString("utf8").trim();
          reject(new Error(detail || "Audio normalization failed."));
          return;
        }
        resolve(Buffer.concat(output));
      });
    });
  });
}

export async function normalizeAudioForTranscription(audioContent, extension = ".audio") {
  const temporaryDirectory = await mkdtemp(path.join(tmpdir(), "ax-stt-"));
  const safeExtension = /^\.[a-z0-9]+$/i.test(extension) ? extension.toLowerCase() : ".audio";
  const inputPath = path.join(temporaryDirectory, `input${safeExtension}`);

  try {
    await writeFile(inputPath, audioContent);
    return await transcodeFile(inputPath);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

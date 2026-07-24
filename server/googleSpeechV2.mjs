import speech from "@google-cloud/speech";

const { v2 } = speech;
let speechClient;

function getClient() {
  speechClient ??= new v2.SpeechClient();
  return speechClient;
}

function averageConfidence(alternatives) {
  const values = alternatives
    .map((alternative) => alternative?.confidence)
    .filter((value) => Number.isFinite(value) && value >= 0);

  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function toTranscriptionResult(response, language) {
  const alternatives = (response.results ?? [])
    .map((result) => result.alternatives?.[0])
    .filter(Boolean);
  const transcript = alternatives
    .map((alternative) => alternative.transcript?.trim())
    .filter(Boolean)
    .join("\n");

  return {
    transcript,
    source: "stt",
    language,
    confidence: averageConfidence(alternatives),
    generatedAt: new Date().toISOString(),
  };
}

export async function transcribeWithGoogle(audioContent) {
  const client = getClient();
  let projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    try {
      projectId = await client.getProjectId();
    } catch {
      const error = new Error("Google Cloud project could not be resolved.");
      error.code = "GOOGLE_PROJECT_NOT_CONFIGURED";
      throw error;
    }
  }

  const location = process.env.GOOGLE_CLOUD_LOCATION || "global";
  const language = process.env.GOOGLE_SPEECH_LANGUAGE || "ko-KR";
  const model = process.env.GOOGLE_SPEECH_MODEL || "long";
  const timeout = Number(process.env.GOOGLE_SPEECH_TIMEOUT_MS || 45_000);
  const [response] = await client.recognize({
    recognizer: `projects/${projectId}/locations/${location}/recognizers/_`,
    config: {
      autoDecodingConfig: {},
      languageCodes: [language],
      model,
      features: {
        enableAutomaticPunctuation: true,
      },
    },
    content: audioContent,
  }, { timeout });
  return toTranscriptionResult(response, language);
}

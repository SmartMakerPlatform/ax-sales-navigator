import type { TranscriptionResult } from "../types/transcript";
import { resolveMockScenario } from "./salesAnalysis";

export interface TranscriptionService {
  transcribe(input: {
    audioFile: File;
    scenarioId?: string;
  }): Promise<TranscriptionResult>;
}

interface TranscriptionErrorResponse {
  code?: string;
  message?: string;
}

export class MockTranscriptionService implements TranscriptionService {
  async transcribe(input: { audioFile: File; scenarioId?: string }): Promise<TranscriptionResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    const scenario = resolveMockScenario(input.audioFile, input.scenarioId);
    return {
      transcript: scenario.transcript,
      source: "mock",
      scenarioId: scenario.id,
      language: "ko",
      confidence: null,
      generatedAt: new Date().toISOString(),
    };
  }
}

function isTranscriptionResult(value: unknown): value is TranscriptionResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<TranscriptionResult>;
  return (
    typeof result.transcript === "string"
    && result.source === "stt"
    && typeof result.generatedAt === "string"
    && (result.confidence === undefined || result.confidence === null || typeof result.confidence === "number")
  );
}

export class GoogleTranscriptionService implements TranscriptionService {
  async transcribe(input: { audioFile: File }): Promise<TranscriptionResult> {
    const body = new FormData();
    body.append("audio", input.audioFile);

    const apiBaseUrl = (import.meta.env.VITE_TRANSCRIPTION_API_BASE_URL ?? "")
      .trim()
      .replace(/\/+$/, "");
    const response = await fetch(`${apiBaseUrl}/api/transcriptions`, {
      method: "POST",
      body,
    });
    const payload: unknown = await response.json().catch(() => undefined);

    if (!response.ok) {
      const error = payload as TranscriptionErrorResponse | undefined;
      throw new Error(error?.message || "음성인식 요청에 실패했습니다.");
    }
    if (!isTranscriptionResult(payload)) {
      throw new Error("전사 서버가 올바르지 않은 결과를 반환했습니다.");
    }
    return payload;
  }
}

export type TranscriptionProvider = "mock" | "google";
export const transcriptionProvider: TranscriptionProvider =
  import.meta.env.VITE_TRANSCRIPTION_PROVIDER === "google" ? "google" : "mock";

export const transcriptionService: TranscriptionService =
  transcriptionProvider === "google"
    ? new GoogleTranscriptionService()
    : new MockTranscriptionService();

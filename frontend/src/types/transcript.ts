export type TranscriptSource = "mock" | "stt" | "user";
export type TranscriptOriginSource = Exclude<TranscriptSource, "user">;
export type TranscriptionStatus = "idle" | "processing" | "ready" | "error";

export interface TranscriptState {
  value: string;
  source: TranscriptSource;
  originSource: TranscriptOriginSource;
  status: TranscriptionStatus;
  isEdited: boolean;
  updatedAt: string;
  error?: string;
}

export interface TranscriptionResult {
  transcript: string;
  source: TranscriptOriginSource;
  scenarioId?: string;
  language?: string;
  confidence?: number | null;
  generatedAt: string;
}

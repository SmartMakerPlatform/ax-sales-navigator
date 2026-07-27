/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYSIS_PROVIDER?: "mock" | "openai" | "api";
  readonly VITE_ANALYSIS_API_BASE_URL?: string;
  readonly VITE_TRANSCRIPTION_PROVIDER?: "mock" | "google";
  readonly VITE_TRANSCRIPTION_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

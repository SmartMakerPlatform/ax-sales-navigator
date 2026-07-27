import type { CallAnalysisResult, RecommendedAction } from "../types/analysis";
import type { TranscriptState } from "../types/transcript";

const KEY = "ax-sales-navigator:workspace";
const VERSION = 4;

export interface SavedWorkspace {
  version: number;
  savedAt: string;
  scenarioId: string;
  transcript: TranscriptState;
  result?: CallAnalysisResult;
  actions: RecommendedAction[];
}

export const saveWorkspace = (data: Omit<SavedWorkspace, "version" | "savedAt">) => {
  const value: SavedWorkspace = { version: VERSION, savedAt: new Date().toISOString(), ...data };
  localStorage.setItem(KEY, JSON.stringify(value));
  return value;
};

export const loadWorkspace = (): SavedWorkspace | null => {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || "null") as SavedWorkspace | null;
    if (
      !value ||
      value.version !== VERSION ||
      !Array.isArray(value.actions) ||
      typeof value.transcript?.value !== "string" ||
      !["mock", "stt", "user"].includes(value.transcript?.source) ||
      !["idle", "processing", "ready", "error"].includes(value.transcript?.status)
    ) {
      localStorage.removeItem(KEY);
      return null;
    }
    return value;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
};

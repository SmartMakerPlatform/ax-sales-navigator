import type { ActionExecutionMode, CallAnalysisResult, RecommendedAction } from "../types/analysis";

export const clampConfidence = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;

export const confidenceText = (value?: number | null) => {
  const normalized = clampConfidence(value);
  return normalized === null ? "확인 필요" : `${Math.round(normalized * 100)}%`;
};

const safeArray = <T,>(value: T[] | null | undefined): T[] => Array.isArray(value) ? value.filter(Boolean) : [];
const modes = new Set(["manual", "draft", "schedule", "record", "research", "custom"]);

const normalizeAction = (action: RecommendedAction, index: number): RecommendedAction => ({
  ...action,
  id: action?.id || `fallback-action-${index + 1}`,
  label: action?.label?.trim() || "업무명 확인 필요",
  instruction: action?.instruction?.trim() || "구체적인 수행 내용을 확인해 주세요.",
  reason: action?.reason?.trim() || "제안 근거를 확인해 주세요.",
  priority: ["high", "medium", "low"].includes(action?.priority) ? action.priority : "medium",
  dueDate: action?.dueDate || null,
  suggestedTiming: action?.suggestedTiming || null,
  evidence: safeArray(action?.evidence),
  requiredInputs: safeArray(action?.requiredInputs),
  executionMode: (modes.has(action?.executionMode) ? action.executionMode : "custom") as ActionExecutionMode,
  confidence: clampConfidence(action?.confidence),
  status: action?.status || "suggested",
  source: action?.source || "ai",
  isModified: Boolean(action?.isModified),
});

export const normalizeAnalysisResult = (raw: CallAnalysisResult): CallAnalysisResult => ({
  analysisId: raw?.analysisId || `analysis-${Date.now()}`,
  summary: raw?.summary?.trim() || "요약 정보가 없어 녹취록을 직접 확인해야 합니다.",
  customerNeeds: safeArray(raw?.customerNeeds),
  objections: safeArray(raw?.objections),
  promises: safeArray(raw?.promises),
  itemsToVerify: safeArray(raw?.itemsToVerify),
  salesStage: {
    code: raw?.salesStage?.code || null,
    label: raw?.salesStage?.label?.trim() || "확인 필요",
    reason: raw?.salesStage?.reason?.trim() || "영업 단계 판단 근거가 충분하지 않습니다.",
    confidence: clampConfidence(raw?.salesStage?.confidence),
  },
  recommendedActions: safeArray(raw?.recommendedActions).map(normalizeAction),
  warnings: safeArray(raw?.warnings),
  analyzedAt: raw?.analyzedAt || new Date().toISOString(),
});

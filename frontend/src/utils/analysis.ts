import type {
  ActionExecutionMode,
  AnalysisEvidence,
  AnalysisItem,
  CallAnalysisResult,
  MockAnalysisResultInput,
  RecommendedAction,
  SalesStageCode,
} from "../types/analysis";

export const clampConfidence = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : null;

export const confidenceText = (value?: number | null) => {
  const normalized = clampConfidence(value);
  return normalized === null ? "확인 필요" : `${Math.round(normalized * 100)}%`;
};

const safeArray = <T,>(value: T[] | null | undefined): T[] => Array.isArray(value) ? value.filter(Boolean) : [];
const modes = new Set(["manual", "draft", "schedule", "record", "research", "custom"]);
const stageCodes = new Set<SalesStageCode>([
  "initial_contact",
  "interest_confirmed",
  "requirements_identified",
  "materials_requested",
  "proposal_review",
  "condition_negotiation",
  "internal_approval",
  "on_hold",
  "rejected",
  "unknown",
]);

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

const normalizeEvidence = (value?: AnalysisEvidence[]) =>
  safeArray(value).map((item) => ({
    speaker: ["salesperson", "customer", "unknown"].includes(item?.speaker) ? item.speaker : "unknown",
    quote: item?.quote?.trim() || "",
  })).filter((item) => item.quote);

const normalizeItem = (value: string | AnalysisItem): AnalysisItem =>
  typeof value === "string"
    ? { text: value.trim(), evidence: [], confidence: 1 }
    : {
        text: value?.text?.trim() || "확인 필요",
        evidence: normalizeEvidence(value?.evidence),
        confidence: clampConfidence(value?.confidence) ?? 0,
      };

export const normalizeRecommendedActions = (actions?: RecommendedAction[]) =>
  safeArray(actions).map(normalizeAction);

export const normalizeAnalysisResult = (raw: CallAnalysisResult | MockAnalysisResultInput): CallAnalysisResult => ({
  analysisId: raw?.analysisId || `analysis-${Date.now()}`,
  summary: raw?.summary?.trim() || "확인 필요",
  customerNeeds: safeArray(raw?.customerNeeds).map(normalizeItem).filter((item) => item.text),
  objections: safeArray(raw?.objections).map(normalizeItem).filter((item) => item.text),
  promises: safeArray(raw?.promises).map((item) => ({
    owner: ["salesperson", "customer", "unknown"].includes(item?.owner) ? item.owner : "unknown",
    description: item?.description?.trim() || "확인 필요",
    dueDate: item?.dueDate || null,
    evidence: normalizeEvidence(item?.evidence),
    confidence: clampConfidence(item?.confidence) ?? 1,
  })),
  itemsToVerify: safeArray(raw?.itemsToVerify).map(normalizeItem).filter((item) => item.text),
  salesStage: {
    code: stageCodes.has(raw?.salesStage?.code as SalesStageCode)
      ? raw.salesStage.code as SalesStageCode
      : "unknown",
    label: raw?.salesStage?.label?.trim() || "확인 필요",
    reason: raw?.salesStage?.reason?.trim() || "영업 단계 판단 근거가 충분하지 않습니다.",
    confidence: clampConfidence(raw?.salesStage?.confidence) ?? 0,
    evidence: normalizeEvidence(raw?.salesStage?.evidence),
  },
  recommendedActions: normalizeRecommendedActions(raw?.recommendedActions),
  warnings: safeArray(raw?.warnings),
  analyzedAt: raw?.analyzedAt || new Date().toISOString(),
  provider: raw?.provider === "openai" ? "openai" : "mock",
  model: raw?.model?.trim() || (raw?.provider === "openai" ? "unknown" : "scenario-fixture"),
});

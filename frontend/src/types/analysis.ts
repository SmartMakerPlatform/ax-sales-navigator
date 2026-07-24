export type Priority = "high" | "medium" | "low";
export type ActionStatus = "suggested" | "selected" | "approved" | "deferred" | "completed";
export type ActionExecutionMode = "manual" | "draft" | "schedule" | "record" | "research" | "custom";

export interface Evidence {
  speaker: "salesperson" | "customer" | "unknown";
  quote: string;
}

export interface RecommendedAction {
  id: string;
  label: string;
  instruction: string;
  reason: string;
  priority: Priority;
  dueDate?: string | null;
  suggestedTiming?: string | null;
  evidence?: Evidence[];
  requiredInputs?: string[];
  expectedOutcome?: string;
  executionMode: ActionExecutionMode;
  confidence: number;
  status: ActionStatus;
}

export interface PromiseItem {
  owner: "salesperson" | "customer" | "unknown";
  description: string;
  dueDate?: string | null;
}

export interface CallAnalysisResult {
  analysisId: string;
  summary: string;
  customerNeeds: string[];
  objections: string[];
  promises: PromiseItem[];
  itemsToVerify: string[];
  salesStage: { code: string; label: string; reason: string; confidence: number };
  recommendedActions: RecommendedAction[];
  warnings: string[];
  analyzedAt: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  transcript: string;
  result: CallAnalysisResult;
}

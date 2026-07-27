export type Priority = "high" | "medium" | "low";
export type ActionStatus = "suggested" | "selected" | "approved" | "deferred" | "rejected" | "completed";
export type ActionExecutionMode = "manual" | "draft" | "schedule" | "record" | "research" | "custom" | (string & {});
export type ActionSource = "ai" | "user";
export type AnalysisProvider = "mock" | "openai";
export type SalesStageCode =
  | "initial_contact"
  | "interest_confirmed"
  | "requirements_identified"
  | "materials_requested"
  | "proposal_review"
  | "condition_negotiation"
  | "internal_approval"
  | "on_hold"
  | "rejected"
  | "unknown";

export interface AnalysisEvidence {
  speaker: "salesperson" | "customer" | "unknown";
  quote: string;
}

export type Evidence = AnalysisEvidence;

export interface AnalysisItem {
  text: string;
  evidence: AnalysisEvidence[];
  confidence: number;
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
  confidence?: number | null;
  status: ActionStatus;
  source?: ActionSource;
  isModified?: boolean;
}

export interface PromiseItem {
  owner: "salesperson" | "customer" | "unknown";
  description: string;
  dueDate: string | null;
  evidence: AnalysisEvidence[];
  confidence: number;
}

export interface SalesStageAnalysis {
  code: SalesStageCode;
  label: string;
  reason: string;
  confidence: number;
  evidence: AnalysisEvidence[];
}

export interface CallAnalysisResult {
  analysisId: string;
  summary: string;
  customerNeeds: AnalysisItem[];
  objections: AnalysisItem[];
  promises: PromiseItem[];
  itemsToVerify: AnalysisItem[];
  salesStage: SalesStageAnalysis;
  recommendedActions: RecommendedAction[];
  warnings: string[];
  analyzedAt: string;
  provider: AnalysisProvider;
  model: string;
}

export interface MockAnalysisResultInput {
  analysisId: string;
  summary: string;
  customerNeeds: Array<string | AnalysisItem>;
  objections: Array<string | AnalysisItem>;
  promises: Array<Partial<PromiseItem> & Pick<PromiseItem, "owner" | "description">>;
  itemsToVerify: Array<string | AnalysisItem>;
  salesStage: {
    code?: string | null;
    label?: string | null;
    reason?: string | null;
    confidence?: number | null;
    evidence?: AnalysisEvidence[];
  };
  recommendedActions: RecommendedAction[];
  warnings: string[];
  analyzedAt: string;
  provider?: "mock";
  model?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  transcript: string;
  result: MockAnalysisResultInput;
  fileAliases?: string[];
  mockBehavior?: "success" | "failure";
}

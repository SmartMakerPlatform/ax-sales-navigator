import { scenarios } from "../mocks/scenarios";
import type { CallAnalysisResult, Scenario } from "../types/analysis";
import { normalizeAnalysisResult } from "../utils/analysis";

export interface SalesAnalysisService {
  analyzeCall(input: { transcript: string }): Promise<CallAnalysisResult>;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const successScenarios = scenarios.filter((scenario) => scenario.mockBehavior !== "failure");

export const resolveMockScenario = (file?: File, scenarioId?: string): Scenario => {
  if (!file) return scenarios.find((item) => item.id === scenarioId) ?? scenarios[0];
  const normalizedName = file.name.toLocaleLowerCase();
  const aliased = scenarios.find((scenario) =>
    scenario.fileAliases?.some((alias) => normalizedName.includes(alias.toLocaleLowerCase())),
  );
  if (aliased) return aliased;

  const fingerprint = `${normalizedName}:${file.size}:${file.lastModified}`;
  const hash = [...fingerprint].reduce((total, char) => ((total * 31) + char.charCodeAt(0)) >>> 0, 0);
  return successScenarios[hash % successScenarios.length];
};

const transcriptTokens = (value: string) =>
  new Set(value.toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((item) => item.length >= 2));

const resolveMockAnalysisScenario = (transcript: string) => {
  const inputTokens = transcriptTokens(transcript);
  return successScenarios
    .map((scenario) => ({
      scenario,
      score: [...transcriptTokens(scenario.transcript)].filter((token) => inputTokens.has(token)).length,
    }))
    .sort((left, right) => right.score - left.score)[0]?.scenario ?? successScenarios[0];
};

export class MockSalesAnalysisService implements SalesAnalysisService {
  async analyzeCall(input: { transcript: string }) {
    await new Promise((resolve) => window.setTimeout(resolve, 1300));
    if (!input.transcript.trim()) throw new Error("분석할 녹취록을 입력해 주세요.");
    const scenario = resolveMockAnalysisScenario(input.transcript);
    if (scenario.mockBehavior === "failure") {
      throw new Error("통화 분석 중 오류가 발생했습니다. 녹취록을 확인한 후 다시 시도해 주세요.");
    }
    const result = normalizeAnalysisResult(clone(scenario.result));
    if (input.transcript.trim().length < 40) {
      result.warnings = [...result.warnings, "녹취록이 너무 짧아 정확한 업무 제안이 어려울 수 있습니다."];
    }
    return result;
  }
}

interface AnalysisErrorResponse {
  code?: string;
  message?: string;
}

function isCallAnalysisResult(value: unknown): value is CallAnalysisResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<CallAnalysisResult>;
  return (
    typeof result.analysisId === "string"
    && typeof result.summary === "string"
    && result.provider === "openai"
    && typeof result.model === "string"
    && Array.isArray(result.customerNeeds)
    && Array.isArray(result.objections)
    && Array.isArray(result.promises)
    && Array.isArray(result.itemsToVerify)
    && Array.isArray(result.warnings)
  );
}

export class OpenAISalesAnalysisService implements SalesAnalysisService {
  async analyzeCall(input: { transcript: string }) {
    const apiBaseUrl = (import.meta.env.VITE_ANALYSIS_API_BASE_URL ?? "")
      .trim()
      .replace(/\/+$/, "");
    const response = await fetch(`${apiBaseUrl}/api/analyses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: input.transcript }),
    });
    const payload: unknown = await response.json().catch(() => undefined);
    if (!response.ok) {
      const error = payload as AnalysisErrorResponse | undefined;
      throw new Error(error?.message || "AI 분석 서비스에 연결하지 못했습니다.");
    }
    if (!isCallAnalysisResult(payload)) {
      throw new Error("분석 서버가 올바르지 않은 결과를 반환했습니다.");
    }
    return normalizeAnalysisResult(payload);
  }
}

export type AnalysisProvider = "mock" | "openai";
export const analysisProvider: AnalysisProvider =
  ["openai", "api"].includes(import.meta.env.VITE_ANALYSIS_PROVIDER ?? "") ? "openai" : "mock";

export const analysisService: SalesAnalysisService =
  analysisProvider === "openai"
    ? new OpenAISalesAnalysisService()
    : new MockSalesAnalysisService();

import { scenarios } from "../mocks/scenarios";
import type { CallAnalysisResult, Scenario } from "../types/analysis";
import { normalizeAnalysisResult } from "../utils/analysis";

export interface SalesAnalysisService {
  analyzeCall(input: { audioFile?: File; transcript: string; scenarioId?: string }): Promise<CallAnalysisResult>;
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

export class MockSalesAnalysisService implements SalesAnalysisService {
  async analyzeCall(input: { audioFile?: File; transcript: string; scenarioId?: string }) {
    await new Promise((resolve) => window.setTimeout(resolve, 1300));
    if (!input.transcript.trim()) throw new Error("분석할 녹취록을 입력해 주세요.");
    const scenario = resolveMockScenario(input.audioFile, input.scenarioId);
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

export class ApiSalesAnalysisService implements SalesAnalysisService {
  async analyzeCall(input: { audioFile?: File; transcript: string }) {
    const form = new FormData();
    if (input.audioFile) form.append("audio", input.audioFile);
    form.append("transcript", input.transcript);
    const response = await fetch("/api/calls/analyze", { method: "POST", body: form });
    if (!response.ok) throw new Error("통화 분석 요청에 실패했습니다.");
    return response.json() as Promise<CallAnalysisResult>;
  }
}

export const analysisService: SalesAnalysisService =
  import.meta.env.VITE_ANALYSIS_PROVIDER === "api"
    ? new ApiSalesAnalysisService()
    : new MockSalesAnalysisService();

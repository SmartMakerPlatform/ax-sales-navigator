import { scenarios } from "../mocks/scenarios";
import type { CallAnalysisResult } from "../types/analysis";

export interface SalesAnalysisService {
  analyzeCall(input: { audioFile?: File; transcript: string; scenarioId?: string }): Promise<CallAnalysisResult>;
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export class MockSalesAnalysisService implements SalesAnalysisService {
  async analyzeCall(input: { audioFile?: File; transcript: string; scenarioId?: string }) {
    await new Promise((resolve) => window.setTimeout(resolve, 1300));
    if (!input.transcript.trim()) throw new Error("분석할 녹취록을 입력해 주세요.");
    const scenario = scenarios.find((item) => item.id === input.scenarioId) ?? scenarios[0];
    return clone(scenario.result);
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

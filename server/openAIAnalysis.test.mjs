import assert from "node:assert/strict";
import test from "node:test";
import { createOpenAIAnalysisService, mapOpenAIError } from "./openAIAnalysis.mjs";

const transcript = "고객: 내부 검토용 과정안을 보내주세요. 담당자: 내일까지 전달하겠습니다.";

const structured = {
  summary: "고객이 내부 검토용 과정안을 요청했고 담당자는 내일까지 전달하기로 했다.",
  salesStage: {
    code: "materials_requested",
    label: "임의 라벨",
    reason: "고객이 자료를 요청했다.",
    confidence: 0.94,
    evidence: [{ speaker: "customer", quote: "내부 검토용 과정안을 보내주세요." }],
  },
  customerNeeds: [{
    text: "내부 검토용 과정안",
    evidence: [{ speaker: "customer", quote: "내부 검토용 과정안을 보내주세요." }],
    confidence: 0.96,
  }],
  objections: [],
  promises: [{
    owner: "salesperson",
    description: "내일까지 과정안 전달",
    dueDate: null,
    evidence: [{ speaker: "salesperson", quote: "내일까지 전달하겠습니다." }],
    confidence: 0.92,
  }],
  itemsToVerify: [],
  warnings: ["내일의 절대 날짜는 확인할 수 없습니다."],
};

test("OpenAI success is transformed without exposing provider response fields", async () => {
  const client = {
    responses: {
      create: async () => ({
        output_text: JSON.stringify(structured),
        output: [],
        status: "completed",
        _request_id: "req-test",
        internal: "must-not-reach-ui",
      }),
    },
  };
  const service = createOpenAIAnalysisService({ client, model: "test-model" });
  const result = await service.analyze(transcript);
  assert.equal(result.provider, "openai");
  assert.equal(result.model, "test-model");
  assert.equal(result.salesStage.label, "자료 요청");
  assert.equal("internal" in result, false);
  assert.equal("recommendedActions" in result, false);
});

test("malformed OpenAI text is reported as invalid structured output", async () => {
  const client = { responses: { create: async () => ({ output_text: "{broken", output: [] }) } };
  const service = createOpenAIAnalysisService({ client });
  await assert.rejects(() => service.analyze(transcript), { code: "ANALYSIS_INVALID_OUTPUT" });
});

test("OpenAI authentication errors are mapped to a safe configuration message", () => {
  const error = mapOpenAIError({ name: "AuthenticationError", status: 401 });
  assert.equal(error.code, "OPENAI_CONFIGURATION_ERROR");
  assert.equal(error.message, "분석 서버의 OpenAI 설정을 확인해 주세요.");
});

test("OpenAI timeouts are mapped to a retryable timeout message", () => {
  const error = mapOpenAIError({ name: "APIConnectionTimeoutError" });
  assert.equal(error.code, "ANALYSIS_TIMEOUT");
  assert.equal(error.status, 504);
});

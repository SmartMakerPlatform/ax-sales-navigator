import assert from "node:assert/strict";
import test from "node:test";
import {
  AnalysisError,
  salesStageLabels,
  validateAndNormalizeAnalysis,
  validateTranscript,
} from "./analysisContract.mjs";

const expectCode = (callback, code) => assert.throws(callback, (error) =>
  error instanceof AnalysisError && error.code === code);

test("transcript validation accepts a normal Korean sales call", () => {
  assert.equal(
    validateTranscript("고객은 내부 검토를 위해 과정안과 견적을 보내 달라고 요청했습니다."),
    "고객은 내부 검토를 위해 과정안과 견적을 보내 달라고 요청했습니다.",
  );
});

test("transcript validation rejects missing, blank, short, and long values", () => {
  expectCode(() => validateTranscript(undefined), "TRANSCRIPT_REQUIRED");
  expectCode(() => validateTranscript("   "), "TRANSCRIPT_REQUIRED");
  expectCode(() => validateTranscript("너무 짧음"), "TRANSCRIPT_TOO_SHORT");
  expectCode(() => validateTranscript("가".repeat(31), { maxLength: 30 }), "TRANSCRIPT_TOO_LONG");
});

test("analysis normalization fixes stage labels and removes unmatched evidence", () => {
  const transcript = "고객: 내부 검토용 과정안을 보내주세요.";
  const result = validateAndNormalizeAnalysis({
    summary: "고객이 과정안을 요청했다.",
    salesStage: {
      code: "materials_requested",
      label: "모델이 만든 잘못된 라벨",
      reason: "자료를 요청했다.",
      confidence: 0.9,
      evidence: [{ speaker: "customer", quote: "내부 검토용 과정안을 보내주세요." }],
    },
    customerNeeds: [{
      text: "과정안 요청",
      evidence: [{ speaker: "customer", quote: "녹취록에 없는 문장" }],
      confidence: 0.9,
    }],
    objections: [],
    promises: [],
    itemsToVerify: [],
    warnings: [""],
  }, transcript);

  assert.equal(result.salesStage.label, salesStageLabels.materials_requested);
  assert.equal(result.customerNeeds[0].evidence.length, 0);
  assert.deepEqual(result.warnings, []);
});

test("malformed structured output is rejected", () => {
  expectCode(
    () => validateAndNormalizeAnalysis({ summary: "요약" }, "충분히 긴 테스트 녹취록입니다. 고객이 자료를 요청했습니다."),
    "ANALYSIS_INVALID_OUTPUT",
  );
});

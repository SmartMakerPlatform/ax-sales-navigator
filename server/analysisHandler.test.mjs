import assert from "node:assert/strict";
import test from "node:test";
import {
  createAnalysisHandler,
  isRequestBodyTooLargeError,
} from "./analysisHandler.mjs";

function invoke(handler, body) {
  return new Promise((resolve) => {
    let payload;
    handler(
      { body },
      { json(value) { payload = value; resolve({ payload }); } },
      (error) => resolve({ error }),
    );
  });
}

test("valid analysis request passes only the current transcript to the service", async () => {
  let received;
  const handler = createAnalysisHandler({
    analyze: async (transcript) => {
      received = transcript;
      return { analysisId: "analysis-test" };
    },
  });
  const transcript = "고객이 내부 검토용 과정안을 보내 달라고 요청한 실제 녹취록입니다.";
  const { payload } = await invoke(handler, { transcript });
  assert.equal(received, transcript);
  assert.equal(payload.analysisId, "analysis-test");
});

test("invalid analysis request never calls the provider", async () => {
  let called = false;
  const handler = createAnalysisHandler({ analyze: async () => { called = true; } });
  const { error } = await invoke(handler, { transcript: "짧음" });
  assert.equal(called, false);
  assert.equal(error.code, "TRANSCRIPT_TOO_SHORT");
});

test("Express payload limit errors are recognized", () => {
  assert.equal(
    isRequestBodyTooLargeError({ type: "entity.too.large", status: 413 }),
    true,
  );
  assert.equal(isRequestBodyTooLargeError(new Error("other")), false);
});

import assert from "node:assert/strict";
import test from "node:test";
import { toTranscriptionResult } from "./googleSpeechV2.mjs";

test("Google V2 response is reduced to the shared TranscriptionResult shape", () => {
  const result = toTranscriptionResult({
    results: [
      { alternatives: [{ transcript: "첫 번째 문장입니다.", confidence: 0.9 }] },
      { alternatives: [{ transcript: "두 번째 문장입니다.", confidence: 0.7 }] },
    ],
    metadata: { requestId: "must-not-reach-ui" },
  }, "ko-KR");

  assert.equal(result.transcript, "첫 번째 문장입니다.\n두 번째 문장입니다.");
  assert.equal(result.source, "stt");
  assert.equal(result.language, "ko-KR");
  assert.equal(result.confidence, 0.8);
  assert.equal("results" in result, false);
  assert.equal("metadata" in result, false);
  assert.deepEqual(Object.keys(result).sort(), [
    "confidence",
    "generatedAt",
    "language",
    "source",
    "transcript",
  ]);
});

export const salesStageLabels = Object.freeze({
  initial_contact: "초기 접촉",
  interest_confirmed: "관심 확인",
  requirements_identified: "요구사항 확인",
  materials_requested: "자료 요청",
  proposal_review: "제안 검토",
  condition_negotiation: "조건 협의",
  internal_approval: "내부 결재",
  on_hold: "보류",
  rejected: "거절",
  unknown: "확인 필요",
});

const stageCodes = new Set(Object.keys(salesStageLabels));
const speakers = new Set(["salesperson", "customer", "unknown"]);
const owners = new Set(["salesperson", "customer", "unknown"]);
const priorities = new Set(["high", "medium", "low"]);
const executionModes = new Set(["manual", "draft", "schedule", "record", "research", "custom"]);

export class AnalysisError extends Error {
  constructor(status, code, message, cause) {
    super(message, cause ? { cause } : undefined);
    this.name = "AnalysisError";
    this.status = status;
    this.code = code;
  }
}

const evidenceSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    speaker: { type: "string", enum: [...speakers] },
    quote: { type: "string", minLength: 1, maxLength: 240 },
  },
  required: ["speaker", "quote"],
};

const analysisItemSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    text: { type: "string", minLength: 1 },
    evidence: { type: "array", items: evidenceSchema },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: ["text", "evidence", "confidence"],
};

const recommendedActionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    label: { type: "string", minLength: 1, maxLength: 100 },
    instruction: { type: "string", minLength: 1, maxLength: 500 },
    reason: { type: "string", minLength: 1, maxLength: 300 },
    priority: { type: "string", enum: [...priorities] },
    dueDate: { type: ["string", "null"] },
    suggestedTiming: { type: ["string", "null"] },
    evidence: { type: "array", minItems: 1, maxItems: 3, items: evidenceSchema },
    requiredInputs: {
      type: "array",
      maxItems: 8,
      items: { type: "string", minLength: 1, maxLength: 120 },
    },
    expectedOutcome: { type: "string", minLength: 1, maxLength: 300 },
    executionMode: { type: "string", enum: [...executionModes] },
    confidence: { type: "number", minimum: 0, maximum: 1 },
  },
  required: [
    "label",
    "instruction",
    "reason",
    "priority",
    "dueDate",
    "suggestedTiming",
    "evidence",
    "requiredInputs",
    "expectedOutcome",
    "executionMode",
    "confidence",
  ],
};

export const callAnalysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    salesStage: {
      type: "object",
      additionalProperties: false,
      properties: {
        code: { type: "string", enum: [...stageCodes] },
        label: { type: "string" },
        reason: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 1 },
        evidence: { type: "array", items: evidenceSchema },
      },
      required: ["code", "label", "reason", "confidence", "evidence"],
    },
    customerNeeds: { type: "array", items: analysisItemSchema },
    objections: { type: "array", items: analysisItemSchema },
    promises: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          owner: { type: "string", enum: [...owners] },
          description: { type: "string", minLength: 1 },
          dueDate: { type: ["string", "null"] },
          evidence: { type: "array", items: evidenceSchema },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["owner", "description", "dueDate", "evidence", "confidence"],
      },
    },
    itemsToVerify: { type: "array", items: analysisItemSchema },
    recommendedActions: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: recommendedActionSchema,
    },
    warnings: { type: "array", items: { type: "string", minLength: 1 } },
  },
  required: [
    "summary",
    "salesStage",
    "customerNeeds",
    "objections",
    "promises",
    "itemsToVerify",
    "recommendedActions",
    "warnings",
  ],
};

export function validateTranscript(value, options = {}) {
  const minLength = Number(options.minLength ?? 20);
  const maxLength = Number(options.maxLength ?? 30_000);
  if (typeof value !== "string" || !value.trim()) {
    throw new AnalysisError(400, "TRANSCRIPT_REQUIRED", "분석할 녹취록을 입력해 주세요.");
  }
  const transcript = value.trim();
  if (transcript.length < minLength) {
    throw new AnalysisError(422, "TRANSCRIPT_TOO_SHORT", "녹취록이 너무 짧아 통화 내용을 분석하기 어렵습니다.");
  }
  if (transcript.length > maxLength) {
    throw new AnalysisError(413, "TRANSCRIPT_TOO_LONG", "녹취록이 분석 가능한 최대 길이를 초과했습니다.");
  }
  return transcript;
}

const cleanString = (value) => typeof value === "string" ? value.trim() : "";
const normalizeForEvidence = (value) => cleanString(value).replace(/\s+/g, " ");
const validConfidence = (value) => typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 1;

function requireObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", `OpenAI 분석 결과의 ${name} 구조가 올바르지 않습니다.`);
  }
  return value;
}

function sanitizeEvidence(value, transcript) {
  if (!Array.isArray(value)) {
    throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "OpenAI 분석 근거 구조가 올바르지 않습니다.");
  }
  const normalizedTranscript = normalizeForEvidence(transcript);
  return value.flatMap((entry) => {
    const item = requireObject(entry, "evidence");
    const quote = cleanString(item.quote);
    if (!quote || quote.length > 240 || !normalizedTranscript.includes(normalizeForEvidence(quote))) return [];
    return [{ speaker: speakers.has(item.speaker) ? item.speaker : "unknown", quote }];
  });
}

function sanitizeAnalysisItems(value, transcript, name) {
  if (!Array.isArray(value)) {
    throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", `OpenAI 분석 결과의 ${name} 배열이 올바르지 않습니다.`);
  }
  return value.flatMap((entry) => {
    const item = requireObject(entry, name);
    const text = cleanString(item.text);
    if (!text) return [];
    if (!validConfidence(item.confidence)) {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", `${name}의 신뢰도 값이 올바르지 않습니다.`);
    }
    return [{
      text,
      evidence: sanitizeEvidence(item.evidence, transcript),
      confidence: item.confidence,
    }];
  });
}

function sanitizeRecommendedActions(value, transcript) {
  if (!Array.isArray(value) || value.length < 3 || value.length > 4) {
    throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "추천 업무는 3개에서 4개여야 합니다.");
  }
  return value.map((entry, index) => {
    const item = requireObject(entry, "recommendedActions");
    const label = cleanString(item.label);
    const instruction = cleanString(item.instruction);
    const reason = cleanString(item.reason);
    const expectedOutcome = cleanString(item.expectedOutcome);
    const suggestedTiming = cleanString(item.suggestedTiming) || null;
    if (!label || !instruction || !reason || !expectedOutcome) {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "추천 업무의 필수 문구가 비어 있습니다.");
    }
    if (!priorities.has(item.priority) || !executionModes.has(item.executionMode) || !validConfidence(item.confidence)) {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "추천 업무의 우선순위, 실행 방식 또는 신뢰도가 올바르지 않습니다.");
    }
    if (item.dueDate !== null && typeof item.dueDate !== "string") {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "추천 업무의 기한 값이 올바르지 않습니다.");
    }
    const dueDate = cleanString(item.dueDate) || null;
    if (!dueDate && !suggestedTiming) {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "추천 업무의 실행 시점을 확인할 수 없습니다.");
    }
    if (!Array.isArray(item.requiredInputs)) {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "추천 업무의 필요 자료 구조가 올바르지 않습니다.");
    }
    const evidence = sanitizeEvidence(item.evidence, transcript);
    if (evidence.length === 0) {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "추천 업무의 녹취 근거를 확인할 수 없습니다.");
    }
    return {
      id: `action-${index + 1}`,
      label,
      instruction,
      reason,
      priority: item.priority,
      dueDate,
      suggestedTiming,
      evidence,
      requiredInputs: item.requiredInputs.map(cleanString).filter(Boolean),
      expectedOutcome,
      executionMode: item.executionMode,
      confidence: item.confidence,
      status: "suggested",
      source: "ai",
      isModified: false,
    };
  });
}

export function validateAndNormalizeAnalysis(value, transcript) {
  const raw = requireObject(value, "root");
  const salesStage = requireObject(raw.salesStage, "salesStage");
  if (!stageCodes.has(salesStage.code) || !validConfidence(salesStage.confidence)) {
    throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "영업 단계 또는 신뢰도 값이 올바르지 않습니다.");
  }
  if (!Array.isArray(raw.promises) || !Array.isArray(raw.warnings)) {
    throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "약속 또는 경고 배열이 올바르지 않습니다.");
  }

  const promises = raw.promises.flatMap((entry) => {
    const item = requireObject(entry, "promises");
    const description = cleanString(item.description);
    if (!description) return [];
    if (!validConfidence(item.confidence)) {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "약속의 신뢰도 값이 올바르지 않습니다.");
    }
    if (item.dueDate !== null && typeof item.dueDate !== "string") {
      throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "약속의 기한 값이 올바르지 않습니다.");
    }
    return [{
      owner: owners.has(item.owner) ? item.owner : "unknown",
      description,
      dueDate: cleanString(item.dueDate) || null,
      evidence: sanitizeEvidence(item.evidence, transcript),
      confidence: item.confidence,
    }];
  });

  return {
    summary: cleanString(raw.summary) || "확인 필요",
    salesStage: {
      code: salesStage.code,
      label: salesStageLabels[salesStage.code],
      reason: cleanString(salesStage.reason) || "판단 근거를 확인해 주세요.",
      confidence: salesStage.confidence,
      evidence: sanitizeEvidence(salesStage.evidence, transcript),
    },
    customerNeeds: sanitizeAnalysisItems(raw.customerNeeds, transcript, "customerNeeds"),
    objections: sanitizeAnalysisItems(raw.objections, transcript, "objections"),
    promises,
    itemsToVerify: sanitizeAnalysisItems(raw.itemsToVerify, transcript, "itemsToVerify"),
    recommendedActions: sanitizeRecommendedActions(raw.recommendedActions, transcript),
    warnings: raw.warnings.map(cleanString).filter(Boolean),
  };
}

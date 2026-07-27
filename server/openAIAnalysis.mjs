import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import {
  AnalysisError,
  callAnalysisJsonSchema,
  validateAndNormalizeAnalysis,
} from "./analysisContract.mjs";

export const analysisInstructions = `당신은 한국어 B2B 영업 통화 녹취록을 구조화하는 분석 보조자다.

- 녹취록에 직접 포함된 사실만 사용하고 사실과 추론을 구분한다.
- 이름, 조직, 날짜, 금액, 약속, 요구사항을 임의로 만들지 않는다.
- customerNeeds에는 고객이 명시적으로 말한 요구만 넣는다.
- objections에는 우려, 거절, 내부 제약을 넣는다.
- promises에는 누가 무엇을 하기로 했는지 기록한다.
- 중요하지만 없거나 불확실한 정보는 itemsToVerify에 넣는다.
- evidence.quote는 녹취록에 실제로 존재하는 짧은 원문을 그대로 인용한다.
- 상대 날짜가 모호하면 임의의 ISO 날짜로 바꾸지 말고 dueDate를 null로 둔다.
- confidence는 0과 1 사이 숫자다.
- 화자가 불명확하면 unknown을 사용한다.
- 정보가 부족하면 영업 단계는 unknown으로 두고 확인 항목을 우선한다.
- recommendedActions에는 이 통화에 맞는 후속 업무를 3개에서 4개 제안한다.
- 업무명은 미리 정해진 목록에서 고르지 말고 통화 내용에 맞게 자유롭게 작성한다.
- 각 업무는 담당자가 바로 수행할 수 있을 정도로 구체적으로 작성하고, 제안 이유와 통화 원문 근거를 포함한다.
- 통화에서 날짜나 기한이 명시되면 dueDate에 기록하고, 명시되지 않았으면 dueDate는 null로 두고 suggestedTiming에 권장 시점을 제안한다.
- 사실을 임의로 만들지 말고, 확신이 낮으면 확인 업무를 우선 제안한다.
- 사용자의 승인 전에는 이메일 발송이나 일정 등록이 완료된 것처럼 표현하지 않는다.
- executionMode는 향후 기능 연결을 위한 힌트일 뿐이며 실제 실행을 의미하지 않는다.
- 분석 결과와 recommendedActions는 반드시 이번 한 번의 응답에 함께 포함한다.
- 지정된 JSON Schema를 정확히 따른다.`;

function findRefusal(response) {
  for (const output of response?.output ?? []) {
    if (output?.type !== "message") continue;
    for (const content of output.content ?? []) {
      if (content?.type === "refusal") return content.refusal || "refused";
    }
  }
  return null;
}

export function mapOpenAIError(error) {
  if (error instanceof AnalysisError) return error;
  const status = Number(error?.status);
  const code = error?.code;
  const name = error?.name;

  if (name === "APIConnectionTimeoutError" || name === "AbortError" || code === "ETIMEDOUT") {
    return new AnalysisError(504, "ANALYSIS_TIMEOUT", "분석 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.", error);
  }
  if (name === "AuthenticationError" || status === 401) {
    return new AnalysisError(503, "OPENAI_CONFIGURATION_ERROR", "분석 서버의 OpenAI 설정을 확인해 주세요.", error);
  }
  if (name === "RateLimitError" || status === 429 || code === "insufficient_quota") {
    return new AnalysisError(429, "AI_USAGE_LIMIT_EXCEEDED", "현재 AI 분석 사용 한도를 초과했습니다.", error);
  }
  if (status === 403 || status === 404 || code === "model_not_found") {
    return new AnalysisError(503, "OPENAI_MODEL_UNAVAILABLE", "분석 서버의 OpenAI 설정을 확인해 주세요.", error);
  }
  if (name === "BadRequestError" || status === 400) {
    return new AnalysisError(502, "OPENAI_REQUEST_INVALID", "AI 분석 요청 형식을 확인해 주세요.", error);
  }
  return new AnalysisError(503, "OPENAI_PROVIDER_ERROR", "AI 분석 서비스에 연결하지 못했습니다.", error);
}

export function createOpenAIAnalysisService(options = {}) {
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model = options.model ?? process.env.OPENAI_ANALYSIS_MODEL ?? "gpt-5-mini";
  const timeout = Number(options.timeout ?? process.env.OPENAI_ANALYSIS_TIMEOUT_MS ?? 45_000);
  const client = options.client ?? (apiKey ? new OpenAI({ apiKey, timeout }) : null);

  return {
    model,
    async analyze(transcript) {
      if (!client) {
        throw new AnalysisError(503, "OPENAI_CONFIGURATION_ERROR", "분석 서버의 OpenAI 설정을 확인해 주세요.");
      }
      const analysisId = `analysis-${randomUUID()}`;
      try {
        const response = await client.responses.create({
          model,
          input: [
            { role: "system", content: analysisInstructions },
            { role: "user", content: `다음 녹취록을 분석하세요.\n\n<transcript>\n${transcript}\n</transcript>` },
          ],
          reasoning: { effort: "minimal" },
          text: {
            format: {
              type: "json_schema",
              name: "call_analysis",
              strict: true,
              schema: callAnalysisJsonSchema,
            },
          },
        }, { timeout });

        if (findRefusal(response)) {
          throw new AnalysisError(422, "ANALYSIS_REFUSED", "이 녹취록은 AI 분석을 완료할 수 없습니다.");
        }
        if (response?.status === "incomplete") {
          throw new AnalysisError(502, "ANALYSIS_INCOMPLETE", "AI 분석 결과를 완성하지 못했습니다.");
        }

        let parsed;
        try {
          parsed = JSON.parse(response?.output_text ?? "");
        } catch (error) {
          throw new AnalysisError(502, "ANALYSIS_INVALID_OUTPUT", "AI 분석 결과 형식이 올바르지 않습니다.", error);
        }
        const normalized = validateAndNormalizeAnalysis(parsed, transcript);
        console.log(`[analysis] completed analysisId=${analysisId} transcriptLength=${transcript.length} requestId=${response?._request_id ?? "unknown"}`);
        return {
          analysisId,
          ...normalized,
          analyzedAt: new Date().toISOString(),
          provider: "openai",
          model,
        };
      } catch (error) {
        const mapped = mapOpenAIError(error);
        console.error(`[analysis] failed analysisId=${analysisId} transcriptLength=${transcript.length} code=${mapped.code} providerStatus=${Number(error?.status) || "unknown"} providerName=${error?.name ?? "unknown"} providerCode=${error?.code ?? "unknown"} requestId=${error?.request_id ?? "unknown"}`);
        throw mapped;
      }
    },
  };
}

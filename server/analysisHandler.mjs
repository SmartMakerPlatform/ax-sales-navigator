import { validateTranscript } from "./analysisContract.mjs";

export const isRequestBodyTooLargeError = (error) =>
  error?.type === "entity.too.large" ||
  error?.status === 413 ||
  error?.statusCode === 413;

export function createAnalysisHandler(options) {
  const analyze = options.analyze;
  const minLength = Number(options.minLength ?? process.env.ANALYSIS_MIN_TRANSCRIPT_LENGTH ?? 20);
  const maxLength = Number(options.maxLength ?? process.env.ANALYSIS_MAX_TRANSCRIPT_LENGTH ?? 30_000);

  return async function analysisHandler(request, response, next) {
    try {
      const transcript = validateTranscript(request.body?.transcript, { minLength, maxLength });
      const result = await analyze(transcript);
      response.json(result);
    } catch (error) {
      next(error);
    }
  };
}

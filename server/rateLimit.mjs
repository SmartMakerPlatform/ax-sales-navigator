export function createFixedWindowRateLimiter(options = {}) {
  const maxRequests = Number(options.maxRequests ?? 5);
  const windowMs = Number(options.windowMs ?? 60_000);
  const now = options.now ?? Date.now;
  const buckets = new Map();

  return function fixedWindowRateLimiter(request, response, next) {
    const currentTime = now();
    const key = request.ip || "unknown";
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= currentTime
      ? { count: 0, resetAt: currentTime + windowMs }
      : current;

    bucket.count += 1;
    buckets.set(key, bucket);

    if (bucket.count > maxRequests) {
      response.setHeader("Retry-After", String(Math.max(1, Math.ceil((bucket.resetAt - currentTime) / 1000))));
      response.status(429).json({
        code: "ANALYSIS_RATE_LIMITED",
        message: "짧은 시간에 분석 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      });
      return;
    }
    next();
  };
}

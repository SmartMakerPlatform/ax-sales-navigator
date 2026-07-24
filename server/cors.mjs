function normalizeOrigin(value) {
  return value.trim().replace(/\/+$/, "");
}

export function parseAllowedOrigins(value = "") {
  return new Set(
    value
      .split(",")
      .map(normalizeOrigin)
      .filter(Boolean),
  );
}

export function createCorsMiddleware(allowedOriginsValue) {
  const allowedOrigins = parseAllowedOrigins(allowedOriginsValue);

  return (request, response, next) => {
    const requestOrigin = request.headers.origin;
    if (!requestOrigin) {
      next();
      return;
    }

    const origin = normalizeOrigin(requestOrigin);
    if (!allowedOrigins.has(origin)) {
      response.status(403).json({
        code: "ORIGIN_NOT_ALLOWED",
        message: "허용되지 않은 웹사이트에서 보낸 요청입니다.",
      });
      return;
    }

    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Max-Age", "86400");
    response.setHeader("Vary", "Origin");

    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }

    next();
  };
}

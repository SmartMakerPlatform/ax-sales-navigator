import assert from "node:assert/strict";
import test from "node:test";
import { createFixedWindowRateLimiter } from "./rateLimit.mjs";

function invoke(middleware, ip = "203.0.113.10") {
  let continued = false;
  let statusCode;
  let body;
  const headers = new Map();
  middleware(
    { ip },
    {
      setHeader(name, value) { headers.set(name, value); },
      status(value) { statusCode = value; return this; },
      json(value) { body = value; },
    },
    () => { continued = true; },
  );
  return { continued, statusCode, body, headers };
}

test("analysis limiter blocks repeated requests within the fixed window", () => {
  let currentTime = 1_000;
  const limiter = createFixedWindowRateLimiter({
    maxRequests: 2,
    windowMs: 60_000,
    now: () => currentTime,
  });

  assert.equal(invoke(limiter).continued, true);
  assert.equal(invoke(limiter).continued, true);
  const blocked = invoke(limiter);
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.body.code, "ANALYSIS_RATE_LIMITED");
  assert.equal(blocked.headers.get("Retry-After"), "60");

  currentTime += 60_001;
  assert.equal(invoke(limiter).continued, true);
});

test("analysis limiter tracks caller addresses independently", () => {
  const limiter = createFixedWindowRateLimiter({ maxRequests: 1 });
  assert.equal(invoke(limiter, "203.0.113.10").continued, true);
  assert.equal(invoke(limiter, "203.0.113.11").continued, true);
});

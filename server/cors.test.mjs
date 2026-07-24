import assert from "node:assert/strict";
import test from "node:test";
import { createCorsMiddleware, parseAllowedOrigins } from "./cors.mjs";

test("allowed origins are trimmed and trailing slashes are removed", () => {
  assert.deepEqual(
    [...parseAllowedOrigins(" https://smartmakerplatform.github.io/, http://localhost:4173 ")],
    ["https://smartmakerplatform.github.io", "http://localhost:4173"],
  );
});

test("an allowed browser origin receives CORS headers", () => {
  const middleware = createCorsMiddleware("https://smartmakerplatform.github.io");
  const headers = new Map();
  let continued = false;
  const response = {
    setHeader(name, value) {
      headers.set(name, value);
    },
    status() {
      return this;
    },
    json() {
      throw new Error("allowed origin must not be rejected");
    },
  };

  middleware(
    { headers: { origin: "https://smartmakerplatform.github.io" }, method: "POST" },
    response,
    () => {
      continued = true;
    },
  );

  assert.equal(continued, true);
  assert.equal(
    headers.get("Access-Control-Allow-Origin"),
    "https://smartmakerplatform.github.io",
  );
});

test("an unknown browser origin is rejected", () => {
  const middleware = createCorsMiddleware("https://smartmakerplatform.github.io");
  let statusCode;
  let body;
  const response = {
    status(value) {
      statusCode = value;
      return this;
    },
    json(value) {
      body = value;
    },
  };

  middleware(
    { headers: { origin: "https://example.com" }, method: "POST" },
    response,
    () => {
      throw new Error("unknown origin must not continue");
    },
  );

  assert.equal(statusCode, 403);
  assert.equal(body.code, "ORIGIN_NOT_ALLOWED");
});

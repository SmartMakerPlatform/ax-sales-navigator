import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "frontend", "dist");
const output = resolve(root, "dist");

await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, "static"), { recursive: true });
await mkdir(resolve(output, "server"), { recursive: true });
await cp(source, resolve(output, "static"), { recursive: true });
await writeFile(
  resolve(output, "server", "index.js"),
  `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    const url = new URL(request.url);
    if (response.status === 404 && !url.pathname.includes(".")) {
      return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
    }
    return response;
  }
};
`,
);

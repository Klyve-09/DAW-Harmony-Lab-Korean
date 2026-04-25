import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const host = process.env.SMOKE_HOST || "127.0.0.1";
const port = Number(process.env.SMOKE_PORT || 3020);
const baseUrl = `http://${host}:${port}`;
const nextCli = require.resolve("next/dist/bin/next");
const timeoutMs = 30000;
const routes = [
  { path: "/", expect: "DAW Harmony Lab" },
  { path: "/lessons", expect: "15단계 커리큘럼" },
  { path: "/generator", expect: "코드 진행 생성기" },
  { path: "/lessons/triads", expect: "DAW Harmony Lab" },
  { path: "/robots.txt", expect: "Sitemap:" },
  { path: "/sitemap.xml", expect: "/lessons/triads" },
  { path: "/manifest.webmanifest", expect: "DAW Harmony Lab" }
];

const requiredHeaders = [
  ["content-security-policy", "frame-ancestors 'none'"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
  ["x-content-type-options", "nosniff"],
  ["x-frame-options", "DENY"],
  ["permissions-policy", "camera=()"],
  ["cross-origin-opener-policy", "same-origin"]
];

const server = spawn(process.execPath, [nextCli, "start", "-p", String(port), "-H", host], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    NODE_ENV: "production",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || baseUrl
  },
  stdio: ["ignore", "pipe", "pipe"]
});

let logs = "";
server.stdout.on("data", (chunk) => {
  logs += chunk.toString();
});
server.stderr.on("data", (chunk) => {
  logs += chunk.toString();
});

function stopServer() {
  if (!server.killed) {
    server.kill("SIGTERM");
  }
}

async function waitForServer() {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited early with code ${server.exitCode}\n${logs}`);
    }

    try {
      const response = await fetch(baseUrl, { cache: "no-store" });
      if (response.ok) return;
    } catch {
      // Server is still booting.
    }

    await sleep(500);
  }

  throw new Error(`Timed out waiting for ${baseUrl}\n${logs}`);
}

try {
  await waitForServer();

  for (const route of routes) {
    const url = `${baseUrl}${route.path}`;
    const response = await fetch(url, { cache: "no-store" });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`${route.path} returned ${response.status}`);
    }

    if (!text.includes(route.expect)) {
      throw new Error(`${route.path} did not include expected text: ${route.expect}`);
    }

    if (text.includes("\uFFFD")) {
      throw new Error(`${route.path} contains replacement characters`);
    }
  }

  const rootResponse = await fetch(baseUrl, { cache: "no-store" });
  for (const [header, expectedValue] of requiredHeaders) {
    const actual = rootResponse.headers.get(header);
    if (!actual?.includes(expectedValue)) {
      throw new Error(`Missing or invalid ${header}: expected to include ${expectedValue}, got ${actual}`);
    }
  }

  if (rootResponse.headers.has("x-powered-by")) {
    throw new Error("x-powered-by header should not be exposed");
  }

  console.log(`Production smoke passed for ${routes.length} routes at ${baseUrl}`);
} finally {
  stopServer();
}

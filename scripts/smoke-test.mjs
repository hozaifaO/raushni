#!/usr/bin/env node

const appUrl = process.env.APP_BASE_URL || process.env.APP_PUBLIC_URL || "https://raushni-dev.com";
const apiUrl = process.env.API_BASE_URL || process.env.API_PUBLIC_URL || "https://api.raushni-dev.com";
const cmsUrl = process.env.CMS_BASE_URL || process.env.CMS_PUBLIC_URL || "https://cms.raushni-dev.com";

const checks = [
  { name: "public home", url: appUrl, expect: [200] },
  { name: "backend health", url: `${apiUrl.replace(/\/$/, "")}/health`, expect: [200] },
  { name: "backend api root", url: `${apiUrl.replace(/\/$/, "")}/api`, expect: [200] },
  { name: "cms health", url: `${cmsUrl.replace(/\/$/, "")}/_health`, expect: [200, 204] },
];

const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);

async function check({ name, url, expect }) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "raushni-smoke-test/1.0",
      },
    });
    const duration = Math.round(performance.now() - started);
    const ok = expect.includes(response.status);
    return { name, url, status: response.status, duration, ok };
  } catch (error) {
    return {
      name,
      url,
      status: "ERR",
      duration: Math.round(performance.now() - started),
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

const results = await Promise.all(checks.map(check));

for (const result of results) {
  const marker = result.ok ? "PASS" : "FAIL";
  const detail = result.error ? ` ${result.error}` : "";
  console.log(`${marker} ${result.name} ${result.status} ${result.duration}ms ${result.url}${detail}`);
}

if (results.some((result) => !result.ok)) {
  process.exitCode = 1;
}

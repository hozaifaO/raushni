#!/usr/bin/env node

import http from "node:http";
import https from "node:https";

const appUrl = process.env.APP_BASE_URL || process.env.APP_PUBLIC_URL || "https://raushni-dev.com";
const apiUrl = process.env.API_BASE_URL || process.env.API_PUBLIC_URL || "https://api.raushni-dev.com";
const cmsUrl = process.env.CMS_BASE_URL || process.env.CMS_PUBLIC_URL || "https://cms.raushni-dev.com";
const localResolve = process.env.LOCAL_RESOLVE === "1";
const allowSelfSigned = process.env.ALLOW_SELF_SIGNED === "1" || localResolve;

const checks = [
  { name: "public home", url: appUrl, expect: [200] },
  { name: "backend health", url: `${apiUrl.replace(/\/$/, "")}/health`, expect: [200] },
  { name: "backend api root", url: `${apiUrl.replace(/\/$/, "")}/api`, expect: [200] },
  { name: "backend dashboard status", url: `${apiUrl.replace(/\/$/, "")}/api/v1/dashboard/status`, expect: [200] },
  { name: "cms health", url: `${cmsUrl.replace(/\/$/, "")}/_health`, expect: [200, 204] },
  { name: "cms admin", url: `${cmsUrl.replace(/\/$/, "")}/admin`, expect: [200] },
];

const timeoutMs = Number(process.env.SMOKE_TIMEOUT_MS || 10000);

function request(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const transport = target.protocol === "http:" ? http : https;
    const hostname = localResolve ? "127.0.0.1" : target.hostname;
    const requestOptions = {
      protocol: target.protocol,
      hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: "GET",
      timeout: timeoutMs,
      servername: target.hostname,
      rejectUnauthorized: !allowSelfSigned,
      headers: {
        Host: target.host,
        "User-Agent": "raushni-smoke-test/1.0",
      },
    };

    const req = transport.request(requestOptions, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", async () => {
        const status = response.statusCode || 0;
        const location = response.headers.location;
        if ([301, 302, 303, 307, 308].includes(status) && location && redirectCount < 5) {
          const nextUrl = new URL(location, target).toString();
          try {
            resolve(await request(nextUrl, redirectCount + 1));
          } catch (error) {
            reject(error);
          }
          return;
        }
        resolve({ status, body: Buffer.concat(chunks).toString("utf8") });
      });
    });

    req.on("timeout", () => req.destroy(new Error(`timeout after ${timeoutMs}ms`)));
    req.on("error", reject);
    req.end();
  });
}

async function check({ name, url, expect }) {
  const started = performance.now();

  try {
    const response = await request(url);
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

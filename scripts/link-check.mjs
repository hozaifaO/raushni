#!/usr/bin/env node

import http from "node:http";
import https from "node:https";

const appUrl = process.env.APP_BASE_URL || process.env.APP_PUBLIC_URL || "https://raushni-dev.com";
const apiUrl = process.env.API_BASE_URL || process.env.API_PUBLIC_URL || "https://api.raushni-dev.com";
const cmsUrl = process.env.CMS_BASE_URL || process.env.CMS_PUBLIC_URL || "https://cms.raushni-dev.com";
const localResolve = process.env.LOCAL_RESOLVE === "1";
const allowSelfSigned = process.env.ALLOW_SELF_SIGNED === "1" || localResolve;
const timeoutMs = Number(process.env.LINK_CHECK_TIMEOUT_MS || 10000);
const maxPages = Number(process.env.LINK_CHECK_MAX_PAGES || 80);

const seedUrls = [
  appUrl,
  `${appUrl}/about`,
  `${appUrl}/activities`,
  `${appUrl}/events`,
  `${appUrl}/news`,
  `${appUrl}/gallery`,
  `${appUrl}/careers`,
  `${appUrl}/volunteer`,
  `${appUrl}/contact`,
  `${appUrl}/donate`,
  `${appUrl}/internships`,
  `${appUrl}/internship-registration`,
  `${appUrl}/login`,
  `${apiUrl}/health`,
  `${apiUrl}/api`,
  `${apiUrl}/api/v1/dashboard/status`,
  `${cmsUrl}/_health`,
  `${cmsUrl}/admin`,
];

const allowedOrigins = new Set([appUrl, apiUrl, cmsUrl].map((value) => new URL(value).origin));
const ignoredSchemes = ["mailto:", "tel:", "sms:", "whatsapp:", "javascript:"];

function normalizeUrl(rawUrl, baseUrl) {
  if (!rawUrl || rawUrl.startsWith("#")) return null;
  const trimmed = rawUrl.trim();
  if (ignoredSchemes.some((scheme) => trimmed.toLowerCase().startsWith(scheme))) return null;

  try {
    const url = new URL(trimmed, baseUrl);
    url.hash = "";
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!allowedOrigins.has(url.origin)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const patterns = [
    /\bhref\s*=\s*["']([^"']+)["']/gi,
    /\bsrc\s*=\s*["']([^"']+)["']/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const normalized = normalizeUrl(match[1], baseUrl);
      if (normalized) links.add(normalized);
    }
  }

  return [...links];
}

function request(url, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    const target = new URL(url);
    const transport = target.protocol === "http:" ? http : https;
    const hostname = localResolve ? "127.0.0.1" : target.hostname;
    const started = performance.now();
    const req = transport.request(
      {
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
          "User-Agent": "raushni-link-check/1.0",
        },
      },
      (response) => {
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", async () => {
          const status = response.statusCode || 0;
          const location = response.headers.location;
          if ([301, 302, 303, 307, 308].includes(status) && location && redirectCount < 5) {
            try {
              resolve(await request(new URL(location, target).toString(), redirectCount + 1));
            } catch (error) {
              reject(error);
            }
            return;
          }

          resolve({
            url,
            status,
            duration: Math.round(performance.now() - started),
            contentType: String(response.headers["content-type"] || ""),
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );

    req.on("timeout", () => req.destroy(new Error(`timeout after ${timeoutMs}ms`)));
    req.on("error", reject);
    req.end();
  });
}

const queue = [...new Set(seedUrls.map((url) => normalizeUrl(url, appUrl)).filter(Boolean))];
const checked = new Map();
const failures = [];

while (queue.length > 0 && checked.size < maxPages) {
  const url = queue.shift();
  if (!url || checked.has(url)) continue;

  try {
    const result = await request(url);
    checked.set(url, result);
    const ok = result.status >= 200 && result.status < 400;
    console.log(`${ok ? "PASS" : "FAIL"} ${result.status} ${result.duration}ms ${url}`);
    if (!ok) failures.push({ url, status: result.status });

    if (ok && result.contentType.includes("text/html")) {
      for (const link of extractLinks(result.body, url)) {
        if (!checked.has(link) && queue.length + checked.size < maxPages) queue.push(link);
      }
    }
  } catch (error) {
    checked.set(url, { status: "ERR" });
    failures.push({ url, status: "ERR", error: error instanceof Error ? error.message : String(error) });
    console.log(`FAIL ERR ${url} ${error instanceof Error ? error.message : String(error)}`);
  }
}

console.log(`checked=${checked.size} failures=${failures.length}`);

if (failures.length > 0) {
  process.exitCode = 1;
}

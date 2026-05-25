#!/usr/bin/env node

const appUrl = process.env.APP_BASE_URL || process.env.APP_PUBLIC_URL || "https://raushni-dev.com";
const apiUrl = process.env.API_BASE_URL || process.env.API_PUBLIC_URL || "https://api.raushni-dev.com";
const vus = Number(process.env.PERF_VUS || 8);
const iterations = Number(process.env.PERF_ITERATIONS || 40);
const maxP95Ms = Number(process.env.PERF_MAX_P95_MS || 1200);
const maxErrorRate = Number(process.env.PERF_MAX_ERROR_RATE || 0.02);

const targets = [
  `${appUrl.replace(/\/$/, "")}/`,
  `${apiUrl.replace(/\/$/, "")}/health`,
  `${apiUrl.replace(/\/$/, "")}/api`,
];

async function timedFetch(url) {
  const started = performance.now();
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "raushni-performance-smoke/1.0",
      },
    });
    return {
      url,
      ok: response.status >= 200 && response.status < 400,
      status: response.status,
      duration: performance.now() - started,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      status: "ERR",
      duration: performance.now() - started,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function worker(id) {
  const results = [];
  for (let index = id; index < iterations; index += vus) {
    const url = targets[index % targets.length];
    results.push(await timedFetch(url));
  }
  return results;
}

const batches = await Promise.all(Array.from({ length: vus }, (_, index) => worker(index)));
const results = batches.flat();
const durations = results.map((result) => result.duration).sort((a, b) => a - b);
const errors = results.filter((result) => !result.ok);
const p95Index = Math.max(0, Math.ceil(durations.length * 0.95) - 1);
const p95 = Math.round(durations[p95Index] || 0);
const avg = Math.round(durations.reduce((sum, value) => sum + value, 0) / Math.max(1, durations.length));
const errorRate = errors.length / Math.max(1, results.length);

console.log(`requests=${results.length} vus=${vus} avg_ms=${avg} p95_ms=${p95} errors=${errors.length} error_rate=${errorRate.toFixed(3)}`);

if (errors.length > 0) {
  for (const error of errors.slice(0, 5)) {
    console.log(`ERROR ${error.status} ${Math.round(error.duration)}ms ${error.url} ${error.error || ""}`);
  }
}

if (p95 > maxP95Ms || errorRate > maxErrorRate) {
  console.error(`Performance smoke failed: p95<=${maxP95Ms}ms and error_rate<=${maxErrorRate} required.`);
  process.exitCode = 1;
}

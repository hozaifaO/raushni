/**
 * BFF rate limiting: prefer Upstash Redis REST when configured, else in-memory.
 * In-memory is per-Node process (fine as a backstop on Vercel; not shared across isolates).
 */

type LimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

type Bucket = { count: number; resetAt: number };

const memory = new Map<string, Bucket>();

function memoryLimit(key: string, limit: number, windowSeconds: number): LimitResult {
  const now = Date.now();
  const bucket = memory.get(key);
  if (!bucket || bucket.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true };
  }
  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true };
}

export async function enforceBffRateLimit(opts: {
  key: string;
  limit: number;
  windowSeconds: number;
}): Promise<LimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

  if (url && token) {
    try {
      const { Ratelimit } = await import("@upstash/ratelimit");
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({ url, token });
      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowSeconds} s`),
        prefix: "raushni-bff",
      });
      const result = await ratelimit.limit(opts.key);
      if (result.success) {
        return { ok: true };
      }
      const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      return { ok: false, retryAfterSeconds };
    } catch {
      // Fall through to memory if Upstash misconfigured.
    }
  }

  return memoryLimit(opts.key, opts.limit, opts.windowSeconds);
}

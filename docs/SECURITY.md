# Security

How the live stack is meant to be reached, what is public, and how to rotate keys.

Local Docker setup (separate from hosted prod): [LOCAL_DEV.md](LOCAL_DEV.md).

## Trust boundaries

**Hosted production**

```
Browser
  -> Vercel (Next.js pages + /api/v1 + /cms/api BFFs)
       -> Railway FastAPI (service key)
       -> Railway Strapi (CMS_API_TOKEN)
  -> Railway FastAPI / Strapi directly (should only be used by BFFs / webhooks)
```

**Local Docker** — same BFF pattern, but Next.js / FastAPI / Strapi / Postgres / Redis run in Compose on localhost. Do not reuse production `INTERNAL_API_KEY` / `CMS_API_TOKEN` in `.env.dev`.

Browsers should not hold `INTERNAL_API_KEY` or `CMS_API_TOKEN`. Those stay on the server (Vercel env / Railway env). The Next.js BFFs mint them after their own checks.

Nginx/k8s rate limits in this repo do **not** protect Railway or Vercel. App-level limits do.

## What is public

| Surface | Public without login |
|---------|----------------------|
| Marketing pages on Vercel | Yes |
| `POST /api/v1/donations/public` | Yes (rate limited) |
| `POST /api/v1/enquiries/public` | Yes (rate limited) |
| `POST /api/v1/internships/applications/public` | Yes (rate limited) |
| `GET /api/v1/internships/public`, certificate verify, landing, documents | Yes |
| `GET /cms/api/{landing-pages,site-settings,public-pages,...}` via BFF | Yes (read-only allowlist) |
| Dashboard routes, members, donations list, settings | No — NextAuth session |
| CMS BFF writes (`POST/PUT/PATCH/DELETE`) | No — staff/admin session |
| Stripe webhook | Signature required when production-like |

OpenAPI (`/docs`) is disabled when `ENVIRONMENT` is production/staging or `REQUIRE_AUTH=true`.

## Rate limits

**FastAPI (Redis via `REDIS_URL`, SlowAPI)**

- Default: `RATE_LIMIT_DEFAULT` (default `120/minute`) per client IP (`X-Forwarded-For` first hop when present).
- Public writes above: `RATE_LIMIT_PUBLIC_WRITE` (default `10/minute`).
- `/health` and `/health/ready` are exempt.

**Vercel BFFs**

- Public API/CMS BFF: ~10–30 requests/minute per IP.
- Authenticated BFF: ~60/minute per IP.
- Uses Upstash REST (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) when set; otherwise in-memory per Node isolate (backstop only).

## CORS

Backend uses `CORS_ORIGINS` (comma-separated). Never `*` with credentials. Keep this list aligned with the real frontend hosts.

## Auth systems (do not mix)

1. **Site dashboard** — NextAuth (`NEXTAUTH_ADMIN_*` / `NEXTAUTH_STAFF_*`) on Vercel `/login`.
2. **Strapi CMS** — separate admin users on the CMS host `/admin`.
3. **Service keys** — `INTERNAL_API_KEY` (API), `CMS_API_TOKEN` (Content API header `X-CMS-API-Key`).

## Rotate secrets

1. Generate a new value (`openssl rand -base64 32` or similar).
2. Set it on Railway and/or Vercel for every service that shares it.
3. Redeploy so processes pick it up.
4. Revoke the old value.

Rotate at least: `INTERNAL_API_KEY`, `CMS_API_TOKEN`, `NEXTAUTH_SECRET`, admin/staff passwords, `STRIPE_WEBHOOK_SECRET`, Redis/DB credentials if leaked.

Stripe: in production-like mode the API **rejects** webhooks if `STRIPE_WEBHOOK_SECRET` is missing. Unsigned payloads are only for local/dev.

## Non-goals

- No Kong/Cloudflare WAF in front yet.
- Guest UI entry is removed; do not reintroduce anonymous dashboard access.
- Local credential txt files (if any) stay gitignored — delete them after copying passwords elsewhere.

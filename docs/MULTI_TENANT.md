# Multi-tenant SaaS (v1)

Shared-database tenancy for Raushni as a multi-org platform. Aligns with [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md). Items explicitly deferred (Razorpay, Better Auth, Kong, document-generator, etc.) are listed in [DEFERRED.md](DEFERRED.md).

## Tenancy model

- **One Postgres database**, row-scoped by `organization_id` (FK to `organizations`).
- Default org slug: `raushni` (seeded / backfilled in Wave 2).
- Repositories and Redis keys must scope by org (`org:{id}:…`).
- **Not** in v1: database-per-tenant, namespace-per-tenant, or a Strapi instance per tenant.

```text
Host / X-Tenant-Slug
        │
        ▼
Next.js middleware  →  BFF (api/v1, cms/api)  →  FastAPI require_organization
        │                        │                        │
        │                        │                        ▼
        │                        │              Postgres (org-scoped rows)
        │                        ▼
        └──────────────────► Strapi (content keyed by tenantSlug)
```

## Host resolution

| Environment | Resolution |
| --- | --- |
| **Dev / local** | `DEFAULT_TENANT_SLUG` (default `raushni`) and/or request header `X-Tenant-Slug`. Localhost maps to the default slug. |
| **Prod target** | Subdomain `slug.raushni.com` → tenant slug (wildcard DNS/ACM; see `k8s/overlays/aws-saas`). Apex/`www` serve the default org unless product policy changes. |

Trusted headers (`X-Tenant-Slug`, later `X-Organization-Id`) are set by the BFF/middleware after host resolution. The API resolves slug → org id server-side; never trust a raw client org id for writes without membership checks.

## CMS keying

- **One Strapi instance.**
- Content filtered/keyed by `tenantSlug` (string on collection types; singleTypes such as site-setting / landing-page become collection types or a tenant-scoped collection).
- Frontend CMS client: `filters[tenantSlug][$eq]=…` (or equivalent relation).
- Seed scripts target at least `raushni`.

## Secret layout

Platform secrets stay on the existing External Secrets / Secrets Manager paths (for example `/raushni/{env}/app` — see `k8s/overlays/aws-saas/external-secret-aws-saas.yaml`).

### Per-org secrets (Wave 2–3 contract)

Future per-tenant provider credentials use a **slug-scoped** Secrets Manager prefix. Do **not** store live Razorpay/Stripe org keys in public CMS seed.

```text
/raushni/{env}/orgs/{slug}/…
```

**Example keys (not wired yet):**

| Path | Purpose |
| --- | --- |
| `/raushni/{env}/orgs/{slug}/razorpay` | Future Razorpay `key_id` / `key_secret` / webhook secret (deferred — see [DEFERRED.md](DEFERRED.md)) |
| `/raushni/{env}/orgs/{slug}/stripe` | Optional per-org Stripe keys if/when checkout is re-enabled publicly |
| `/raushni/{env}/orgs/{slug}/app` | Other org-scoped runtime secrets (webhooks, integrations) |

Alternate storage (later): nullable columns on `organizations` (e.g. `razorpay_*`) loaded via External Secrets into the pod — same logical contract, different mount. Prefer Secrets Manager paths for credentials.

**Config stub (backend):** `Settings.org_secrets_prefix` defaults to `/raushni/{environment}/orgs` so loaders can resolve `/raushni/{env}/orgs/{slug}/…` without hardcoding. No Razorpay client is implemented.

### Payment UX ownership (v1)

| Concern | Owner | Notes |
| --- | --- | --- |
| UPI VPA, QR image, allowed manual methods | **CMS** (`donation-payment-setting`, keyed by `tenantSlug`) | Public donate remains CMS-owned for UPI/QR/manual UTR |
| Platform Stripe env keys | `/raushni/{env}/app` (`STRIPE_*`) | Stripe code paths exist but are unused by public method menus |
| Future Razorpay | `/raushni/{env}/orgs/{slug}/razorpay` (or org columns) | **Not implemented** this program |

## Stripe webhook contract (multi-tenant)

Public card/Stripe checkout is dormant; keep the backend path ready for tenancy.

**Checkout session create** (`StripePaymentService.create_checkout_session`) must set:

```text
metadata.donation_id
metadata.receipt_number
metadata.organization_id   # UUID string of organizations.id (required once Agent E lands)
```

**Webhook handler** (`POST /api/v1/webhooks/stripe` on `checkout.session.completed`):

1. Parse session object; read `metadata.organization_id` when present.
2. After `organizations` + `donations.organization_id` exist: **require** `metadata.organization_id`, resolve mark-paid within that org scope (cross-org session id must 404/ignore).
3. Until Agent E merges: look up by `gateway_session_id` only; code carries a `TODO(multi-tenant)` — do not invent org filtering yet.

Status events from the webhook path continue to use `actor_role=webhook`.

## Ingress wildcard (`*.raushni.com`)

Prod target: tenant subdomains hit the **frontend** (Next.js middleware resolves slug → `X-Tenant-Slug`). DNS/ACM already plan for `*.raushni.com` ([aws-saas-eks.md](deployment/aws-saas-eks.md)).

**Overlay** in [`k8s/overlays/aws-saas/ingress-aws-alb.yaml`](../k8s/overlays/aws-saas/ingress-aws-alb.yaml):

1. Ensure the ALB certificate ARN covers `*.raushni.com` (Terraform SAN already documents this).
2. Wildcard host rule routes `/` to the `frontend` service (enabled in Wave 3):

```yaml
    - host: "*.raushni.com"
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  name: http
```

**Do not** point `*.raushni.com` at `api` or `cms` — those stay on `api.raushni.com` / `cms.raushni.com`. Apex/`www` remain the default-org marketing surface; tenant hosts are frontend-only until product policy changes.

**Rollout prerequisites:** ACM SAN includes `*.raushni.com`, Route53 (or equivalent) wildcard alias points at the ALB, and frontend host→slug middleware is live. Without middleware, subdomain hosts still reach the frontend but will resolve the default tenant until Agent F host resolution lands.

## Auth and memberships

- Interim: **NextAuth** credentials.
- Wave 2: `organization_memberships` (`organization_id`, `email`, `role`); session/JWT carries `organizationId` + `tenantSlug`.
- **Better Auth** rewrite is deferred ([DEFERRED.md](DEFERRED.md)).

## Document generator

[`services/document_generator`](../services/document_generator/STUB.md) stays **stubbed**. Tenancy work does not revive or deploy it. Issued receipts use DB snapshots; PDF archive to S3 is deferred.

## Migration order

| Wave | Focus |
| --- | --- |
| **0** | This doc + [DEFERRED.md](DEFERRED.md); shared contracts only. |
| **1** | Product honesty: public enquiry/contact, donate UTR/anonymous/QR, receipt freeze + mark-paid, ComingSoon nav cleanup, shallow white-label. |
| **2** | `organizations` + backfill `organization_id`, repo scoping + isolation tests; middleware/BFF/CMS `tenantSlug`; secrets/webhook/k8s notes. |
| **3** | Per-org settings, membership-scoped staff, ingress wildcard, more isolation tests. |

**Suggested merge order after Wave 0:** donation integrity migration → public donate → contact/ComingSoon + white-label → org schema → frontend host/CMS → secrets/ops notes → verify.

## Related

- Deferred features: [DEFERRED.md](DEFERRED.md)
- Target platform design: [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md)
- AWS SaaS overlay notes: [deployment/aws-saas-eks.md](deployment/aws-saas-eks.md)

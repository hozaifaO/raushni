# Raushni Dev and Non-Prod Playbook

This playbook covers local development and production-like non-prod deployment for the Raushni SaaS platform.

## Scope

- Local development domains:
  - `https://raushni-dev.com`
  - `https://api.raushni-dev.com`
  - `https://cms.raushni-dev.com`
- Non-prod public domains:
  - `https://raushni-dev.com`
  - `https://www.raushni-dev.com`
  - `https://api.raushni-dev.com`
  - `https://cms.raushni-dev.com`
- Kubernetes namespace: `raushni`
- Non-prod secret path: `/raushni/development/app`
- Non-prod overlay: `k8s/overlays/nonprod`

Use local development for fast feedback. Use non-prod for production-like validation of Kubernetes, TLS, ingress, Cloudflare, CMS, APIs, payments in test mode, and smoke checks.

## Roles

| Role | Responsibility |
| --- | --- |
| Developer | Runs local stack, unit tests, type checks, and feature validation. |
| Non-prod operator | Deploys Kubernetes overlay, secrets, ingress, and DNS/TLS. |
| QA verifier | Runs smoke, CRUD, CMS, document, and browser checks. |
| Content verifier | Confirms Strapi content, uploads, public pages, and templates. |

## 1. Local Development

Prepare local environment:

```bash
cd /Users/owaisahmad/Documents/raushni
cp .env.dev.example .env.dev
```

Configure local hostnames once:

```bash
sudo ./scripts/setup-dev-hosts.sh
```

Start Docker Compose development stack:

```bash
make dev-up
```

Stop local stack:

```bash
make dev-down
```

Run local validation:

```bash
make validate
make test
make smoke
```

Useful targeted checks:

```bash
make test-backend
make test-frontend
make link-check
make performance
```

## 2. Local Kubernetes Development

Use this when testing Kubernetes manifests on Docker Desktop or a small local cluster.

Check tool and cluster status:

```bash
make k8s-local-check
```

Install local ingress:

```bash
make k8s-local-install-ingress
```

Configure local hostnames:

```bash
make k8s-local-hosts
```

Build local images:

```bash
make k8s-local-build
```

Deploy local-min overlay:

```bash
make k8s-local-deploy
```

Check status:

```bash
make k8s-local-status
```

Run local Kubernetes smoke checks:

```bash
make k8s-local-smoke
make k8s-local-crud-smoke
```

Scale local app workloads down while keeping data volumes:

```bash
make k8s-local-stop
```

Scale them back up:

```bash
make k8s-local-start
```

Clean local Kubernetes app resources:

```bash
make k8s-local-clean
```

Deep clean only when intentionally pruning unused Docker data:

```bash
make k8s-local-deep-clean
```

## 3. Non-Prod Pre-Flight

Confirm repository state:

```bash
git status --short
```

Confirm tools:

```bash
docker --version
aws --version
kubectl version --client
helm version
jq --version
```

Confirm Kubernetes context points to the intended non-prod cluster:

```bash
kubectl config current-context
kubectl get nodes -o wide
```

Run validation before deploying:

```bash
make validate
make k8s-validate
```

Render non-prod manifests:

```bash
kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod > /tmp/raushni-nonprod.yaml
rg -n "host:|image:|secretName:|APP_PUBLIC_URL|API_PUBLIC_URL|CMS_PUBLIC_URL" /tmp/raushni-nonprod.yaml
```

Expected non-prod values:

```text
APP_PUBLIC_URL=https://raushni-dev.com
API_PUBLIC_URL=https://api.raushni-dev.com
CMS_PUBLIC_URL=https://cms.raushni-dev.com
secretName=raushni-dev-tls
ExternalSecret remote key=/raushni/development/app
```

## 4. Non-Prod Secrets

Non-prod secrets are read from AWS Secrets Manager through External Secrets Operator.

Expected secret path:

```text
/raushni/development/app
```

Required keys:

```text
POSTGRES_USER
POSTGRES_PASSWORD
BACKEND_DATABASE_URL
CMS_DATABASE_NAME
CMS_DATABASE_HOST
CMS_DATABASE_PORT
CMS_DATABASE_USERNAME
CMS_DATABASE_PASSWORD
CMS_DATABASE_SSL
REDIS_PASSWORD
REDIS_URL
NEXTAUTH_SECRET
NEXTAUTH_ADMIN_EMAIL
NEXTAUTH_ADMIN_PASSWORD
NEXTAUTH_STAFF_EMAIL
NEXTAUTH_STAFF_PASSWORD
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRAPI_APP_KEYS
STRAPI_API_TOKEN_SALT
STRAPI_ADMIN_JWT_SECRET
STRAPI_JWT_SECRET
STRAPI_TRANSFER_TOKEN_SALT
DD_API_KEY
```

Use test-mode third-party credentials in non-prod. Do not reuse production Stripe, SMTP, or administrator credentials.

Push/update values from environment variables:

```bash
export AWS_REGION=ap-south-1
export AWS_SECRET_ID=/raushni/development/app
export POSTGRES_USER=raushni_admin
export POSTGRES_PASSWORD='replace-with-nonprod-password'
export BACKEND_DATABASE_URL='replace-with-nonprod-backend-db-url'
export CMS_DATABASE_NAME=raushni_cms
export CMS_DATABASE_HOST='replace-with-nonprod-db-host'
export CMS_DATABASE_PORT=5432
export CMS_DATABASE_USERNAME=raushni_admin
export CMS_DATABASE_PASSWORD="${POSTGRES_PASSWORD}"
export CMS_DATABASE_SSL=true
export REDIS_PASSWORD='replace-with-nonprod-redis-password'
export REDIS_URL='replace-with-nonprod-redis-url'
export NEXTAUTH_SECRET='replace-with-nonprod-secret'
export NEXTAUTH_ADMIN_EMAIL=admin@raushni.com
export NEXTAUTH_ADMIN_PASSWORD='replace-with-nonprod-admin-password'
export NEXTAUTH_STAFF_EMAIL=staff@raushni.com
export NEXTAUTH_STAFF_PASSWORD='replace-with-nonprod-staff-password'
export STRIPE_SECRET_KEY='sk_test_replace'
export STRIPE_PUBLISHABLE_KEY='pk_test_replace'
export STRIPE_WEBHOOK_SECRET='whsec_test_replace'
export STRAPI_APP_KEYS='replace-key-1,replace-key-2,replace-key-3,replace-key-4'
export STRAPI_API_TOKEN_SALT='replace-with-nonprod-salt'
export STRAPI_ADMIN_JWT_SECRET='replace-with-nonprod-admin-jwt-secret'
export STRAPI_JWT_SECRET='replace-with-nonprod-jwt-secret'
export STRAPI_TRANSFER_TOKEN_SALT='replace-with-nonprod-transfer-salt'
export DD_API_KEY='replace-or-placeholder'
make push-aws-secrets
```

Confirm ExternalSecret sync:

```bash
kubectl -n raushni describe externalsecret raushni-secrets
kubectl -n raushni get secret raushni-secrets
```

## 5. Non-Prod Cluster Add-Ons

Install or confirm these cluster add-ons:

- ingress controller compatible with `k8s/ingress.yaml`.
- cert-manager with a `letsencrypt-prod` or non-prod issuer appropriate for `raushni-dev.com`.
- metrics-server.
- External Secrets Operator.
- AWS Load Balancer Controller if running non-prod on EKS with ALB.
- Datadog/OpenTelemetry if `OTEL_SDK_DISABLED=false`.

Apply external secrets resources:

```bash
kubectl apply -k k8s/external-secrets
kubectl apply -k k8s/external-secret-store
```

## 6. Deploy Non-Prod

Apply the production-like non-prod overlay:

```bash
make k8s-deploy-nonprod
```

Watch rollouts:

```bash
kubectl -n raushni rollout status statefulset/postgres --timeout=240s
kubectl -n raushni rollout status statefulset/redis --timeout=180s
kubectl -n raushni rollout status deploy/backend --timeout=300s
kubectl -n raushni rollout status deploy/frontend --timeout=300s
kubectl -n raushni rollout status deploy/strapi --timeout=420s
kubectl -n raushni rollout status deploy/document-generator --timeout=300s
```

Check workload status:

```bash
kubectl -n raushni get pods -o wide
kubectl -n raushni get svc
kubectl -n raushni get ingress raushni-public
```

Seed CMS when Strapi is healthy:

```bash
kubectl -n raushni exec deploy/strapi -- npm run seed:raushni
```

## 7. DNS, CDN, and TLS

For Cloudflare-managed `raushni-dev.com`, create records pointing to the non-prod ingress target.

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `@` | non-prod ingress/ALB hostname | DNS-only first |
| CNAME | `www` | non-prod ingress/ALB hostname | DNS-only first |
| CNAME | `api` | non-prod ingress/ALB hostname | DNS-only first |
| CNAME | `cms` | non-prod ingress/ALB hostname | DNS-only first |

Cloudflare TLS baseline:

```text
SSL/TLS mode: Full (strict)
Always Use HTTPS: On
Automatic HTTPS Rewrites: On
Minimum TLS: TLS 1.2
```

Only enable the Cloudflare proxy after direct origin validation passes. Keep `cms` DNS-only while debugging Strapi admin and uploads.

Validate DNS:

```bash
dig +short raushni-dev.com
dig +short api.raushni-dev.com
dig +short cms.raushni-dev.com
```

Validate TLS:

```bash
curl -Iv https://raushni-dev.com --max-time 20
curl -Iv https://api.raushni-dev.com/health --max-time 20
curl -Iv https://cms.raushni-dev.com/_health --max-time 20
```

## 8. Non-Prod Verification

Run automated checks:

```bash
APP_BASE_URL=https://raushni-dev.com \
API_BASE_URL=https://api.raushni-dev.com \
CMS_BASE_URL=https://cms.raushni-dev.com \
make smoke

APP_BASE_URL=https://raushni-dev.com \
API_BASE_URL=https://api.raushni-dev.com \
CMS_BASE_URL=https://cms.raushni-dev.com \
make link-check

API_BASE_URL=https://api.raushni-dev.com make crud-smoke
```

Manual checks:

- Public home, about, activities, events, news, gallery, careers, volunteer, contact, and donation pages render.
- Login works at `https://raushni-dev.com/login`.
- Admin can create, update, and delete representative dashboard records.
- Strapi admin loads at `https://cms.raushni-dev.com/admin`.
- CMS content appears on public pages.
- Donation test flow uses Stripe test credentials.
- Document generation works for certificates, ID cards, appointment letters, and receipts.
- Uploads work for CMS and dashboard flows.
- Logs and traces appear in non-prod observability.

## 9. Dashboard Access

Deploy dashboard:

```bash
make k8s-deploy-dashboard
```

Get viewer token:

```bash
make k8s-dashboard-token
```

Port-forward dashboard:

```bash
make k8s-dashboard-port-forward
```

Open:

```text
https://127.0.0.1:10443
```

Use a short-lived admin token only when cluster administration requires it:

```bash
make k8s-dashboard-admin-token
```

## 10. Rollback

If a deployment fails before traffic is enabled:

```bash
kubectl -n raushni rollout undo deploy/backend
kubectl -n raushni rollout undo deploy/frontend
kubectl -n raushni rollout undo deploy/strapi
kubectl -n raushni rollout undo deploy/document-generator
```

If DNS or Cloudflare causes the issue:

1. Set affected records to DNS-only.
2. Re-test direct origin.
3. Disable new WAF/cache rules.
4. Re-enable proxy only after direct checks pass.

If the cluster is unhealthy:

```bash
kubectl -n raushni get events --sort-by=.metadata.creationTimestamp
kubectl -n raushni describe ingress raushni-public
kubectl -n raushni logs deploy/backend --tail=200
kubectl -n raushni logs deploy/frontend --tail=200
kubectl -n raushni logs deploy/strapi --tail=200
kubectl -n raushni logs deploy/document-generator --tail=200
```

## Go / No-Go

Go when:

- All rollouts are complete.
- `raushni-dev.com`, `api.raushni-dev.com`, and `cms.raushni-dev.com` pass HTTPS checks.
- Smoke checks pass.
- CRUD smoke passes.
- CMS admin and uploads work.
- Test payment flow works.
- No critical pod restarts or ingress errors remain.

No-go when:

- Cloudflare returns 525, 526, 522, or redirect loops.
- API health fails.
- Login fails.
- CMS admin is unavailable.
- ExternalSecret sync fails.
- Dashboard CRUD fails.
- Non-prod uses production payment or admin credentials.

## Handoff Notes

Capture these after each non-prod deployment:

- Git commit SHA.
- Image tags.
- Kubernetes context and namespace.
- Ingress hostname/IP.
- Cloudflare proxy state.
- Smoke and CRUD results.
- Known issues and rollback tag.

# Raushni Production Readiness

This project is prepared for local development, staging at `raushni-dev.com`, and production deployment.

For the target SaaS architecture, including Cloudflare CDN, AWS ALB, Kong/API gateway, EKS workloads, data services, and observability, see [SYSTEM_DESIGN.md](SYSTEM_DESIGN.md). For local development and production-like non-prod deployment, see [DEV_NONPROD_PLAYBOOK.md](deployment/DEV_NONPROD_PLAYBOOK.md).

## Development Environment

Day-to-day local Docker uses **localhost ports** — see [LOCAL_DEV.md](LOCAL_DEV.md).

```bash
cp .env.dev.example .env.dev
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up --build
# or: make dev-up
```

Optional named hosts for nginx / K8s-local smoke (not required for Compose on localhost):

- `https://raushni-dev.com`
- `https://api.raushni-dev.com`
- `https://cms.raushni-dev.com`

```bash
sudo ./scripts/setup-dev-hosts.sh   # macOS/Linux
# Windows (Admin PowerShell): .\scripts\setup-dev-hosts.ps1
make dev-up                         # or the docker compose form in LOCAL_DEV.md
```

**Hosted production** today is Vercel + Railway + Neon + Upstash (see [SECURITY.md](SECURITY.md)), not Compose on a public host.

## Validation

```bash
make validate
```

This checks frontend TypeScript, Kubernetes YAML/Kustomize rendering, Docker Compose config, and nginx static configuration.

## Testing

```bash
make test
make coverage
make smoke
make performance
```

Useful targeted commands:

```bash
make test-backend
make test-backend-unit
make test-backend-integration
make test-frontend
APP_BASE_URL=https://raushni-dev.com API_BASE_URL=https://api.raushni-dev.com CMS_BASE_URL=https://cms.raushni-dev.com make smoke
```

Coverage reports:

- `reports/backend/htmlcov/index.html`
- `reports/backend/coverage.xml`
- `frontend/coverage/index.html`
- `frontend/coverage/lcov.info`

## Kubernetes

`k8s/secrets.yaml` uses External Secrets Operator to create `raushni-secrets` from AWS Secrets Manager. Terraform creates the AWS secret container and an IRSA role with read access to that one secret.

```bash
kubectl apply -k k8s/external-secrets
kubectl apply -k k8s/external-secret-store
kubectl apply -k k8s
```

Required cluster add-ons:

- nginx ingress controller
- cert-manager with `letsencrypt-prod`
- metrics-server
- External Secrets Operator
- Datadog Agent/OpenTelemetry Collector for production monitoring

## Infrastructure

AWS Terraform lives in `infrastructure/terraform/aws`.

```bash
cd infrastructure/terraform/aws
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
```

Never commit real `terraform.tfvars`, cloud credentials, or production secrets.

Push production secret values from environment variables only:

```bash
make push-aws-secrets
```

## Release Checklist

- Build and push immutable images for backend, frontend, CMS, nginx, and document generator.
- Update Kubernetes image tags.
- Confirm AWS Secrets Manager contains real `NEXTAUTH_SECRET`, Strapi secrets, Stripe keys, Datadog key, Redis credentials, and database credentials.
- Run `make validate`, `make coverage`, `make smoke`, and `make performance`.
- Confirm Datadog services show `raushni-backend`, `raushni-frontend`, `raushni-cms`, and `raushni-document-generator`.

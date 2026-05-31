# Raushni Production Readiness

This project is prepared for local development, staging at `raushni-dev.com`, and production deployment.

## Development Environment

Use the checked-in development template:

```bash
cp .env.dev.example .env.dev
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Development domains:

- `https://raushni-dev.com`
- `https://api.raushni-dev.com`
- `https://cms.raushni-dev.com`

For local DNS testing, map these domains to `127.0.0.1` in `/etc/hosts` or use your development DNS provider.

On macOS/Linux local development, run:

```bash
sudo ./scripts/setup-dev-hosts.sh
```

Then start the stack:

```bash
make dev-up
```

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

# Raushni Kubernetes

Production-oriented Kubernetes manifests for the Raushni platform.

## Components

- `frontend`: Next.js public site and dashboard.
- `backend`: FastAPI API.
- `strapi`: CMS.
- `document-generator`: document/PDF support service.
- `postgres`: stateful PostgreSQL for backend and CMS.
- `redis`: cache and background workflow support.
- `ingress`: nginx ingress with cert-manager TLS.
- `network-policy`: baseline ingress isolation.

## Required Cluster Add-ons

- nginx ingress controller
- cert-manager with a `letsencrypt-prod` `ClusterIssuer`
- metrics-server for HPA
- External Secrets Operator for AWS Secrets Manager integration
- Datadog Agent/OpenTelemetry Collector if `OTEL_SDK_DISABLED=false`

## Secrets

`raushni-secrets` is created by External Secrets Operator from AWS Secrets Manager. Do not store runtime secrets in this repository.

Create the AWS secret and IRSA role with Terraform, then push the real values from your shell environment:

```bash
cd infrastructure/terraform/aws
terraform apply
terraform output external_secrets_role_arn
terraform output app_secret_name
```

Patch `k8s/external-secrets/serviceaccount.yaml` with the `external_secrets_role_arn` output, then create the namespace and service account:

```bash
kubectl apply -k k8s/external-secrets
```

Install External Secrets Operator with CRDs, then create the AWS Secrets Manager store:

```bash
helm repo add external-secrets https://charts.external-secrets.io
helm repo update
helm upgrade --install external-secrets external-secrets/external-secrets \
  --namespace external-secrets \
  --set installCRDs=true \
  --set serviceAccount.create=false \
  --set serviceAccount.name=external-secrets
kubectl apply -k k8s/external-secret-store
```

Load real values into AWS Secrets Manager:

```bash
export AWS_REGION=ap-south-1
export AWS_SECRET_ID=/raushni/production/app
export POSTGRES_USER=...
export POSTGRES_PASSWORD=...
export BACKEND_DATABASE_URL=...
export CMS_DATABASE_NAME=...
export CMS_DATABASE_USERNAME=...
export CMS_DATABASE_PASSWORD=...
export REDIS_PASSWORD=...
export REDIS_URL=...
export NEXTAUTH_SECRET=...
export KEYCLOAK_CLIENT_SECRET=...
export STRIPE_SECRET_KEY=...
export STRIPE_PUBLISHABLE_KEY=...
export STRIPE_WEBHOOK_SECRET=...
export STRAPI_APP_KEYS=...
export STRAPI_API_TOKEN_SALT=...
export STRAPI_ADMIN_JWT_SECRET=...
export STRAPI_JWT_SECRET=...
export STRAPI_TRANSFER_TOKEN_SALT=...
export DD_API_KEY=...
make push-aws-secrets
```

## Deploy

After the secret manager and operator are ready:

```bash
kubectl apply -k k8s/external-secrets
kubectl apply -k k8s/external-secret-store
kubectl apply -k k8s
```

## Image Tags

The manifests use `ghcr.io/owais4u/raushni-*:1.0.0` as production image placeholders. Update tags through Kustomize before release:

```bash
kubectl kustomize k8s
```

## Storage

`postgres`, `redis`, and `strapi` uploads use persistent volumes. For multi-replica Strapi, move uploads to S3-compatible object storage or use a ReadWriteMany storage class.

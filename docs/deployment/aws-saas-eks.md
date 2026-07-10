# Raushni SaaS AWS EKS Deployment

This guide deploys Raushni as a SaaS-ready NGO platform on AWS Kubernetes.

For the complete system design, including Cloudflare CDN, Kong/API gateway, traffic flow, security layers, and observability, see [../SYSTEM_DESIGN.md](../SYSTEM_DESIGN.md).

## SaaS Model

The first production-ready SaaS shape is a shared platform with tenant-aware application data:

- One EKS cluster per environment.
- One application namespace: `raushni`.
- One PostgreSQL database with tenant/org identifiers in application records.
- One Strapi CMS instance for platform content and templates.
- Optional tenant subdomains such as `demo.raushni.com` through wildcard ACM DNS.
- Future scale path: namespace-per-tenant or database-per-tenant for enterprise customers.

## AWS Services

- Amazon EKS for Kubernetes workloads.
- Amazon ECR for container images.
- Amazon RDS PostgreSQL for backend and CMS databases.
- Amazon ElastiCache Redis for cache/session/queue use.
- AWS Secrets Manager plus External Secrets Operator for runtime secrets.
- AWS Load Balancer Controller for ALB ingress.
- AWS Certificate Manager for TLS on `raushni.com` and `*.raushni.com`.
- Route 53 for DNS.
- S3 is recommended for Strapi uploads and generated document storage.
- Kong API Gateway is recommended inside EKS for API routing, rate limiting, request controls, auth policy enforcement, and gateway telemetry.

## 1. Prerequisites

```bash
brew install awscli terraform kubectl helm jq
aws configure
aws sts get-caller-identity
```

Use region:

```bash
export AWS_REGION=ap-south-1
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
```

## 2. Provision AWS Infrastructure

```bash
cd infrastructure/terraform/aws
cp terraform.prod.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

- Set `hosted_zone_id` if Route 53 manages `raushni.com`.
- Set a strong `db_master_password`.
- Keep `additional_subject_alternative_names = ["*.raushni.com"]` for SaaS tenant subdomains.

Apply:

```bash
terraform init
terraform plan
terraform apply
```

Configure kubectl:

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name "$(terraform output -raw cluster_name)"
```

## 3. Push Runtime Secrets

Collect Terraform outputs:

```bash
export RDS_ENDPOINT="$(terraform output -raw rds_endpoint)"
export REDIS_ENDPOINT="$(terraform output -raw redis_primary_endpoint)"
export AWS_SECRET_ID="$(terraform output -raw app_secret_name)"
```

From repository root:

```bash
cd ../../..
export AWS_REGION=ap-south-1
export POSTGRES_USER=raushni_admin
export POSTGRES_PASSWORD='replace-with-real-rds-password'
export BACKEND_DATABASE_URL="postgresql+asyncpg://raushni_admin:${POSTGRES_PASSWORD}@${RDS_ENDPOINT}:5432/raushni_backend"
export CMS_DATABASE_NAME=raushni_backend
export CMS_DATABASE_HOST="${RDS_ENDPOINT}"
export CMS_DATABASE_PORT=5432
export CMS_DATABASE_USERNAME=raushni_admin
export CMS_DATABASE_PASSWORD="${POSTGRES_PASSWORD}"
export CMS_DATABASE_SSL=true
export REDIS_PASSWORD='replace-if-enabled'
export REDIS_URL="rediss://${REDIS_ENDPOINT}:6379"
export NEXTAUTH_SECRET="$(openssl rand -base64 48)"
export NEXTAUTH_ADMIN_EMAIL=admin@raushni.com
export NEXTAUTH_ADMIN_PASSWORD='replace-with-strong-password'
export NEXTAUTH_STAFF_EMAIL=staff@raushni.com
export NEXTAUTH_STAFF_PASSWORD='replace-with-strong-password'
export STRIPE_SECRET_KEY='sk_live_or_test_key'
export STRIPE_PUBLISHABLE_KEY='pk_live_or_test_key'
export STRIPE_WEBHOOK_SECRET='whsec_real_value'
export STRAPI_APP_KEYS="$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
export STRAPI_API_TOKEN_SALT="$(openssl rand -base64 32)"
export STRAPI_ADMIN_JWT_SECRET="$(openssl rand -base64 32)"
export STRAPI_JWT_SECRET="$(openssl rand -base64 32)"
export STRAPI_TRANSFER_TOKEN_SALT="$(openssl rand -base64 32)"
export DD_API_KEY='replace-or-use-placeholder'
make push-aws-secrets
```

## 4. Install External Secrets Operator

Patch the service account annotation with Terraform output:

```bash
cd infrastructure/terraform/aws
export EXTERNAL_SECRETS_ROLE_ARN="$(terraform output -raw external_secrets_role_arn)"
cd ../../..
```

Edit `k8s/external-secrets/serviceaccount.yaml` and set:

```yaml
eks.amazonaws.com/role-arn: <EXTERNAL_SECRETS_ROLE_ARN>
```

Install:

```bash
kubectl apply -k k8s/external-secrets
kubectl apply -k k8s/external-secret-store
```

## 5. Install AWS Load Balancer Controller

Create IAM policy and service account following AWS Load Balancer Controller documentation, then install via Helm:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="$(kubectl config view --minify -o jsonpath='{.contexts[0].context.cluster}' | sed 's|.*/||')" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller
```

## 6. Build and Push Images to ECR

Terraform creates these ECR repositories:

- `raushni-backend`
- `raushni-frontend`
- `raushni-cms`
- `raushni-document-generator`

Login:

```bash
aws ecr get-login-password --region ap-south-1 \
  | docker login --username AWS --password-stdin "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com"
```

Build and push:

```bash
docker build -t "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-backend:prod" backend
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.raushni.com \
  --build-arg NEXT_PUBLIC_CMS_URL=https://cms.raushni.com \
  --build-arg NEXTAUTH_URL=https://raushni.com \
  -t "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-frontend:prod" frontend
docker build -t "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-cms:prod" cms
docker build -t "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-document-generator:prod" services/document_generator

docker push "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-backend:prod"
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-frontend:prod"
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-cms:prod"
docker push "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/raushni-document-generator:prod"
```

Update image account IDs in `k8s/overlays/aws-saas/kustomization.yaml`.

## 7. Configure ACM Certificate ARN

```bash
cd infrastructure/terraform/aws
terraform output certificate_arn
cd ../../..
```

Replace the placeholder in:

```text
k8s/overlays/aws-saas/ingress-aws-alb.yaml
```

## 8. Deploy Raushni SaaS

Render first:

```bash
make k8s-aws-saas-render > /tmp/raushni-aws-saas.yaml
```

Apply:

```bash
make k8s-deploy-aws-saas
```

Watch rollout:

```bash
kubectl -n raushni get pods
kubectl -n raushni rollout status deploy/backend
kubectl -n raushni rollout status deploy/frontend
kubectl -n raushni rollout status deploy/strapi
kubectl -n raushni rollout status deploy/document-generator
```

Seed CMS:

```bash
kubectl -n raushni exec deploy/strapi -- npm run seed:raushni
```

## 9. DNS

Get ALB hostname:

```bash
kubectl -n raushni get ingress raushni-public
```

Create Route 53 records:

- `raushni.com` alias to ALB.
- `www.raushni.com` alias to ALB.
- `api.raushni.com` alias to ALB.
- `cms.raushni.com` alias to ALB.
- Optional `*.raushni.com` alias to ALB for SaaS tenant subdomains.

## 10. Validate

```bash
curl -I https://raushni.com
curl -I https://api.raushni.com/health
curl -I https://cms.raushni.com/_health
APP_BASE_URL=https://raushni.com API_BASE_URL=https://api.raushni.com CMS_BASE_URL=https://cms.raushni.com make smoke
API_BASE_URL=https://api.raushni.com make crud-smoke
```

## Production Notes

- Replace local Strapi upload PVC with S3 upload provider before heavy production use.
- Keep RDS deletion protection enabled.
- Keep at least two EKS nodes for production.
- Enable WAF on the ALB or CloudFront.
- Use Datadog/OpenTelemetry and CloudWatch log retention.
- Move from shared-database tenancy to database-per-tenant only when customer isolation demands it.

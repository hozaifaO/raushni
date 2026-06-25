# Raushni Deployment Playbook

This playbook is the planned execution path for making the Raushni NGO platform available on AWS with Cloudflare DNS/TLS.

## Scope

- Production domain: `raushni.com`
- AWS account: `301142909770`
- AWS profile: `reswt`
- AWS region: `ap-south-1`
- Kubernetes namespace: `raushni`
- Public app: `https://raushni.com`
- API: `https://api.raushni.com`
- CMS: `https://cms.raushni.com`

## Roles

| Role | Responsibility |
| --- | --- |
| Release owner | Owns release window, go/no-go, and rollback decision. |
| AWS operator | Runs Terraform, ECR, EKS, RDS, Redis, ACM, and Secrets Manager steps. |
| Cloudflare operator | Configures DNS, proxy status, SSL/TLS, WAF, redirects, and cache rules. |
| App verifier | Runs smoke, CRUD, CMS, donation, document, and public-page checks. |
| Content owner | Verifies Strapi content, templates, public pages, and document templates. |

## Pre-Flight Checklist

- Confirm AWS access:

```bash
export AWS_PROFILE=reswt
export AWS_REGION=ap-south-1
aws sts get-caller-identity --profile reswt
```

Expected account:

```text
301142909770
```

- Confirm tools:

```bash
docker --version
aws --version
terraform version
kubectl version --client
helm version
jq --version
```

- Confirm local repository:

```bash
cd /Users/owaisahmad/Documents/raushni
git status --short
```

- Run local validation before touching cloud:

```bash
npm --prefix frontend run type-check
npm --prefix frontend run test:ci
PYTHONPATH=backend pytest tests/backend -q
make k8s-validate
docker compose config --quiet
sh nginx/scripts/test-nginx.sh
```

## 1. Provision AWS Foundation

```bash
cd /Users/owaisahmad/Documents/raushni/infrastructure/terraform/aws
cp terraform.prod.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars`:

```hcl
aws_region         = "ap-south-1"
project            = "raushni"
environment        = "production"
domain_name        = "raushni.com"
hosted_zone_id     = ""
db_master_username = "raushni_admin"
db_master_password = "replace-with-real-strong-password"
app_secret_name    = "/raushni/production/app"
```

Use `hosted_zone_id = ""` when Cloudflare manages DNS. If Route 53 manages DNS, set the real hosted zone id.

Apply infrastructure:

```bash
terraform init
terraform plan
terraform apply
```

Capture outputs:

```bash
terraform output
export CLUSTER_NAME="$(terraform output -raw cluster_name)"
export RDS_ENDPOINT="$(terraform output -raw rds_endpoint)"
export REDIS_ENDPOINT="$(terraform output -raw redis_primary_endpoint)"
export AWS_SECRET_ID="$(terraform output -raw app_secret_name)"
export CERTIFICATE_ARN="$(terraform output -raw certificate_arn)"
export EXTERNAL_SECRETS_ROLE_ARN="$(terraform output -raw external_secrets_role_arn)"
```

## 2. Configure kubectl

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name "$CLUSTER_NAME" \
  --profile reswt

kubectl get nodes
```

## 3. Push Runtime Secrets

From the repository root:

```bash
cd /Users/owaisahmad/Documents/raushni

export AWS_PROFILE=reswt
export AWS_REGION=ap-south-1
export AWS_SECRET_ID=/raushni/production/app

export POSTGRES_USER=raushni_admin
export POSTGRES_PASSWORD='replace-with-real-rds-password'
export BACKEND_DATABASE_URL="postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${RDS_ENDPOINT}:5432/raushni_backend"

export CMS_DATABASE_NAME=raushni_backend
export CMS_DATABASE_HOST="${RDS_ENDPOINT}"
export CMS_DATABASE_PORT=5432
export CMS_DATABASE_USERNAME="${POSTGRES_USER}"
export CMS_DATABASE_PASSWORD="${POSTGRES_PASSWORD}"
export CMS_DATABASE_SSL=true

export REDIS_PASSWORD='replace-if-required'
export REDIS_URL="rediss://${REDIS_ENDPOINT}:6379"

export NEXTAUTH_SECRET="$(openssl rand -base64 48)"
export NEXTAUTH_ADMIN_EMAIL=admin@raushni.com
export NEXTAUTH_ADMIN_PASSWORD='replace-with-real-admin-password'
export NEXTAUTH_STAFF_EMAIL=staff@raushni.com
export NEXTAUTH_STAFF_PASSWORD='replace-with-real-staff-password'

export STRIPE_SECRET_KEY='replace-with-stripe-secret'
export STRIPE_PUBLISHABLE_KEY='replace-with-stripe-publishable-key'
export STRIPE_WEBHOOK_SECRET='replace-with-stripe-webhook-secret'

export STRAPI_APP_KEYS="$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32),$(openssl rand -base64 32)"
export STRAPI_API_TOKEN_SALT="$(openssl rand -base64 32)"
export STRAPI_ADMIN_JWT_SECRET="$(openssl rand -base64 32)"
export STRAPI_JWT_SECRET="$(openssl rand -base64 32)"
export STRAPI_TRANSFER_TOKEN_SALT="$(openssl rand -base64 32)"

export DD_API_KEY='replace-or-placeholder'

make push-aws-secrets
```

## 4. Install Cluster Add-Ons

Patch External Secrets IRSA role:

```bash
perl -0pi -e "s|eks.amazonaws.com/role-arn: .*|eks.amazonaws.com/role-arn: ${EXTERNAL_SECRETS_ROLE_ARN}|" \
  k8s/external-secrets/serviceaccount.yaml
```

Install External Secrets:

```bash
kubectl apply -k k8s/external-secrets
kubectl apply -k k8s/external-secret-store
kubectl -n external-secrets get pods
```

Install AWS Load Balancer Controller:

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName="$CLUSTER_NAME" \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

kubectl -n kube-system rollout status deploy/aws-load-balancer-controller --timeout=300s
```

## 5. Build and Push Images

```bash
export AWS_ACCOUNT_ID=301142909770

aws ecr get-login-password --region ap-south-1 --profile reswt \
  | docker login --username AWS --password-stdin \
  "${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com"

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

## 6. Patch Deployment Values

Confirm ECR account ids are set:

```bash
rg -n "301142909770|REPLACE_WITH_ACM" k8s/overlays/aws-saas
```

Set the real certificate ARN:

```bash
perl -0pi -e "s|arn:aws:acm:ap-south-1:301142909770:certificate/REPLACE_WITH_ACM_CERTIFICATE_ID|${CERTIFICATE_ARN}|" \
  k8s/overlays/aws-saas/ingress-aws-alb.yaml
```

Render before deploy:

```bash
make k8s-aws-saas-render > /tmp/raushni-aws-saas.yaml
rg -n "image:|certificate-arn|host:" /tmp/raushni-aws-saas.yaml
```

## 7. Deploy Application

```bash
kubectl apply -f /tmp/raushni-aws-saas.yaml

kubectl -n raushni rollout status deploy/backend --timeout=300s
kubectl -n raushni rollout status deploy/frontend --timeout=300s
kubectl -n raushni rollout status deploy/strapi --timeout=420s
kubectl -n raushni rollout status deploy/document-generator --timeout=300s
kubectl -n raushni get pods
```

Seed CMS:

```bash
kubectl -n raushni exec deploy/strapi -- npm run seed:raushni
```

## 8. Configure Cloudflare

Get ALB hostname:

```bash
kubectl -n raushni get ingress raushni-public
```

Create Cloudflare DNS records:

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `@` | ALB hostname | DNS only first |
| CNAME | `www` | ALB hostname | DNS only first |
| CNAME | `api` | ALB hostname | DNS only first |
| CNAME | `cms` | ALB hostname | DNS only first |
| CNAME | `*` | ALB hostname | DNS only first, optional |

Set Cloudflare SSL/TLS:

```text
SSL/TLS mode: Full (strict)
Always Use HTTPS: On
Automatic HTTPS Rewrites: On
Minimum TLS: TLS 1.2
```

After validation, proxy `@`, `www`, and `api`. Keep `cms` DNS-only until Strapi admin and uploads are verified.

## 9. Release Validation

```bash
curl -I https://raushni.com
curl -I https://api.raushni.com/health
curl -I https://cms.raushni.com/_health

APP_BASE_URL=https://raushni.com \
API_BASE_URL=https://api.raushni.com \
CMS_BASE_URL=https://cms.raushni.com \
make smoke

API_BASE_URL=https://api.raushni.com make crud-smoke
```

Manual checks:

- Login works at `https://raushni.com/login`.
- Super admin can create, edit, update, and delete dashboard records.
- Strapi admin loads at `https://cms.raushni.com/admin`.
- CMS public content renders on About, activities, events, news, gallery, careers, volunteer, contact, and donation pages.
- Donation flow creates payment status and receipt.
- Document generation works for ID cards, receipts, invoices, certificates, appointment letters, and QR codes.
- Public certificate verification URL works.
- Cloudflare analytics show traffic.

## Go / No-Go

Go only when:

- All rollouts are complete.
- Smoke checks pass.
- CRUD smoke passes.
- CMS admin is available.
- Payment webhook endpoint is configured.
- Cloudflare TLS is Full (strict).
- Rollback image tags are known.

No-go when:

- API health fails.
- CMS is blank or buffering.
- Dashboard CRUD fails.
- Login fails for admin.
- ALB has no healthy targets.
- Cloudflare returns 525, 526, or redirect loops.

## Rollback

Rollback to the previous image tag:

```bash
kubectl -n raushni set image deploy/backend backend=<previous-backend-image>
kubectl -n raushni set image deploy/frontend frontend=<previous-frontend-image>
kubectl -n raushni set image deploy/strapi strapi=<previous-cms-image>
kubectl -n raushni set image deploy/document-generator document-generator=<previous-document-generator-image>

kubectl -n raushni rollout status deploy/backend --timeout=300s
kubectl -n raushni rollout status deploy/frontend --timeout=300s
kubectl -n raushni rollout status deploy/strapi --timeout=420s
kubectl -n raushni rollout status deploy/document-generator --timeout=300s
```

If DNS causes the issue, switch Cloudflare records back to DNS-only and lower security rules temporarily while investigating.


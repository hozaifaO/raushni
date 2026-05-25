# Raushni AWS Terraform

This Terraform stack provisions a production foundation for Raushni:

- VPC across two availability zones
- Public/private subnets with NAT
- EKS cluster and managed node group
- RDS PostgreSQL with encryption, backups, Multi-AZ, and deletion protection
- ElastiCache Redis with encryption and failover
- ECR repositories for application images
- AWS Secrets Manager secret for application runtime secrets
- IAM role for External Secrets Operator through EKS IRSA
- ACM certificate for `raushni.com`, `www`, `api`, `cms`, and `auth`

## Usage

```bash
cd infrastructure/terraform/aws
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Keep `terraform.tfvars` out of git when it contains real passwords.

## Runtime Secrets

Terraform creates the AWS Secrets Manager secret container only. Put actual application values into that secret outside Terraform so secret values do not land in Terraform state:

```bash
terraform output app_secret_name
terraform output external_secrets_role_arn
```

From the repository root, export the required values and push them:

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

Patch `k8s/external-secrets/serviceaccount.yaml` with `external_secrets_role_arn` before deploying the Kubernetes manifests.

## Configure kubectl

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name raushni-production-eks
```

Then deploy Kubernetes resources from the repository root:

```bash
kubectl apply -k k8s/external-secrets
kubectl apply -k k8s/external-secret-store
kubectl apply -k k8s
```

## DNS and TLS

If `hosted_zone_id` is set, Terraform creates DNS validation records for ACM. If DNS is managed elsewhere, copy the ACM validation records from the AWS console and create them with your DNS provider.

For Kubernetes ingress TLS, install nginx ingress and cert-manager in the cluster, then make sure a `letsencrypt-prod` `ClusterIssuer` exists.

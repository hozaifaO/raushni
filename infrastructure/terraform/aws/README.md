# Raushni AWS Terraform

This Terraform stack provisions an AWS foundation for Raushni. Defaults are tuned for nonprod/development so the platform can be made available without production-sized fixed cost. Production settings are provided in `terraform.prod.tfvars.example`.

- VPC across two availability zones
- Public/private subnets with optional NAT
- EKS cluster and managed node group
- EKS managed add-ons for VPC CNI, CoreDNS, kube-proxy, and EBS CSI
- RDS PostgreSQL with encryption and configurable backups/Multi-AZ/deletion protection
- ElastiCache Redis with encryption and optional failover
- ECR repositories for application images
- ECR lifecycle cleanup for old images
- AWS Secrets Manager secret for application runtime secrets
- IAM role for External Secrets Operator through EKS IRSA
- ACM certificate for `raushni.com`, `www`, `api`, `cms`, and `auth`

## Nonprod Usage

```bash
cd infrastructure/terraform/aws
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

The default example creates:

- one small EKS node in public subnets
- EKS managed add-ons enabled
- no NAT gateway
- single-AZ RDS
- single Redis node
- short RDS backup retention
- no EKS control-plane log ingestion

This is intended for `raushni-dev.com` / development. Use it for validation and demos, not production resilience.

## Production Usage

```bash
cd infrastructure/terraform/aws
cp terraform.prod.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Production enables private worker nodes behind NAT, RDS Multi-AZ, Redis failover, deletion protection, and EKS control-plane logs.

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
export AWS_SECRET_ID=/raushni/development/app
export POSTGRES_USER=...
export POSTGRES_PASSWORD=...
export BACKEND_DATABASE_URL=...
export CMS_DATABASE_NAME=...
export CMS_DATABASE_USERNAME=...
export CMS_DATABASE_PASSWORD=...
export REDIS_PASSWORD=...
export REDIS_URL=...
export NEXTAUTH_SECRET=...
export NEXTAUTH_ADMIN_EMAIL=...
export NEXTAUTH_ADMIN_PASSWORD=...
export NEXTAUTH_STAFF_EMAIL=...
export NEXTAUTH_STAFF_PASSWORD=...
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
  --name raushni-development-eks
```

Then deploy Kubernetes resources from the repository root:

```bash
kubectl apply -k k8s/external-secrets
kubectl apply -k k8s/external-secret-store
kubectl kustomize --load-restrictor LoadRestrictionsNone k8s/overlays/nonprod | kubectl apply -f -
kubectl apply -k k8s/addons/kubernetes-dashboard
```

Use `terraform output external_secrets_role_arn` to annotate the External Secrets service account before installing the operator. Use `terraform output ebs_csi_role_arn` if you need to inspect the EBS CSI IRSA role.

## DNS and TLS

If `hosted_zone_id` is set, Terraform creates DNS validation records for ACM. If DNS is managed elsewhere, copy the ACM validation records from the AWS console and create them with your DNS provider.

For Kubernetes ingress TLS, install nginx ingress and cert-manager in the cluster, then make sure a `letsencrypt-prod` `ClusterIssuer` exists.

## Cost Controls

- Keep `enable_nat_gateway=false` in development to avoid NAT fixed hourly/data processing charges.
- Keep `node_desired_size=1` for nonprod and scale only during test windows.
- Use `db_multi_az=false` and `redis_num_cache_clusters=1` in development.
- Leave `eks_enabled_cluster_log_types=[]` in development unless actively debugging.
- Keep `enable_eks_managed_addons=true`; these add-ons are part of the EKS runtime baseline, not optional application capacity.
- ECR lifecycle policies expire old/untagged images automatically.
- Stop or destroy the development stack when it is not needed.

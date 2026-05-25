# Raushni AWS Terraform

This Terraform stack provisions a production foundation for Raushni:

- VPC across two availability zones
- Public/private subnets with NAT
- EKS cluster and managed node group
- RDS PostgreSQL with encryption, backups, Multi-AZ, and deletion protection
- ElastiCache Redis with encryption and failover
- ECR repositories for application images
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

## Configure kubectl

```bash
aws eks update-kubeconfig \
  --region ap-south-1 \
  --name raushni-production-eks
```

Then deploy Kubernetes resources from the repository root:

```bash
kubectl apply -k k8s
```

## DNS and TLS

If `hosted_zone_id` is set, Terraform creates DNS validation records for ACM. If DNS is managed elsewhere, copy the ACM validation records from the AWS console and create them with your DNS provider.

For Kubernetes ingress TLS, install nginx ingress and cert-manager in the cluster, then make sure a `letsencrypt-prod` `ClusterIssuer` exists.

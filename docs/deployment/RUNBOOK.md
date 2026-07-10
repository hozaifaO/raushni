# Raushni Operations Runbook

This runbook covers day-2 operations, health checks, incident response, backup, restore, scaling, and cost control for the Raushni NGO platform.

## Quick Access

```bash
cd /Users/owaisahmad/Documents/raushni
export AWS_PROFILE=reswt
export AWS_REGION=ap-south-1
kubectl config current-context
kubectl -n raushni get pods
```

Production URLs:

- App: `https://raushni.com`
- API health: `https://api.raushni.com/health`
- CMS health: `https://cms.raushni.com/_health`
- CMS admin: `https://cms.raushni.com/admin`

## Daily Health Check

```bash
kubectl -n raushni get pods
kubectl -n raushni get deploy
kubectl -n raushni get ingress raushni-public
kubectl -n raushni get externalsecret raushni-secrets

curl -I https://raushni.com
curl -I https://api.raushni.com/health
curl -I https://cms.raushni.com/_health
```

Run app smoke:

```bash
APP_BASE_URL=https://raushni.com \
API_BASE_URL=https://api.raushni.com \
CMS_BASE_URL=https://cms.raushni.com \
make smoke
```

Run CRUD smoke:

```bash
API_BASE_URL=https://api.raushni.com make crud-smoke
```

## Local K8s Health Check

```bash
kubectl config use-context docker-desktop
make k8s-local-status
make k8s-local-smoke
make k8s-local-crud-smoke
```

Expected:

- All Raushni pods are `Running`.
- Smoke reports `failures=0`.
- CRUD smoke reports 11 modules passed.

## Common Incidents

### 1. Public Site Is Down

Symptoms:

- `https://raushni.com` does not load.
- Browser shows 502, 503, 504, 525, or 526.

Check:

```bash
kubectl -n raushni get ingress raushni-public
kubectl -n raushni get pods
kubectl -n raushni describe ingress raushni-public
kubectl -n kube-system logs deploy/aws-load-balancer-controller --tail=200
```

If pods are unhealthy:

```bash
kubectl -n raushni describe pod <pod-name>
kubectl -n raushni logs <pod-name> --tail=200
```

If Cloudflare returns 525 or 526:

- Confirm public DNS records point to the ALB hostname, not a private IP such as `192.168.x.x`:

```bash
dig +short raushni.com
dig +short www.raushni.com
dig +short api.raushni.com
dig +short cms.raushni.com
```

- Confirm the production ingress has a real ACM certificate ARN and not the placeholder:

```bash
kubectl -n raushni get ingress raushni-public \
  -o jsonpath='{.metadata.annotations.alb\.ingress\.kubernetes\.io/certificate-arn}{"\n"}'
```

- Confirm ALB HTTPS is healthy before involving Cloudflare. In Cloudflare, temporarily set the affected record to DNS-only, wait for DNS propagation, then run:

```bash
curl -Iv https://raushni.com --max-time 20
curl -Iv https://api.raushni.com/health --max-time 20
```

- If direct ALB HTTPS fails, check the AWS Load Balancer Controller and the ALB listener/certificate:

```bash
kubectl -n raushni describe ingress raushni-public
kubectl -n kube-system logs deploy/aws-load-balancer-controller --tail=200
```

- If direct ALB HTTPS works but proxied Cloudflare still returns 525, set Cloudflare SSL/TLS mode to `Full (strict)`, keep the DNS target on the ALB hostname, and disable/re-enable proxy on the record after validation.

### 2. API Health Fails

Check:

```bash
kubectl -n raushni logs deploy/backend --tail=200
kubectl -n raushni describe deploy/backend
kubectl -n raushni get secret raushni-secrets
kubectl -n raushni exec deploy/backend -- printenv | sort
```

Common causes:

- `BACKEND_DATABASE_URL` is wrong.
- RDS security group blocks EKS node traffic.
- ExternalSecret did not sync.
- Backend image tag does not exist in ECR.

Actions:

```bash
kubectl -n raushni rollout restart deploy/backend
kubectl -n raushni rollout status deploy/backend --timeout=300s
```

### 3. CMS Admin Blank or Buffering

Check:

```bash
kubectl -n raushni logs deploy/strapi --tail=300
kubectl -n raushni describe deploy/strapi
curl -I https://cms.raushni.com/_health
```

Common causes:

- `CMS_DATABASE_HOST`, `CMS_DATABASE_SSL`, or password is wrong.
- `PUBLIC_URL` or `ADMIN_URL` is wrong.
- Cloudflare proxy interferes with admin or uploads.
- Strapi build assets are missing from image.

Actions:

```bash
kubectl -n raushni rollout restart deploy/strapi
kubectl -n raushni rollout status deploy/strapi --timeout=420s
```

Keep `cms.raushni.com` DNS-only until admin and uploads are stable.

### 4. Dashboard Login Fails

Check configured credentials:

```bash
kubectl -n raushni get secret raushni-secrets -o jsonpath='{.data.NEXTAUTH_ADMIN_EMAIL}' | base64 --decode
echo
kubectl -n raushni get secret raushni-secrets -o jsonpath='{.data.NEXTAUTH_STAFF_EMAIL}' | base64 --decode
echo
```

Do not print passwords in shared terminals. If reset is required, update AWS Secrets Manager and restart frontend:

```bash
make push-aws-secrets
kubectl -n raushni rollout restart deploy/frontend
kubectl -n raushni rollout status deploy/frontend --timeout=300s
```

### 5. Dashboard CRUD Fails

Run:

```bash
API_BASE_URL=https://api.raushni.com make crud-smoke
kubectl -n raushni logs deploy/backend --tail=300
```

Check database:

```bash
kubectl -n raushni get secret raushni-secrets
kubectl -n raushni describe externalsecret raushni-secrets
```

Likely causes:

- Backend cannot reach database.
- CORS or auth headers are blocked.
- Migration/schema mismatch.
- RDS storage or connection limit pressure.

### 6. Document Generation Fails

Check:

```bash
kubectl -n raushni logs deploy/document-generator --tail=300
kubectl -n raushni describe deploy/document-generator
curl -I https://raushni.com/documents
```

Verify:

- QR generation works.
- PDF templates exist in CMS and static templates.
- Frontend document pages open.
- Backend document APIs return successful payloads.

### 7. Donation or Stripe Payment Fails

Check:

```bash
kubectl -n raushni logs deploy/backend --tail=300
kubectl -n raushni get secret raushni-secrets
```

Verify in AWS Secrets Manager:

- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

Verify Stripe dashboard:

- Webhook endpoint points to `https://raushni.com/api/webhook/stripe`.
- Webhook signing secret matches `STRIPE_WEBHOOK_SECRET`.
- Test donation creates a donation record and receipt.

## Rollout Operations

Restart one service:

```bash
kubectl -n raushni rollout restart deploy/backend
kubectl -n raushni rollout status deploy/backend --timeout=300s
```

Restart all app services:

```bash
kubectl -n raushni rollout restart deploy/backend deploy/frontend deploy/strapi deploy/document-generator
kubectl -n raushni get pods -w
```

Scale service:

```bash
kubectl -n raushni scale deploy/frontend --replicas=3
kubectl -n raushni scale deploy/backend --replicas=3
```

View events:

```bash
kubectl -n raushni get events --sort-by=.metadata.creationTimestamp
```

## Rollback

Show rollout history:

```bash
kubectl -n raushni rollout history deploy/backend
kubectl -n raushni rollout history deploy/frontend
kubectl -n raushni rollout history deploy/strapi
kubectl -n raushni rollout history deploy/document-generator
```

Rollback last deployment:

```bash
kubectl -n raushni rollout undo deploy/backend
kubectl -n raushni rollout undo deploy/frontend
kubectl -n raushni rollout undo deploy/strapi
kubectl -n raushni rollout undo deploy/document-generator
```

Or pin specific previous image:

```bash
kubectl -n raushni set image deploy/backend backend=<previous-image>
kubectl -n raushni set image deploy/frontend frontend=<previous-image>
kubectl -n raushni set image deploy/strapi strapi=<previous-image>
kubectl -n raushni set image deploy/document-generator document-generator=<previous-image>
```

## Backup

RDS should have automated backups enabled by Terraform. Before a risky release, create a manual snapshot:

```bash
aws rds describe-db-instances --profile reswt --region ap-south-1
aws rds create-db-snapshot \
  --db-instance-identifier <db-instance-id> \
  --db-snapshot-identifier raushni-production-pre-release-$(date +%Y%m%d%H%M) \
  --profile reswt \
  --region ap-south-1
```

Backup Strapi uploads if still using local/PVC storage:

```bash
kubectl -n raushni exec deploy/strapi -- tar czf /tmp/strapi-uploads.tgz public/uploads
kubectl -n raushni cp deploy/strapi:/tmp/strapi-uploads.tgz ./strapi-uploads.tgz
```

For production scale, move Strapi uploads and generated documents to S3.

## Restore

Database restore is a controlled operation. Use a maintenance window.

High-level restore:

1. Create a new RDS instance from the selected snapshot.
2. Update AWS Secrets Manager database host/password values.
3. Let External Secrets sync.
4. Restart backend and Strapi.
5. Run smoke and CRUD checks.

Commands:

```bash
make push-aws-secrets
kubectl -n raushni rollout restart deploy/backend deploy/strapi
kubectl -n raushni rollout status deploy/backend --timeout=300s
kubectl -n raushni rollout status deploy/strapi --timeout=420s
```

## Secrets Rotation

Update values locally as environment variables, then push:

```bash
export AWS_PROFILE=reswt
export AWS_REGION=ap-south-1
export AWS_SECRET_ID=/raushni/production/app

# Export the full current secret set, changing only the rotated value.
make push-aws-secrets

kubectl -n raushni rollout restart deploy/backend deploy/frontend deploy/strapi deploy/document-generator
```

Confirm External Secrets sync:

```bash
kubectl -n raushni describe externalsecret raushni-secrets
kubectl -n raushni get secret raushni-secrets
```

## Cloudflare Operations

Normal proxy state:

- `raushni.com`: proxied after validation
- `www.raushni.com`: proxied after validation
- `api.raushni.com`: proxied after validation
- `cms.raushni.com`: DNS-only until CMS upload/admin flows are proven

Cloudflare TLS:

```text
SSL/TLS mode: Full (strict)
Always Use HTTPS: On
Automatic HTTPS Rewrites: On
Minimum TLS: TLS 1.2
```

If Cloudflare blocks traffic:

1. Temporarily set record to DNS-only.
2. Re-test origin through ALB.
3. Relax recent WAF/rate-limit rule.
4. Re-enable proxy after validation.

## Monitoring

Check app logs:

```bash
kubectl -n raushni logs deploy/frontend --tail=200
kubectl -n raushni logs deploy/backend --tail=200
kubectl -n raushni logs deploy/strapi --tail=200
kubectl -n raushni logs deploy/document-generator --tail=200
```

Check resource pressure:

```bash
kubectl -n raushni top pods
kubectl top nodes
```

If `top` is unavailable, install metrics-server in the cluster.

Recommended alert signals:

- API health non-200 for 5 minutes.
- CMS health non-200/204 for 5 minutes.
- Pod restart count increases.
- RDS CPU greater than 80 percent for 10 minutes.
- RDS free storage below 20 percent.
- Redis memory pressure.
- ALB 5xx spike.
- Cloudflare 5xx spike.
- Stripe webhook failures.

## Cost Control

Weekly checks:

```bash
aws ce get-cost-and-usage \
  --time-period Start=$(date -v-7d +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics UnblendedCost \
  --profile reswt \
  --region ap-south-1
```

Review:

- EKS node count and instance type.
- NAT Gateway usage.
- Idle ALBs.
- RDS size and Multi-AZ needs.
- Redis node count.
- EBS unattached volumes.
- ECR old image tags.
- CloudWatch log retention.

For non-prod, prefer destroying or scaling down instead of leaving resources idle.

## Local Stop and Start

Stop local K8s app workloads:

```bash
make k8s-local-stop
```

Start local workloads:

```bash
make k8s-local-start
make k8s-local-status
make k8s-local-smoke
```

Clean local cache:

```bash
make k8s-local-clean-cache
```

Deep clean only when intentionally removing unused Docker data:

```bash
YES=true make k8s-local-deep-clean
```

## Escalation Checklist

Before escalating, collect:

```bash
kubectl -n raushni get pods -o wide
kubectl -n raushni get ingress raushni-public -o yaml
kubectl -n raushni get events --sort-by=.metadata.creationTimestamp
kubectl -n raushni logs deploy/backend --tail=300
kubectl -n raushni logs deploy/frontend --tail=300
kubectl -n raushni logs deploy/strapi --tail=300
kubectl -n raushni logs deploy/document-generator --tail=300
```

Also collect:

- Last release image tags.
- Recent Cloudflare DNS/WAF changes.
- Recent AWS Secrets Manager changes.
- Terraform output for cluster, RDS, Redis, and certificate.
- Smoke and CRUD command output.

# Raushni SaaS Annual Costing

This is a planning estimate for running Raushni as a SaaS NGO platform with Cloudflare CDN/WAF, AWS EKS, ALB, RDS PostgreSQL, Redis, S3, Kong/API gateway, observability, and non-prod environments.

## Planning Assumptions

- AWS region: `ap-south-1`.
- Workloads: frontend, backend API, Strapi CMS, document generator, Kong/API gateway, observability agents.
- Environments: production plus one production-like non-prod.
- Pricing model: on-demand, 24x7, 730 hours/month, 8,760 hours/year.
- Kong: self-hosted open-source gateway unless otherwise noted.
- Cloudflare: Pro for launch; Business where formal SLA/PCI features are required.
- Currency conversion: planning rate of `1 USD = INR 95`. Replace with the actual finance rate at purchase/invoice time.
- Excludes engineering salaries, laptops, accounting tools, GST/taxes, marketplace taxes, payment gateway transaction fees, SMS pass-through volume, and one-time implementation/professional services.

## Executive Summary

| Scenario | Monthly USD | Annual USD | Annual INR at 95/USD | Best fit |
| --- | ---: | ---: | ---: | --- |
| Lean NGO Launch | 850 - 1,500 | 10,200 - 18,000 | 9.69L - 17.10L | Early launch, low traffic, careful monitoring spend. |
| Recommended Production | 1,500 - 2,900 | 18,000 - 34,800 | 17.10L - 33.06L | Production HA with non-prod, CDN/WAF, backups, observability. |
| Growth / Enterprise | 3,800 - 7,500+ | 45,600 - 90,000+ | 43.32L - 85.50L+ | Higher traffic, stronger SLA, Kong/Datadog paid tiers, compliance. |

Recommended first-year budget for Raushni: `USD 22,000 - 30,000` or about `INR 20.9L - 28.5L`, including a 15% contingency but excluding salaries and payment/SMS transaction fees.

## Annual Infrastructure Breakdown

| Cost area | Lean annual USD | Recommended annual USD | Notes |
| --- | ---: | ---: | --- |
| AWS EKS control planes | 876 - 1,752 | 1,752 | One cluster costs about `0.10/hour`; prod + non-prod doubles this. |
| EKS worker nodes and EBS | 1,300 - 2,400 | 2,400 - 5,500 | Backend, frontend, CMS, document generator, Kong, agents. |
| RDS PostgreSQL | 1,500 - 3,000 | 3,000 - 7,000 | Single-AZ for lean; Multi-AZ, backups, and more storage for recommended. |
| Redis / ElastiCache | 300 - 900 | 900 - 2,400 | Cache/session/queue use. |
| ALB, ingress, traffic, public IPv4 | 600 - 1,500 | 1,200 - 3,000 | Depends on number of ALBs, LCUs, and public traffic. |
| NAT gateway / private subnet egress | 0 - 1,200 | 1,200 - 3,600 | Can be a quiet cost trap. Lean non-prod may avoid NAT. |
| S3, ECR, backups, Secrets Manager | 500 - 1,500 | 1,200 - 3,500 | Uploads, documents, images, container storage, secrets. |
| CloudWatch logs/metrics | 300 - 1,200 | 1,000 - 4,000 | Strongly affected by app, ingress, and debug log volume. |
| Cloudflare CDN/WAF/DNS | 240 | 240 - 2,400 | Pro is `20/month` annual; Business is `200/month` annual. |
| Kong/API gateway | 0 | 0 - 2,400+ | Self-hosted OSS is infrastructure-only; Konnect paid tiers add control-plane/API costs. |
| Datadog / observability SaaS | 0 - 1,500 | 1,500 - 7,500 | Infrastructure monitoring starts per host; logs/APM add usage-based costs. |
| Email, SMS, domain, misc SaaS | 300 - 2,000 | 1,000 - 5,000 | SES/SMTP, SMS OTP/alerts, domain renewals, monitoring checks. |
| Contingency | 1,000 - 2,500 | 2,500 - 5,500 | 10-20% for traffic spikes, FX, logs, storage growth. |
| Total | 10,200 - 18,000 | 18,000 - 34,800 | Use recommended for finance planning. |

## AWS Cost Notes

EKS is charged separately from the worker nodes. Standard support cluster pricing is `0.10 USD per cluster hour`, and AWS also charges for worker node resources such as EC2, EBS, public IPv4, and cross-AZ traffic.

The largest AWS cost drivers for this platform will usually be:

- RDS size, Multi-AZ, storage, and backups.
- Worker node count and instance family.
- NAT gateway count and outbound data.
- CloudWatch log ingestion and retention.
- ALB LCU usage and number of public load balancers.
- S3 storage for CMS uploads, generated PDFs, and backups.

Cost controls:

- Keep non-prod scaled down outside work hours where possible.
- Use one non-prod environment, not one cluster per developer.
- Keep CMS uploads in S3 with lifecycle policies.
- Set CloudWatch retention explicitly.
- Use Cloudflare caching for public/static content.
- Avoid verbose debug logs in production.
- Consider Savings Plans or Reserved Instances after 60-90 days of stable usage.

## Cloudflare CDN and WAF

Cloudflare plan options:

| Plan | Annual USD | Recommended use |
| --- | ---: | --- |
| Free | 0 | DNS/CDN testing, not ideal for production NGO platform. |
| Pro | 240 | Launch default for CDN, WAF, DNS, Universal SSL. |
| Business | 2,400 | Use when SLA, PCI, stronger support, or production assurance matters. |
| Enterprise/Contract | Custom | Use only when traffic/security/compliance justifies it. |

Recommended launch setting: Cloudflare Pro for `raushni.com`, with `Full (strict)` TLS and origin TLS on AWS ALB through ACM.

## Kong/API Gateway

| Option | Annual USD | Notes |
| --- | ---: | --- |
| Kong Gateway OSS self-hosted | 0 license | Recommended starting point. Runs inside EKS; pay only AWS compute. |
| Kong Konnect serverless control plane | 300+ | Useful for managed control-plane workflows. Usage limits apply. |
| Kong Konnect hybrid control plane | 2,400+ | Paid control plane; additional API request costs may apply. |
| Kong Enterprise self-hosted | Custom | Use when SSO, audit logs, enterprise support, and advanced governance are required. |

Recommended launch setting: self-hosted Kong Gateway in EKS. Move to paid Kong only after API traffic, compliance, or governance needs justify it.

## Observability

Lean mode:

- CloudWatch logs/metrics with explicit retention.
- OpenTelemetry collector.
- Uptime checks.
- Minimal Datadog or no Datadog.

Recommended production:

- Datadog Infrastructure Monitoring for EKS nodes.
- APM on backend, frontend server, CMS, and document generator where needed.
- Log indexing only for important services and error/security events.

Control observability spend with:

- Log sampling.
- Shorter retention for noisy debug logs.
- Archive raw logs to S3.
- Index only errors, audit events, payment events, auth failures, and selected API traces.

## Transaction and Pass-Through Costs

These are not infrastructure costs but must be budgeted:

| Item | Budget approach |
| --- | --- |
| Payment gateway | Percentage and fixed fee per donation/payment. Use the provider quote for NGO pricing. |
| SMS/WhatsApp | Per-message pricing. Budget by OTP, reminder, and campaign volume. |
| Email | Usually low with SES/SMTP, but marketing mail can grow. |
| Domain renewals | Annual registrar cost for `raushni.com`, `raushni-dev.com`, and variants. |
| Backups/export storage | Depends on document volume and retention period. |

## Suggested Year-1 Budget

For a serious NGO SaaS launch, plan:

```text
Infrastructure and platform:      USD 18,000 - 24,000
Observability and security tools: USD 2,000 - 5,000
Email/SMS/domain/misc:            USD 1,000 - 3,000
Contingency:                      USD 2,000 - 4,000
---------------------------------------------------
Recommended Year-1 budget:        USD 22,000 - 30,000
Approx INR at 95/USD:             INR 20.9L - 28.5L
```

## Scale Triggers

Move from lean to recommended when:

- Public traffic consistently exceeds 50,000 visits/month.
- API traffic exceeds 1-2 million requests/month.
- Donation/payment flows are active.
- CMS uploads and generated documents exceed 100 GB.
- Admin dashboard becomes operationally critical.
- You need formal uptime expectations for NGO partners or donors.

Move from recommended to growth/enterprise when:

- Multiple NGOs/tenants are onboarded.
- You need tenant-specific subdomains and stronger API isolation.
- API volume exceeds 10 million requests/month.
- Compliance requires audit logs, SSO, formal SLA, or dedicated support.
- RDS CPU/storage/connection pressure requires larger instances or read replicas.

## Sources Checked

- AWS EKS pricing: https://aws.amazon.com/eks/pricing/
- AWS Elastic Load Balancing pricing: https://aws.amazon.com/elasticloadbalancing/pricing/
- AWS RDS for PostgreSQL pricing: https://aws.amazon.com/rds/postgresql/pricing/
- AWS S3 pricing: https://aws.amazon.com/s3/pricing/
- AWS Secrets Manager pricing: https://aws.amazon.com/secrets-manager/pricing/
- Cloudflare plans: https://www.cloudflare.com/plans/
- Kong pricing: https://konghq.com/pricing/
- Datadog pricing: https://www.datadoghq.com/pricing/

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
- Datadog Agent/OpenTelemetry Collector if `OTEL_SDK_DISABLED=false`

## Deploy

Review and replace placeholder values in `secrets.yaml`, then:

```bash
kubectl apply -k k8s
```

For production, prefer creating the secret from a secret manager instead of applying `secrets.yaml` directly:

```bash
kubectl -n raushni create secret generic raushni-secrets \
  --from-literal=POSTGRES_PASSWORD='...' \
  --from-literal=BACKEND_DATABASE_URL='...' \
  --from-literal=NEXTAUTH_SECRET='...' \
  --dry-run=client -o yaml | kubectl apply -f -
```

## Image Tags

The manifests use `ghcr.io/owais4u/raushni-*:1.0.0` as production image placeholders. Update tags through Kustomize before release:

```bash
kubectl kustomize k8s
```

## Storage

`postgres`, `redis`, and `strapi` uploads use persistent volumes. For multi-replica Strapi, move uploads to S3-compatible object storage or use a ReadWriteMany storage class.

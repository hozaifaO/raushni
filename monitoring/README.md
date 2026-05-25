# Raushni Monitoring

Production monitoring uses OpenTelemetry as the application instrumentation layer and Datadog as the observability backend.

## Services

- `otel-collector`: receives OTLP traces, metrics, and logs from Raushni services on `4317` and `4318`, then exports to Datadog.
- `datadog-agent`: collects container/host telemetry and also exposes Datadog OTLP ingestion for future direct-agent workflows.

## Required Environment

Set these in production:

```bash
DD_API_KEY=replace-with-datadog-api-key
DD_SITE=datadoghq.com
DD_ENV=production
DD_VERSION=1.0.0
OTEL_SDK_DISABLED=false
OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4317
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```

Use `datadoghq.eu`, `us3.datadoghq.com`, `us5.datadoghq.com`, or your Datadog site when it differs from `datadoghq.com`.

## Local Run

Monitoring is behind a Docker Compose profile so normal local development can stay quiet.

```bash
docker compose --profile monitoring up -d otel-collector datadog-agent
docker compose up -d backend frontend strapi
```

For a full monitored stack:

```bash
OTEL_SDK_DISABLED=false docker compose --profile monitoring up -d
```

Collector health:

```bash
curl http://localhost:13133/
```

Datadog Agent status:

```bash
docker compose exec datadog-agent agent status
```

## Service Names

- `raushni-backend`
- `raushni-frontend`
- `raushni-cms`
- `raushni-document-generator`

Use these names in Datadog APM, dashboards, monitors, and service catalog entries.

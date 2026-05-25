export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (process.env.OTEL_SDK_DISABLED === "true" || process.env.OTEL_SDK_DISABLED === "1") {
    return;
  }

  const [
    api,
    resources,
    sdkTraceBase,
    sdkMetrics,
    sdkNode,
    otlpTraceExporter,
    otlpMetricExporter,
    autoInstrumentations,
  ] = await Promise.all([
    import("@opentelemetry/api"),
    import("@opentelemetry/resources"),
    import("@opentelemetry/sdk-trace-base"),
    import("@opentelemetry/sdk-metrics"),
    import("@opentelemetry/sdk-node"),
    import("@opentelemetry/exporter-trace-otlp-grpc"),
    import("@opentelemetry/exporter-metrics-otlp-grpc"),
    import("@opentelemetry/auto-instrumentations-node"),
  ]);

  const resource = new resources.Resource({
    "service.name": process.env.OTEL_SERVICE_NAME ?? process.env.DD_SERVICE ?? "raushni-frontend",
    "service.version": process.env.OTEL_SERVICE_VERSION ?? process.env.DD_VERSION ?? "1.0.0",
    "deployment.environment": process.env.ENVIRONMENT ?? process.env.DD_ENV ?? "development",
    team: "raushni",
    app: "raushni",
  });

  const sdk = new sdkNode.NodeSDK({
    resource,
    spanProcessor: new sdkTraceBase.BatchSpanProcessor(new otlpTraceExporter.OTLPTraceExporter()),
    metricReader: new sdkMetrics.PeriodicExportingMetricReader({
      exporter: new otlpMetricExporter.OTLPMetricExporter(),
    }),
    instrumentations: [
      autoInstrumentations.getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
      }),
    ],
  });

  await sdk.start();

  const shutdown = async () => {
    await sdk.shutdown();
  };

  api.diag.debug("OpenTelemetry configured for raushni-frontend");
  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);
}

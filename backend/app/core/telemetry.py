from __future__ import annotations

import logging
import os
from collections.abc import Mapping

from fastapi import FastAPI


logger = logging.getLogger(__name__)


def telemetry_enabled() -> bool:
    return os.getenv("OTEL_SDK_DISABLED", "false").lower() not in {"1", "true", "yes"}


def _resource_attributes() -> Mapping[str, str]:
    environment = os.getenv("ENVIRONMENT", os.getenv("DD_ENV", "development"))
    service_name = os.getenv("OTEL_SERVICE_NAME", os.getenv("DD_SERVICE", "raushni-backend"))
    service_version = os.getenv("OTEL_SERVICE_VERSION", os.getenv("DD_VERSION", "1.0.0"))

    return {
        "service.name": service_name,
        "service.version": service_version,
        "deployment.environment": environment,
        "team": "raushni",
        "app": "raushni",
    }


def configure_telemetry(app: FastAPI) -> None:
    """Configure OpenTelemetry for FastAPI without breaking local dev if deps are absent."""
    if not telemetry_enabled():
        logger.info("OpenTelemetry disabled by OTEL_SDK_DISABLED")
        return

    try:
        from opentelemetry import metrics, trace
        from opentelemetry.exporter.otlp.proto.grpc.metric_exporter import (
            OTLPMetricExporter,
        )
        from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.instrumentation.logging import LoggingInstrumentor
        from opentelemetry.instrumentation.redis import RedisInstrumentor
        from opentelemetry.sdk.metrics import MeterProvider
        from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
        from opentelemetry.sdk.resources import Resource
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
    except ImportError as exc:
        logger.warning("OpenTelemetry packages are not installed: %s", exc)
        return

    resource = Resource.create(_resource_attributes())

    trace_provider = TracerProvider(resource=resource)
    trace_provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter()))
    trace.set_tracer_provider(trace_provider)

    metric_reader = PeriodicExportingMetricReader(OTLPMetricExporter())
    metrics.set_meter_provider(MeterProvider(resource=resource, metric_readers=[metric_reader]))

    FastAPIInstrumentor.instrument_app(
        app,
        excluded_urls=os.getenv("OTEL_PYTHON_FASTAPI_EXCLUDED_URLS", "/health"),
    )
    LoggingInstrumentor().instrument(set_logging_format=True)
    # SQLAlchemy/Redis engines are attached after init_db/init_redis via instrument_data_clients.
    RedisInstrumentor().instrument()

    logger.info("OpenTelemetry configured for %s", _resource_attributes()["service.name"])


def instrument_data_clients(engine: object | None = None) -> None:
    """Attach SQLAlchemy instrumentation to the live async engine after init_db."""
    if not telemetry_enabled():
        return
    try:
        from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
        from sqlalchemy.ext.asyncio import AsyncEngine
    except ImportError as exc:
        logger.warning("OpenTelemetry SQLAlchemy instrumentor unavailable: %s", exc)
        return

    if engine is None:
        return

    try:
        sync_engine = engine.sync_engine if isinstance(engine, AsyncEngine) else engine
        SQLAlchemyInstrumentor().instrument(engine=sync_engine, enable_commenter=True)
        logger.info("SQLAlchemy OpenTelemetry instrumentation attached to live engine")
    except Exception as exc:  # noqa: BLE001 — telemetry must never break boot
        logger.warning("Failed to instrument SQLAlchemy engine: %s", exc)

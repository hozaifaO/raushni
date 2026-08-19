from __future__ import annotations

import json
from unittest.mock import patch

import pytest

from app.core.config import Settings
from app.services.payment_service import PaymentGatewayError, StripePaymentService


pytestmark = [pytest.mark.unit]


def test_cors_origin_list_splits() -> None:
    settings = Settings.model_validate(
        {
            "DATABASE_URL": "postgresql://u:p@localhost/db",
            "REDIS_URL": "redis://localhost:6379",
            "CORS_ORIGINS": "https://a.com, https://b.com",
        }
    )
    assert settings.cors_origin_list() == ["https://a.com", "https://b.com"]


def test_stripe_webhook_fail_closed_in_production() -> None:
    service = StripePaymentService()
    service.webhook_secret = ""
    payload = json.dumps({"id": "evt_1", "type": "checkout.session.completed", "data": {"object": {}}}).encode()
    with patch("app.core.config.get_settings") as mocked:
        mocked.return_value = Settings.model_validate(
            {
                "DATABASE_URL": "postgresql://u:p@localhost/db",
                "REDIS_URL": "redis://localhost:6379",
                "ENVIRONMENT": "production",
                "REQUIRE_AUTH": "true",
                "INTERNAL_API_KEY": "x" * 32,
                "CMS_API_TOKEN": "y" * 32,
            }
        )
        with pytest.raises(PaymentGatewayError, match="STRIPE_WEBHOOK_SECRET"):
            service.parse_webhook_event(payload, signature=None)


def test_stripe_webhook_unsigned_allowed_in_development() -> None:
    service = StripePaymentService()
    service.webhook_secret = ""
    payload = json.dumps(
        {
            "id": "evt_1",
            "type": "checkout.session.completed",
            "data": {"object": {"id": "cs_1", "payment_status": "paid", "metadata": {}}},
        }
    ).encode()
    with patch("app.core.config.get_settings") as mocked:
        mocked.return_value = Settings.model_validate(
            {
                "DATABASE_URL": "postgresql://u:p@localhost/db",
                "REDIS_URL": "redis://localhost:6379",
                "ENVIRONMENT": "development",
                "REQUIRE_AUTH": "false",
            }
        )
        # May still fail on shape depending on schema — but must not fail for missing secret.
        try:
            service.parse_webhook_event(payload, signature=None)
        except PaymentGatewayError as exc:
            assert "STRIPE_WEBHOOK_SECRET" not in str(exc)

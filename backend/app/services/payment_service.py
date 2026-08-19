from __future__ import annotations

import json
import os
from typing import Any, cast

import stripe

from app.schemas.donation import Donation, DonationCheckoutSession
from app.schemas.webhook import StripeWebhookEvent


class PaymentGatewayUnavailableError(RuntimeError):
    pass


class PaymentGatewayError(RuntimeError):
    pass


class StripePaymentService:
    def __init__(self) -> None:
        self.secret_key = os.getenv("STRIPE_SECRET_KEY", "").strip()
        self.publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY", "").strip() or None
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
        if "replace" in self.webhook_secret.lower():
            self.webhook_secret = ""
        self.app_public_url = (
            os.getenv("APP_PUBLIC_URL")
            or os.getenv("FRONTEND_PUBLIC_URL")
            or os.getenv("NEXT_PUBLIC_APP_URL")
            or "http://localhost:3000"
        ).rstrip("/")
        if self.secret_key:
            stripe.api_key = self.secret_key

    @property
    def enabled(self) -> bool:
        return bool(self.secret_key and not self.secret_key.startswith("replace-"))

    def create_checkout_session(self, donation: Donation) -> DonationCheckoutSession:
        if not self.enabled:
            raise PaymentGatewayUnavailableError("Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY.")

        try:
            session = stripe.checkout.Session.create(
                mode="payment",
                payment_method_types=["card"],
                line_items=[
                    {
                        "price_data": {
                            "currency": donation.currency.lower(),
                            "unit_amount": int(round(donation.amount * 100)),
                            "product_data": {
                                "name": "Raushni donation",
                                "description": f"{donation.purpose.value.replace('_', ' ').title()} donation receipt {donation.receipt_number}",
                            },
                        },
                        "quantity": 1,
                    }
                ],
                # Stripe stubs require str; omit when missing via empty-skip below.
                customer_email=donation.donor_email if donation.donor_email else "",
                metadata={
                    "donation_id": str(donation.id),
                    "receipt_number": donation.receipt_number,
                    "donor_name": donation.donor_name,
                    "organization_id": str(donation.organization_id),
                },
                success_url=f"{self.app_public_url}/donate?payment=success&receipt={donation.receipt_number}",
                cancel_url=f"{self.app_public_url}/donate?payment=cancelled&receipt={donation.receipt_number}",
            )
        except Exception as exc:  # Stripe raises several typed exceptions; preserve a clean API message.
            raise PaymentGatewayError(f"Unable to create Stripe checkout session: {exc}") from exc

        checkout_url = str(session.get("url") or "")
        session_id = str(session.get("id") or "")
        if not checkout_url or not session_id:
            raise PaymentGatewayError("Stripe did not return a checkout URL.")

        return DonationCheckoutSession(
            donation_id=donation.id,
            provider="stripe",
            checkout_url=checkout_url,
            session_id=session_id,
            publishable_key=self.publishable_key,
        )

    def parse_webhook_event(self, payload: bytes, signature: str | None) -> StripeWebhookEvent:
        raw: dict[str, Any]
        if self.webhook_secret:
            try:
                constructed = stripe.Webhook.construct_event(payload, signature or "", self.webhook_secret)
            except Exception as exc:
                raise PaymentGatewayError(f"Invalid Stripe webhook signature: {exc}") from exc
            if hasattr(constructed, "to_dict"):
                raw = cast(dict[str, Any], constructed.to_dict())
            else:
                raw = cast(dict[str, Any], dict(constructed))
        else:
            # Fail closed when auth/production is on — never accept unsigned Stripe payloads.
            from app.core.config import get_settings

            if get_settings().is_production_like:
                raise PaymentGatewayError(
                    "STRIPE_WEBHOOK_SECRET is required when ENVIRONMENT is production/staging "
                    "or REQUIRE_AUTH=true."
                )
            try:
                parsed = json.loads(payload.decode("utf-8"))
            except Exception as exc:
                raise PaymentGatewayError(f"Invalid Stripe webhook payload: {exc}") from exc
            if not isinstance(parsed, dict):
                raise PaymentGatewayError("Invalid Stripe webhook payload: expected object")
            raw = cast(dict[str, Any], parsed)
        try:
            return StripeWebhookEvent.from_stripe_payload(raw)
        except Exception as exc:
            raise PaymentGatewayError(f"Invalid Stripe webhook shape: {exc}") from exc

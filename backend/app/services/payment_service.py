from __future__ import annotations

import os
from typing import Any

import stripe

from app.schemas.donation import Donation, DonationCheckoutSession


class PaymentGatewayUnavailableError(RuntimeError):
    pass


class PaymentGatewayError(RuntimeError):
    pass


class StripePaymentService:
    def __init__(self) -> None:
        self.secret_key = os.getenv("STRIPE_SECRET_KEY", "").strip()
        self.publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY", "").strip() or None
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
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
                customer_email=donation.donor_email,
                metadata={
                    "donation_id": str(donation.id),
                    "receipt_number": donation.receipt_number,
                    "donor_name": donation.donor_name,
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

    def parse_webhook_event(self, payload: bytes, signature: str | None) -> dict[str, Any]:
        if self.webhook_secret:
            try:
                return stripe.Webhook.construct_event(payload, signature or "", self.webhook_secret)
            except Exception as exc:
                raise PaymentGatewayError(f"Invalid Stripe webhook signature: {exc}") from exc
        try:
            return stripe.Event.construct_from(stripe.util.json.loads(payload.decode("utf-8")), stripe.api_key)
        except Exception as exc:
            raise PaymentGatewayError(f"Invalid Stripe webhook payload: {exc}") from exc

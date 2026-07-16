from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class StripeCheckoutSessionObject(BaseModel):
    """Subset of Stripe checkout.session used by our webhook handler."""

    model_config = ConfigDict(extra="allow")

    id: str | None = None
    payment_intent: str | None = None
    # Present once checkout sessions set metadata.organization_id (Agent E+).
    # TODO(multi-tenant): webhook handler must require this when org scoping lands.
    metadata: dict[str, Any] | None = None


class StripeEventData(BaseModel):
    model_config = ConfigDict(extra="allow")

    object: StripeCheckoutSessionObject = Field(default_factory=StripeCheckoutSessionObject)


class StripeWebhookEvent(BaseModel):
    """Typed Stripe webhook envelope (extra fields ignored safely)."""

    model_config = ConfigDict(extra="allow")

    id: str | None = None
    type: str
    data: StripeEventData | None = None

    @classmethod
    def from_stripe_payload(cls, payload: dict[str, Any]) -> StripeWebhookEvent:
        return cls.model_validate(payload)

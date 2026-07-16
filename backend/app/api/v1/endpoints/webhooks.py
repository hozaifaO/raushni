from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.db import get_db
from app.repositories.donation_repository import DonationRepository
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.settings_repository import PlatformSettingsRepository
from app.services.donation_service import DonationNotFoundError, DonationService
from app.services.payment_service import PaymentGatewayError, StripePaymentService


router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    session: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    payment_service = StripePaymentService()
    try:
        event = payment_service.parse_webhook_event(payload, signature)
    except PaymentGatewayError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if event.type == "checkout.session.completed":
        checkout_session = event.data.object if event.data is not None else None
        session_id = (checkout_session.id if checkout_session else None) or ""
        payment_intent = checkout_session.payment_intent if checkout_session else None
        metadata = getattr(checkout_session, "metadata", None) or {}
        org_repo = OrganizationRepository(session)
        organization_id_raw = metadata.get("organization_id") if isinstance(metadata, dict) else None
        if not organization_id_raw:
            # Legacy sessions without org metadata: only default tenant (pre-multi-tenant).
            organization = await org_repo.get_by_slug(get_settings().default_tenant_slug)
            if organization is None:
                return {"status": "ignored", "reason": "default_organization_not_found"}
        else:
            try:
                claimed = uuid.UUID(str(organization_id_raw))
            except ValueError:
                return {"status": "ignored", "reason": "invalid_organization_id"}
            organization = await org_repo.get_by_id(claimed)
            if organization is None:
                return {"status": "ignored", "reason": "organization_not_found"}

        donation_service = DonationService(
            DonationRepository(session, organization_id=organization.id),
            PlatformSettingsRepository(session, organization_id=organization.id),
        )
        try:
            await donation_service.mark_paid_from_gateway(
                gateway_session_id=session_id,
                gateway_payment_intent=str(payment_intent) if payment_intent else None,
                transaction_reference=str(payment_intent or session_id),
            )
        except DonationNotFoundError:
            return {"status": "ignored", "reason": "donation_not_found"}

    return {"status": "received"}

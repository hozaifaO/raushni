from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request, status

from app.services.donation_service import DonationNotFoundError, DonationService
from app.services.payment_service import PaymentGatewayError, StripePaymentService


router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def get_donation_service(request: Request) -> DonationService:
    return request.app.state.donation_service


@router.post("/stripe")
async def stripe_webhook(request: Request) -> dict[str, str]:
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    payment_service = StripePaymentService()
    try:
        event = payment_service.parse_webhook_event(payload, signature)
    except PaymentGatewayError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    event_type = event.get("type")
    if event_type == "checkout.session.completed":
        session = event.get("data", {}).get("object", {})
        session_id = str(session.get("id") or "")
        payment_intent = session.get("payment_intent")
        try:
            get_donation_service(request).mark_paid_from_gateway(
                gateway_session_id=session_id,
                gateway_payment_intent=str(payment_intent) if payment_intent else None,
                transaction_reference=str(payment_intent or session_id),
            )
        except DonationNotFoundError:
            return {"status": "ignored", "reason": "donation_not_found"}

    return {"status": "received"}

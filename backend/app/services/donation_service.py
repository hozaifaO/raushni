from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.schemas.donation import (
    Donation,
    DonationCheckoutSession,
    DonationCreate,
    DonationListResponse,
    DonationPaymentStatus,
    DonationReceipt,
    DonationUpdate,
)
from app.services.cms_template_service import get_document_template
from app.services.payment_service import StripePaymentService


class DonationNotFoundError(LookupError):
    pass


class DonationReceiptUnavailableError(ValueError):
    pass


class DonationService:
    def __init__(self) -> None:
        self._donations: dict[UUID, Donation] = {}
        self._receipt_counter = 1000
        self._stripe = StripePaymentService()

    def list_donations(
        self,
        *,
        search: str | None = None,
        payment_status: DonationPaymentStatus | None = None,
    ) -> DonationListResponse:
        items = list(self._donations.values())

        if search:
            query = search.strip().lower()
            items = [
                donation
                for donation in items
                if query in donation.donor_name.lower()
                or query in donation.donor_phone.lower()
                or query in donation.receipt_number.lower()
                or (donation.donor_email is not None and query in donation.donor_email.lower())
                or (donation.transaction_reference is not None and query in donation.transaction_reference.lower())
            ]

        if payment_status is not None:
            items = [donation for donation in items if donation.payment_status == payment_status]

        items.sort(key=lambda donation: (donation.donation_date, donation.created_at), reverse=True)
        all_donations = list(self._donations.values())

        return DonationListResponse(
            items=items,
            total=len(all_donations),
            paid=sum(1 for donation in all_donations if donation.payment_status == DonationPaymentStatus.PAID),
            pending=sum(1 for donation in all_donations if donation.payment_status == DonationPaymentStatus.PENDING),
            failed=sum(1 for donation in all_donations if donation.payment_status == DonationPaymentStatus.FAILED),
            refunded=sum(1 for donation in all_donations if donation.payment_status == DonationPaymentStatus.REFUNDED),
            total_amount=sum(donation.amount for donation in all_donations if donation.payment_status == DonationPaymentStatus.PAID),
        )

    def create_donation(self, payload: DonationCreate) -> Donation:
        now = datetime.now(timezone.utc)
        donation = Donation(
            id=uuid4(),
            receipt_number=self._next_receipt_number(),
            receipt_issued=payload.payment_status == DonationPaymentStatus.PAID,
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self._donations[donation.id] = donation
        return donation

    def get_donation(self, donation_id: UUID) -> Donation:
        try:
            return self._donations[donation_id]
        except KeyError as exc:
            raise DonationNotFoundError(f"Donation {donation_id} was not found") from exc

    def update_donation(self, donation_id: UUID, payload: DonationUpdate) -> Donation:
        donation = self.get_donation(donation_id)
        updates = payload.model_dump(exclude_unset=True)

        if updates.get("payment_status") == DonationPaymentStatus.PAID:
            updates["receipt_issued"] = True

        updated = donation.model_copy(
            update={
                **updates,
                "updated_at": datetime.now(timezone.utc),
            },
        )
        self._donations[donation_id] = updated
        return updated

    def issue_receipt(self, donation_id: UUID) -> DonationReceipt:
        donation = self.get_donation(donation_id)
        if donation.payment_status != DonationPaymentStatus.PAID:
            raise DonationReceiptUnavailableError("Receipt can be issued only after payment status is paid")

        if not donation.receipt_issued:
            donation = donation.model_copy(
                update={
                    "receipt_issued": True,
                    "updated_at": datetime.now(timezone.utc),
                },
            )
            self._donations[donation_id] = donation

        template = get_document_template("donation-receipt")
        settings = template.get("settings", {})
        organization = settings.get("organization") if isinstance(settings, dict) else None

        return DonationReceipt(
            receipt_number=donation.receipt_number,
            issued_at=datetime.now(timezone.utc),
            organization=str(organization or "Raushni Educational & Social Welfare Trust"),
            registration_note=str(template.get("legalNote", "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted")),
            donation=donation,
        )

    def create_checkout_session(self, donation_id: UUID) -> DonationCheckoutSession:
        donation = self.get_donation(donation_id)
        session = self._stripe.create_checkout_session(donation)
        updated = donation.model_copy(
            update={
                "gateway_provider": session.provider,
                "gateway_session_id": session.session_id,
                "checkout_url": session.checkout_url,
                "updated_at": datetime.now(timezone.utc),
            },
        )
        self._donations[donation_id] = updated
        return session

    def mark_paid_from_gateway(
        self,
        *,
        gateway_session_id: str,
        gateway_payment_intent: str | None = None,
        transaction_reference: str | None = None,
    ) -> Donation:
        for donation_id, donation in self._donations.items():
            if donation.gateway_session_id == gateway_session_id:
                updated = donation.model_copy(
                    update={
                        "payment_status": DonationPaymentStatus.PAID,
                        "receipt_issued": True,
                        "gateway_payment_intent": gateway_payment_intent,
                        "transaction_reference": transaction_reference or gateway_payment_intent or gateway_session_id,
                        "updated_at": datetime.now(timezone.utc),
                    },
                )
                self._donations[donation_id] = updated
                return updated
        raise DonationNotFoundError(f"Donation with gateway session {gateway_session_id} was not found")

    def delete_donation(self, donation_id: UUID) -> None:
        self.get_donation(donation_id)
        del self._donations[donation_id]

    def _next_receipt_number(self) -> str:
        self._receipt_counter += 1
        return f"RSH-DON-{datetime.now(timezone.utc).year}-{self._receipt_counter}"

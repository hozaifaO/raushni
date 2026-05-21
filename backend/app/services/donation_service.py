from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.schemas.donation import (
    Donation,
    DonationCreate,
    DonationListResponse,
    DonationPaymentStatus,
    DonationReceipt,
    DonationUpdate,
)


class DonationNotFoundError(LookupError):
    pass


class DonationReceiptUnavailableError(ValueError):
    pass


class DonationService:
    def __init__(self) -> None:
        self._donations: dict[UUID, Donation] = {}
        self._receipt_counter = 1000

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

        return DonationReceipt(
            receipt_number=donation.receipt_number,
            issued_at=datetime.now(timezone.utc),
            organization="Raushni Educational & Social Welfare Trust",
            registration_note="Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
            donation=donation,
        )

    def delete_donation(self, donation_id: UUID) -> None:
        self.get_donation(donation_id)
        del self._donations[donation_id]

    def _next_receipt_number(self) -> str:
        self._receipt_counter += 1
        return f"RSH-DON-{datetime.now(timezone.utc).year}-{self._receipt_counter}"

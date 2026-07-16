from __future__ import annotations

from datetime import date, datetime, timezone
from decimal import Decimal
from typing import Any
from uuid import UUID

from app.models.donation import DonationModel
from app.repositories.donation_repository import DonationRepository
from app.repositories.settings_repository import PlatformSettingsRepository
from app.schemas.donation import (
    ANONYMOUS_DISPLAY_NAME,
    RECEIPT_FROZEN_FIELDS,
    UTR_REQUIRED_METHODS,
    Donation,
    DonationCheckoutSession,
    DonationCreate,
    DonationListResponse,
    DonationMarkPaid,
    DonationPaymentMethod,
    DonationPaymentStatus,
    DonationReceipt,
    DonationStatusEvent,
    DonationUpdate,
)
from app.services.cms_template_service import get_document_template
from app.services.payment_service import StripePaymentService


class DonationNotFoundError(LookupError):
    pass


class DonationReceiptUnavailableError(ValueError):
    pass


class DonationReceiptFrozenError(ValueError):
    pass


class DonationMarkPaidError(ValueError):
    pass


def _method_requires_utr(method: str | DonationPaymentMethod) -> bool:
    value = method.value if isinstance(method, DonationPaymentMethod) else method
    return value in {item.value for item in UTR_REQUIRED_METHODS}


def _normalize_reference(value: str | None) -> str | None:
    if value is None:
        return None
    trimmed = value.strip()
    return trimmed or None


def _build_receipt_snapshot(donation: DonationModel) -> dict[str, Any]:
    amount = donation.amount
    return {
        "donor_name": donation.donor_name,
        "donor_email": donation.donor_email,
        "donor_phone": donation.donor_phone,
        "donor_address": donation.donor_address,
        "donor_pan": donation.donor_pan,
        "donor_type": donation.donor_type,
        "is_anonymous": donation.is_anonymous,
        "amount": float(amount) if isinstance(amount, Decimal) else float(amount),
        "currency": donation.currency,
        "purpose": donation.purpose,
        "payment_method": donation.payment_method,
        "transaction_reference": donation.transaction_reference,
        "donation_date": donation.donation_date.isoformat()
        if isinstance(donation.donation_date, date)
        else str(donation.donation_date),
        "receipt_number": donation.receipt_number,
        "payment_status": donation.payment_status,
    }


def _donation_from_snapshot(donation: DonationModel, snapshot: dict[str, Any]) -> Donation:
    """Merge frozen snapshot fields onto the live donation for receipt display."""
    base = Donation.model_validate(donation).model_dump()
    for key in (
        "donor_name",
        "donor_email",
        "donor_phone",
        "donor_address",
        "donor_pan",
        "donor_type",
        "is_anonymous",
        "amount",
        "currency",
        "purpose",
        "payment_method",
        "transaction_reference",
        "donation_date",
    ):
        if key in snapshot and snapshot[key] is not None:
            base[key] = snapshot[key]
    return _receipt_display_donation(Donation.model_validate(base))


def _receipt_display_donation(donation: Donation) -> Donation:
    """Receipts show Anonymous when flagged; staff list APIs keep the real name."""
    if donation.is_anonymous:
        return donation.model_copy(update={"donor_name": ANONYMOUS_DISPLAY_NAME})
    return donation


class DonationService:
    def __init__(
        self,
        repository: DonationRepository,
        settings_repository: PlatformSettingsRepository | None = None,
    ) -> None:
        self._repository = repository
        self._settings_repository = settings_repository
        self._stripe = StripePaymentService()

    async def list_donations(
        self,
        *,
        search: str | None = None,
        payment_status: DonationPaymentStatus | None = None,
    ) -> DonationListResponse:
        (
            items,
            total,
            paid,
            pending,
            failed,
            refunded,
            total_amount,
        ) = await self._repository.list(search=search, payment_status=payment_status)
        return DonationListResponse(
            items=[Donation.model_validate(item) for item in items],
            total=total,
            paid=paid,
            pending=pending,
            failed=failed,
            refunded=refunded,
            total_amount=total_amount,
        )

    async def create_donation(
        self,
        payload: DonationCreate,
        *,
        actor_role: str | None = None,
        actor_email: str | None = None,
    ) -> Donation:
        if payload.payment_status == DonationPaymentStatus.PAID:
            self._assert_utr_for_paid(payload.payment_method, payload.transaction_reference)

        receipt_number = await self._repository.allocate_receipt_number()
        donation = await self._repository.create(payload, receipt_number=receipt_number)
        await self._repository.append_status_event(
            donation_id=donation.id,
            from_status=None,
            to_status=donation.payment_status,
            transaction_reference=donation.transaction_reference,
            actor_role=actor_role,
            actor_email=actor_email,
            note="created",
        )
        return Donation.model_validate(donation)

    async def get_donation(self, donation_id: UUID) -> Donation:
        donation = await self._repository.get(donation_id)
        if donation is None:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")
        return Donation.model_validate(donation)

    async def list_status_events(self, donation_id: UUID) -> list[DonationStatusEvent]:
        donation = await self._repository.get(donation_id)
        if donation is None:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")
        events = await self._repository.list_status_events(donation_id)
        return [DonationStatusEvent.model_validate(event) for event in events]

    async def update_donation(
        self,
        donation_id: UUID,
        payload: DonationUpdate,
        *,
        actor_role: str | None = None,
        actor_email: str | None = None,
    ) -> Donation:
        donation = await self._repository.get(donation_id)
        if donation is None:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")

        updates = payload.model_dump(exclude_unset=True)
        if donation.receipt_issued:
            frozen_touched = sorted(field for field in updates if field in RECEIPT_FROZEN_FIELDS)
            if frozen_touched:
                raise DonationReceiptFrozenError(
                    "Receipt already issued; cannot modify frozen fields: "
                    + ", ".join(frozen_touched)
                )

        next_status = updates.get("payment_status")
        next_status_value = (
            next_status.value if isinstance(next_status, DonationPaymentStatus) else next_status
        )
        next_method = updates.get("payment_method", donation.payment_method)
        next_method_value = (
            next_method.value if isinstance(next_method, DonationPaymentMethod) else next_method
        )
        next_reference = updates.get(
            "transaction_reference",
            donation.transaction_reference,
        )
        if next_status_value == DonationPaymentStatus.PAID.value:
            self._assert_utr_for_paid(next_method_value, next_reference)

        previous_status = donation.payment_status
        updated = await self._repository.update(donation_id, payload)
        if updated is None:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")

        if next_status_value is not None and next_status_value != previous_status:
            await self._repository.append_status_event(
                donation_id=updated.id,
                from_status=previous_status,
                to_status=updated.payment_status,
                transaction_reference=updated.transaction_reference,
                actor_role=actor_role,
                actor_email=actor_email,
                note="status_update",
            )
        return Donation.model_validate(updated)

    async def mark_paid(
        self,
        donation_id: UUID,
        payload: DonationMarkPaid,
        *,
        actor_role: str | None = None,
        actor_email: str | None = None,
    ) -> Donation:
        donation = await self._repository.get(donation_id)
        if donation is None:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")

        reference = _normalize_reference(payload.transaction_reference) or _normalize_reference(
            donation.transaction_reference
        )
        self._assert_utr_for_paid(donation.payment_method, reference)

        if donation.payment_status == DonationPaymentStatus.PAID.value:
            if reference and reference != donation.transaction_reference:
                if donation.receipt_issued:
                    raise DonationReceiptFrozenError(
                        "Receipt already issued; cannot modify transaction_reference"
                    )
                donation.transaction_reference = reference
                donation = await self._repository.save(donation)
            return Donation.model_validate(donation)

        previous_status = donation.payment_status
        donation.payment_status = DonationPaymentStatus.PAID.value
        if reference:
            donation.transaction_reference = reference
        donation = await self._repository.save(donation)
        await self._repository.append_status_event(
            donation_id=donation.id,
            from_status=previous_status,
            to_status=donation.payment_status,
            transaction_reference=donation.transaction_reference,
            actor_role=actor_role,
            actor_email=actor_email,
            note="mark_paid",
        )
        return Donation.model_validate(donation)

    async def issue_receipt(self, donation_id: UUID) -> DonationReceipt:
        donation_model = await self._repository.get(donation_id)
        if donation_model is None:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")
        if donation_model.payment_status != DonationPaymentStatus.PAID.value:
            raise DonationReceiptUnavailableError(
                "Receipt can be issued only after payment status is paid"
            )

        template = get_document_template("donation-receipt")
        settings = template.get("settings", {})
        organization = settings.get("organization") if isinstance(settings, dict) else None
        organization_name = str(organization or "Raushni Educational & Social Welfare Trust")
        if self._settings_repository is not None:
            platform = await self._settings_repository.get_or_create()
            if platform.organization_name:
                organization_name = platform.organization_name
        registration_note = str(
            template.get(
                "legalNote",
                "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
            )
        )

        if donation_model.receipt_issued and donation_model.receipt_snapshot:
            issued_at = donation_model.receipt_issued_at or datetime.now(timezone.utc)
            donation = _donation_from_snapshot(donation_model, donation_model.receipt_snapshot)
            return DonationReceipt(
                receipt_number=donation.receipt_number,
                issued_at=issued_at,
                organization=organization_name,
                registration_note=registration_note,
                donation=donation,
            )

        issued_at = datetime.now(timezone.utc)
        snapshot = _build_receipt_snapshot(donation_model)
        donation_model = await self._repository.set_receipt_issued(
            donation_model,
            issued_at=issued_at,
            snapshot=snapshot,
        )
        donation = _receipt_display_donation(Donation.model_validate(donation_model))
        return DonationReceipt(
            receipt_number=donation.receipt_number,
            issued_at=issued_at,
            organization=organization_name,
            registration_note=registration_note,
            donation=donation,
        )

    async def create_checkout_session(self, donation_id: UUID) -> DonationCheckoutSession:
        donation_model = await self._repository.get(donation_id)
        if donation_model is None:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")
        donation = Donation.model_validate(donation_model)
        session = self._stripe.create_checkout_session(donation)
        donation_model.gateway_provider = session.provider
        donation_model.gateway_session_id = session.session_id
        donation_model.checkout_url = session.checkout_url
        await self._repository.save(donation_model)
        return session

    async def mark_paid_from_gateway(
        self,
        *,
        gateway_session_id: str,
        gateway_payment_intent: str | None = None,
        transaction_reference: str | None = None,
    ) -> Donation:
        donation = await self._repository.get_by_gateway_session_id(gateway_session_id)
        if donation is None:
            raise DonationNotFoundError(
                f"Donation with gateway session {gateway_session_id} was not found"
            )
        previous_status = donation.payment_status
        donation.payment_status = DonationPaymentStatus.PAID.value
        donation.gateway_payment_intent = gateway_payment_intent
        donation.transaction_reference = (
            transaction_reference or gateway_payment_intent or gateway_session_id
        )
        donation = await self._repository.save(donation)
        if previous_status != donation.payment_status:
            await self._repository.append_status_event(
                donation_id=donation.id,
                from_status=previous_status,
                to_status=donation.payment_status,
                transaction_reference=donation.transaction_reference,
                actor_role="webhook",
                actor_email=None,
                note="stripe_checkout_completed",
            )
        return Donation.model_validate(donation)

    async def delete_donation(self, donation_id: UUID) -> None:
        deleted = await self._repository.delete(donation_id)
        if not deleted:
            raise DonationNotFoundError(f"Donation {donation_id} was not found")

    @staticmethod
    def _assert_utr_for_paid(
        payment_method: str | DonationPaymentMethod,
        transaction_reference: str | None,
    ) -> None:
        if not _method_requires_utr(payment_method):
            return
        if not _normalize_reference(transaction_reference):
            raise DonationMarkPaidError(
                "transaction_reference (UTR) is required to mark "
                f"{payment_method if isinstance(payment_method, str) else payment_method.value} "
                "donations as paid"
            )

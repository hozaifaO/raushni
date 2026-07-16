from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.donation import DonationModel, DonationStatusEventModel, ReceiptCounterModel
from app.schemas.donation import DonationCreate, DonationPaymentStatus, DonationUpdate


class DonationRepository:
    def __init__(self, session: AsyncSession, *, organization_id: uuid.UUID) -> None:
        self._session = session
        self._organization_id = organization_id

    async def allocate_receipt_number(self, year: int | None = None) -> str:
        target_year = year or datetime.now(timezone.utc).year
        result = await self._session.execute(
            select(ReceiptCounterModel)
            .where(
                ReceiptCounterModel.organization_id == self._organization_id,
                ReceiptCounterModel.year == target_year,
            )
            .with_for_update()
        )
        counter = result.scalar_one_or_none()
        if counter is None:
            counter = ReceiptCounterModel(
                organization_id=self._organization_id,
                year=target_year,
                last_value=1000,
            )
            self._session.add(counter)
            await self._session.flush()
        counter.last_value += 1
        await self._session.flush()
        return f"RSH-DON-{target_year}-{counter.last_value}"

    async def list(
        self,
        *,
        search: str | None = None,
        payment_status: DonationPaymentStatus | None = None,
    ) -> tuple[list[DonationModel], int, int, int, int, int, float]:
        stmt: Select[tuple[DonationModel]] = select(DonationModel).where(
            DonationModel.organization_id == self._organization_id
        )
        if search:
            query = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(DonationModel.donor_name).like(query),
                    func.lower(DonationModel.donor_phone).like(query),
                    func.lower(DonationModel.receipt_number).like(query),
                    func.lower(func.coalesce(DonationModel.donor_email, "")).like(query),
                    func.lower(func.coalesce(DonationModel.transaction_reference, "")).like(query),
                )
            )
        if payment_status is not None:
            stmt = stmt.where(DonationModel.payment_status == payment_status.value)

        stmt = stmt.order_by(DonationModel.donation_date.desc(), DonationModel.created_at.desc())
        result = await self._session.execute(stmt)
        items = list(result.scalars().all())

        counts_result = await self._session.execute(
            select(DonationModel.payment_status, func.count())
            .where(DonationModel.organization_id == self._organization_id)
            .group_by(DonationModel.payment_status)
        )
        counts = {row[0]: int(row[1]) for row in counts_result.all()}
        paid_amount_result = await self._session.execute(
            select(func.coalesce(func.sum(DonationModel.amount), 0)).where(
                DonationModel.organization_id == self._organization_id,
                DonationModel.payment_status == DonationPaymentStatus.PAID.value,
            )
        )
        total_amount = float(paid_amount_result.scalar_one())
        total = sum(counts.values())
        return (
            items,
            total,
            counts.get(DonationPaymentStatus.PAID.value, 0),
            counts.get(DonationPaymentStatus.PENDING.value, 0),
            counts.get(DonationPaymentStatus.FAILED.value, 0),
            counts.get(DonationPaymentStatus.REFUNDED.value, 0),
            total_amount,
        )

    async def get(self, donation_id: uuid.UUID) -> DonationModel | None:
        result = await self._session.execute(
            select(DonationModel).where(
                DonationModel.id == donation_id,
                DonationModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_gateway_session_id(self, gateway_session_id: str) -> DonationModel | None:
        result = await self._session.execute(
            select(DonationModel).where(
                DonationModel.gateway_session_id == gateway_session_id,
                DonationModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, payload: DonationCreate, receipt_number: str) -> DonationModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["purpose"] = payload.purpose.value
        data["payment_method"] = payload.payment_method.value
        data["payment_status"] = payload.payment_status.value
        data["donor_type"] = payload.donor_type.value
        data["amount"] = Decimal(str(payload.amount))
        # Column is NOT NULL; anonymous donations may omit phone.
        data["donor_phone"] = payload.donor_phone or ""
        donation = DonationModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            receipt_number=receipt_number,
            receipt_issued=False,
            receipt_issued_at=None,
            receipt_snapshot=None,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(donation)
        await self._session.flush()
        await self._session.refresh(donation)
        return donation

    async def update(self, donation_id: uuid.UUID, payload: DonationUpdate) -> DonationModel | None:
        donation = await self.get(donation_id)
        if donation is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in list(updates.items()):
            if value is not None and hasattr(value, "value"):
                updates[key] = value.value
            if key == "amount" and updates[key] is not None:
                updates[key] = Decimal(str(updates[key]))
        for key, value in updates.items():
            setattr(donation, key, value)
        donation.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(donation)
        return donation

    async def save(self, donation: DonationModel) -> DonationModel:
        donation.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(donation)
        return donation

    async def delete(self, donation_id: uuid.UUID) -> bool:
        donation = await self.get(donation_id)
        if donation is None:
            return False
        await self._session.delete(donation)
        await self._session.flush()
        return True

    async def append_status_event(
        self,
        *,
        donation_id: uuid.UUID,
        from_status: str | None,
        to_status: str,
        transaction_reference: str | None = None,
        actor_role: str | None = None,
        actor_email: str | None = None,
        note: str | None = None,
    ) -> DonationStatusEventModel:
        event = DonationStatusEventModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            donation_id=donation_id,
            from_status=from_status,
            to_status=to_status,
            transaction_reference=transaction_reference,
            actor_role=actor_role,
            actor_email=actor_email,
            note=note,
            created_at=datetime.now(timezone.utc),
        )
        self._session.add(event)
        await self._session.flush()
        await self._session.refresh(event)
        return event

    async def list_status_events(self, donation_id: uuid.UUID) -> list[DonationStatusEventModel]:
        result = await self._session.execute(
            select(DonationStatusEventModel)
            .where(
                DonationStatusEventModel.donation_id == donation_id,
                DonationStatusEventModel.organization_id == self._organization_id,
            )
            .order_by(DonationStatusEventModel.created_at.asc())
        )
        return list(result.scalars().all())

    async def set_receipt_issued(
        self,
        donation: DonationModel,
        *,
        issued_at: datetime,
        snapshot: dict[str, Any],
    ) -> DonationModel:
        donation.receipt_issued = True
        donation.receipt_issued_at = issued_at
        donation.receipt_snapshot = snapshot
        return await self.save(donation)

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.simple_record import SimpleRecordModel
from app.schemas.simple_record import (
    SimpleRecordCreate,
    SimpleRecordStatus,
    SimpleRecordUpdate,
)


class SimpleRecordRepository:
    def __init__(
        self, session: AsyncSession, *, module: str, organization_id: uuid.UUID
    ) -> None:
        self._session = session
        self.module = module
        self._organization_id = organization_id

    async def list(
        self,
        *,
        search: str | None = None,
        status_filter: SimpleRecordStatus | None = None,
    ) -> tuple[list[SimpleRecordModel], int, int, int, int]:
        stmt: Select[tuple[SimpleRecordModel]] = select(SimpleRecordModel).where(
            SimpleRecordModel.module == self.module,
            SimpleRecordModel.organization_id == self._organization_id,
        )
        if search:
            query = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(SimpleRecordModel.title).like(query),
                    func.lower(SimpleRecordModel.category).like(query),
                    func.lower(SimpleRecordModel.summary).like(query),
                    func.lower(func.coalesce(SimpleRecordModel.contact_name, "")).like(
                        query
                    ),
                )
            )
        if status_filter is not None:
            stmt = stmt.where(SimpleRecordModel.status == status_filter.value)

        stmt = stmt.order_by(
            SimpleRecordModel.record_date.desc(),
            func.lower(SimpleRecordModel.title).desc(),
        )
        result = await self._session.execute(stmt)
        items = list(result.scalars().all())

        counts_result = await self._session.execute(
            select(SimpleRecordModel.status, func.count())
            .where(
                SimpleRecordModel.module == self.module,
                SimpleRecordModel.organization_id == self._organization_id,
            )
            .group_by(SimpleRecordModel.status)
        )
        counts = {row[0]: int(row[1]) for row in counts_result.all()}
        total = sum(counts.values())
        return (
            items,
            total,
            counts.get(SimpleRecordStatus.ACTIVE.value, 0),
            counts.get(SimpleRecordStatus.PUBLISHED.value, 0),
            counts.get(SimpleRecordStatus.ARCHIVED.value, 0),
        )

    async def get(self, record_id: uuid.UUID) -> SimpleRecordModel | None:
        result = await self._session.execute(
            select(SimpleRecordModel).where(
                SimpleRecordModel.id == record_id,
                SimpleRecordModel.module == self.module,
                SimpleRecordModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, payload: SimpleRecordCreate) -> SimpleRecordModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["status"] = payload.status.value
        if data.get("amount") is not None:
            data["amount"] = Decimal(str(data["amount"]))
        record = SimpleRecordModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            module=self.module,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(record)
        await self._session.flush()
        await self._session.refresh(record)
        return record

    async def update(
        self, record_id: uuid.UUID, payload: SimpleRecordUpdate
    ) -> SimpleRecordModel | None:
        record = await self.get(record_id)
        if record is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        if "status" in updates and updates["status"] is not None:
            status = updates["status"]
            updates["status"] = (
                status.value if hasattr(status, "value") else str(status)
            )
        if "amount" in updates and updates["amount"] is not None:
            updates["amount"] = Decimal(str(updates["amount"]))
        for key, value in updates.items():
            setattr(record, key, value)
        record.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(record)
        return record

    async def delete(self, record_id: uuid.UUID) -> bool:
        record = await self.get(record_id)
        if record is None:
            return False
        await self._session.delete(record)
        await self._session.flush()
        return True

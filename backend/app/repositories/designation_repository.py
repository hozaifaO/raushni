from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.designation import DesignationModel
from app.schemas.designation import (
    DesignationCreate,
    DesignationStatus,
    DesignationUpdate,
)


class DesignationRepository:
    def __init__(self, session: AsyncSession, *, organization_id: uuid.UUID) -> None:
        self._session = session
        self._organization_id = organization_id

    async def list(
        self,
        *,
        search: str | None = None,
        status_filter: DesignationStatus | None = None,
        department: str | None = None,
    ) -> tuple[list[DesignationModel], int, int, int, int, int, int]:
        stmt: Select[tuple[DesignationModel]] = select(DesignationModel).where(
            DesignationModel.organization_id == self._organization_id
        )
        if search:
            query = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(DesignationModel.title).like(query),
                    func.lower(DesignationModel.code).like(query),
                    func.lower(DesignationModel.department).like(query),
                    func.lower(DesignationModel.assignment_scope).like(query),
                )
            )
        if status_filter is not None:
            stmt = stmt.where(DesignationModel.status == status_filter.value)
        if department:
            stmt = stmt.where(
                func.lower(DesignationModel.department) == department.strip().lower()
            )

        stmt = stmt.order_by(
            DesignationModel.sort_order.asc(), func.lower(DesignationModel.title).asc()
        )
        result = await self._session.execute(stmt)
        items = list(result.scalars().all())

        counts_result = await self._session.execute(
            select(DesignationModel.status, func.count())
            .where(DesignationModel.organization_id == self._organization_id)
            .group_by(DesignationModel.status)
        )
        counts = {row[0]: int(row[1]) for row in counts_result.all()}
        totals_result = await self._session.execute(
            select(func.coalesce(func.sum(DesignationModel.staff_assigned), 0)).where(
                DesignationModel.organization_id == self._organization_id
            )
        )
        assigned_staff = totals_result.scalar_one()
        open_slots_result = await self._session.execute(
            select(
                func.coalesce(
                    func.sum(
                        func.greatest(
                            DesignationModel.volunteer_slots
                            - DesignationModel.staff_assigned,
                            0,
                        )
                    ),
                    0,
                )
            ).where(DesignationModel.organization_id == self._organization_id)
        )
        open_slots = int(open_slots_result.scalar_one())
        total = sum(counts.values())
        return (
            items,
            total,
            counts.get(DesignationStatus.ACTIVE.value, 0),
            counts.get(DesignationStatus.INACTIVE.value, 0),
            counts.get(DesignationStatus.ARCHIVED.value, 0),
            int(assigned_staff),
            open_slots,
        )

    async def get(self, designation_id: uuid.UUID) -> DesignationModel | None:
        result = await self._session.execute(
            select(DesignationModel).where(
                DesignationModel.id == designation_id,
                DesignationModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_by_code(
        self, code: str, *, ignore_id: uuid.UUID | None = None
    ) -> DesignationModel | None:
        stmt = select(DesignationModel).where(
            DesignationModel.organization_id == self._organization_id,
            func.lower(DesignationModel.code) == code.strip().lower(),
        )
        if ignore_id is not None:
            stmt = stmt.where(DesignationModel.id != ignore_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, payload: DesignationCreate) -> DesignationModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["level"] = payload.level.value
        data["status"] = payload.status.value
        designation = DesignationModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(designation)
        await self._session.flush()
        await self._session.refresh(designation)
        return designation

    async def update(
        self, designation_id: uuid.UUID, payload: DesignationUpdate
    ) -> DesignationModel | None:
        designation = await self.get(designation_id)
        if designation is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in list(updates.items()):
            if value is not None and hasattr(value, "value"):
                updates[key] = value.value
        for key, value in updates.items():
            setattr(designation, key, value)
        designation.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(designation)
        return designation

    async def delete(self, designation_id: uuid.UUID) -> bool:
        designation = await self.get(designation_id)
        if designation is None:
            return False
        await self._session.delete(designation)
        await self._session.flush()
        return True

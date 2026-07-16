from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.member import MemberModel
from app.schemas.member import MemberCreate, MemberStatus, MemberUpdate


class MemberRepository:
    def __init__(self, session: AsyncSession, *, organization_id: uuid.UUID) -> None:
        self._session = session
        self._organization_id = organization_id

    def _scoped(self, stmt: Select[tuple[MemberModel]]) -> Select[tuple[MemberModel]]:
        return stmt.where(MemberModel.organization_id == self._organization_id)

    async def list(
        self,
        *,
        search: str | None = None,
        status: MemberStatus | None = None,
    ) -> tuple[list[MemberModel], int, int, int, int]:
        stmt: Select[tuple[MemberModel]] = self._scoped(select(MemberModel))
        if search:
            query = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(MemberModel.full_name).like(query),
                    func.lower(MemberModel.phone).like(query),
                    func.lower(func.coalesce(MemberModel.email, "")).like(query),
                    func.lower(MemberModel.role).like(query),
                )
            )
        if status is not None:
            stmt = stmt.where(MemberModel.status == status.value)

        stmt = stmt.order_by(MemberModel.joined_on.desc(), func.lower(MemberModel.full_name).desc())
        result = await self._session.execute(stmt)
        items = list(result.scalars().all())

        counts_result = await self._session.execute(
            select(MemberModel.status, func.count())
            .where(MemberModel.organization_id == self._organization_id)
            .group_by(MemberModel.status)
        )
        counts = {row[0]: int(row[1]) for row in counts_result.all()}
        total = sum(counts.values())
        return (
            items,
            total,
            counts.get(MemberStatus.ACTIVE.value, 0),
            counts.get(MemberStatus.INACTIVE.value, 0),
            counts.get(MemberStatus.PENDING.value, 0),
        )

    async def get(self, member_id: uuid.UUID) -> MemberModel | None:
        result = await self._session.execute(
            select(MemberModel).where(
                MemberModel.id == member_id,
                MemberModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, payload: MemberCreate) -> MemberModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["status"] = payload.status.value
        member = MemberModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(member)
        await self._session.flush()
        await self._session.refresh(member)
        return member

    async def update(self, member_id: uuid.UUID, payload: MemberUpdate) -> MemberModel | None:
        member = await self.get(member_id)
        if member is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        if "status" in updates and updates["status"] is not None:
            status = updates["status"]
            updates["status"] = status.value if hasattr(status, "value") else str(status)
        for key, value in updates.items():
            setattr(member, key, value)
        member.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(member)
        return member

    async def delete(self, member_id: uuid.UUID) -> bool:
        member = await self.get(member_id)
        if member is None:
            return False
        await self._session.delete(member)
        await self._session.flush()
        return True

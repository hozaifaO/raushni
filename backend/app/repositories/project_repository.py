from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.project import ProjectModel
from app.schemas.project import ProjectCreate, ProjectStatus, ProjectUpdate


class ProjectRepository:
    def __init__(self, session: AsyncSession, *, organization_id: uuid.UUID) -> None:
        self._session = session
        self._organization_id = organization_id

    async def list(
        self,
        *,
        search: str | None = None,
        status_filter: ProjectStatus | None = None,
    ) -> tuple[list[ProjectModel], int, int, int, int, float, int]:
        stmt: Select[tuple[ProjectModel]] = select(ProjectModel).where(
            ProjectModel.organization_id == self._organization_id
        )
        if search:
            query = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(ProjectModel.title).like(query),
                    func.lower(ProjectModel.summary).like(query),
                    func.lower(ProjectModel.location).like(query),
                    func.lower(ProjectModel.focus_area).like(query),
                )
            )
        if status_filter is not None:
            stmt = stmt.where(ProjectModel.status == status_filter.value)

        stmt = stmt.order_by(
            ProjectModel.start_date.desc(), ProjectModel.created_at.desc()
        )
        result = await self._session.execute(stmt)
        items = list(result.scalars().all())

        counts_result = await self._session.execute(
            select(ProjectModel.status, func.count())
            .where(ProjectModel.organization_id == self._organization_id)
            .group_by(ProjectModel.status)
        )
        counts = {row[0]: int(row[1]) for row in counts_result.all()}
        aggregates = await self._session.execute(
            select(
                func.coalesce(func.sum(ProjectModel.budget), 0),
                func.coalesce(func.sum(ProjectModel.beneficiaries), 0),
            ).where(ProjectModel.organization_id == self._organization_id)
        )
        total_budget, total_beneficiaries = aggregates.one()
        total = sum(counts.values())
        return (
            items,
            total,
            counts.get(ProjectStatus.PROPOSED.value, 0),
            counts.get(ProjectStatus.ACTIVE.value, 0),
            counts.get(ProjectStatus.COMPLETED.value, 0),
            float(total_budget),
            int(total_beneficiaries),
        )

    async def get(self, project_id: uuid.UUID) -> ProjectModel | None:
        result = await self._session.execute(
            select(ProjectModel).where(
                ProjectModel.id == project_id,
                ProjectModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, payload: ProjectCreate) -> ProjectModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["status"] = payload.status.value
        data["priority"] = payload.priority.value
        data["budget"] = Decimal(str(payload.budget))
        data["currency"] = payload.currency.upper()
        project = ProjectModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(project)
        await self._session.flush()
        await self._session.refresh(project)
        return project

    async def update(
        self, project_id: uuid.UUID, payload: ProjectUpdate
    ) -> ProjectModel | None:
        project = await self.get(project_id)
        if project is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in list(updates.items()):
            if value is not None and hasattr(value, "value"):
                updates[key] = value.value
            if key == "budget" and updates[key] is not None:
                updates[key] = Decimal(str(updates[key]))
            if key == "currency" and updates[key] is not None:
                updates[key] = str(updates[key]).upper()
        for key, value in updates.items():
            setattr(project, key, value)
        project.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(project)
        return project

    async def delete(self, project_id: uuid.UUID) -> bool:
        project = await self.get(project_id)
        if project is None:
            return False
        await self._session.delete(project)
        await self._session.flush()
        return True

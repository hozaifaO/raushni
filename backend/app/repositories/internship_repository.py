from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.internship import (
    InternshipAnnouncementModel,
    InternshipApplicationModel,
    InternshipCertificateModel,
    InternshipCounterModel,
)
from app.schemas.internship import (
    InternshipAnnouncementCreate,
    InternshipAnnouncementUpdate,
    InternshipApplicationCreate,
    InternshipApplicationStatus,
    InternshipApplicationUpdate,
)


class InternshipRepository:
    def __init__(self, session: AsyncSession, *, organization_id: uuid.UUID) -> None:
        self._session = session
        self._organization_id = organization_id

    async def allocate_counter(self, kind: str, *, start_value: int) -> str:
        year = datetime.now(timezone.utc).year
        result = await self._session.execute(
            select(InternshipCounterModel)
            .where(
                InternshipCounterModel.organization_id == self._organization_id,
                InternshipCounterModel.kind == kind,
                InternshipCounterModel.year == year,
            )
            .with_for_update()
        )
        counter = result.scalar_one_or_none()
        if counter is None:
            counter = InternshipCounterModel(
                organization_id=self._organization_id,
                kind=kind,
                year=year,
                last_value=start_value,
            )
            self._session.add(counter)
            await self._session.flush()
        counter.last_value += 1
        await self._session.flush()
        prefix = "RSH-INT" if kind == "registration" else "RSH-CERT"
        return f"{prefix}-{year}-{counter.last_value}"

    async def list_announcements(
        self, *, published_only: bool = False
    ) -> list[InternshipAnnouncementModel]:
        stmt: Select[tuple[InternshipAnnouncementModel]] = select(
            InternshipAnnouncementModel
        ).where(InternshipAnnouncementModel.organization_id == self._organization_id)
        if published_only:
            stmt = stmt.where(InternshipAnnouncementModel.status == "published")
        stmt = stmt.order_by(InternshipAnnouncementModel.event_date.desc())
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def get_announcement(
        self, announcement_id: uuid.UUID
    ) -> InternshipAnnouncementModel | None:
        result = await self._session.execute(
            select(InternshipAnnouncementModel).where(
                InternshipAnnouncementModel.id == announcement_id,
                InternshipAnnouncementModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_announcement(
        self, payload: InternshipAnnouncementCreate
    ) -> InternshipAnnouncementModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["mode"] = payload.mode.value
        data["status"] = payload.status.value
        row = InternshipAnnouncementModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(row)
        await self._session.flush()
        await self._session.refresh(row)
        return row

    async def update_announcement(
        self, announcement_id: uuid.UUID, payload: InternshipAnnouncementUpdate
    ) -> InternshipAnnouncementModel | None:
        row = await self.get_announcement(announcement_id)
        if row is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in list(updates.items()):
            if value is not None and hasattr(value, "value"):
                updates[key] = value.value
        for key, value in updates.items():
            setattr(row, key, value)
        row.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(row)
        return row

    async def list_applications(
        self,
        *,
        search: str | None = None,
        application_status: InternshipApplicationStatus | None = None,
    ) -> list[InternshipApplicationModel]:
        stmt: Select[tuple[InternshipApplicationModel]] = select(
            InternshipApplicationModel
        ).where(InternshipApplicationModel.organization_id == self._organization_id)
        if search:
            query = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(InternshipApplicationModel.full_name).like(query),
                    func.lower(InternshipApplicationModel.email).like(query),
                    func.lower(InternshipApplicationModel.phone).like(query),
                    func.lower(InternshipApplicationModel.registration_number).like(
                        query
                    ),
                    func.lower(InternshipApplicationModel.track).like(query),
                )
            )
        if application_status is not None:
            stmt = stmt.where(
                InternshipApplicationModel.status == application_status.value
            )
        stmt = stmt.order_by(InternshipApplicationModel.created_at.desc())
        result = await self._session.execute(stmt)
        return list(result.scalars().all())

    async def application_status_counts(self) -> dict[str, int]:
        result = await self._session.execute(
            select(InternshipApplicationModel.status, func.count())
            .where(InternshipApplicationModel.organization_id == self._organization_id)
            .group_by(InternshipApplicationModel.status)
        )
        return {row[0]: int(row[1]) for row in result.all()}

    async def get_application(
        self, application_id: uuid.UUID
    ) -> InternshipApplicationModel | None:
        result = await self._session.execute(
            select(InternshipApplicationModel).where(
                InternshipApplicationModel.id == application_id,
                InternshipApplicationModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_application(
        self, payload: InternshipApplicationCreate, registration_number: str
    ) -> InternshipApplicationModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["status"] = payload.status.value
        row = InternshipApplicationModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            registration_number=registration_number,
            certificate_id=None,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(row)
        await self._session.flush()
        await self._session.refresh(row)
        return row

    async def update_application(
        self, application_id: uuid.UUID, payload: InternshipApplicationUpdate
    ) -> InternshipApplicationModel | None:
        row = await self.get_application(application_id)
        if row is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in list(updates.items()):
            if value is not None and hasattr(value, "value"):
                updates[key] = value.value
        for key, value in updates.items():
            setattr(row, key, value)
        row.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(row)
        return row

    async def save_application(
        self, application: InternshipApplicationModel
    ) -> InternshipApplicationModel:
        application.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(application)
        return application

    async def delete_application(self, application_id: uuid.UUID) -> bool:
        row = await self.get_application(application_id)
        if row is None:
            return False
        await self._session.delete(row)
        await self._session.flush()
        return True

    async def list_certificates(self) -> list[InternshipCertificateModel]:
        result = await self._session.execute(
            select(InternshipCertificateModel)
            .where(InternshipCertificateModel.organization_id == self._organization_id)
            .order_by(InternshipCertificateModel.issued_at.desc())
        )
        return list(result.scalars().all())

    async def get_certificate_for_application(
        self, application_id: uuid.UUID
    ) -> InternshipCertificateModel | None:
        result = await self._session.execute(
            select(InternshipCertificateModel).where(
                InternshipCertificateModel.application_id == application_id,
                InternshipCertificateModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_certificate_by_code(
        self, verification_code: str
    ) -> InternshipCertificateModel | None:
        result = await self._session.execute(
            select(InternshipCertificateModel).where(
                InternshipCertificateModel.verification_code == verification_code,
                InternshipCertificateModel.status == "issued",
                InternshipCertificateModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create_certificate(
        self, certificate: InternshipCertificateModel
    ) -> InternshipCertificateModel:
        certificate.organization_id = self._organization_id
        self._session.add(certificate)
        await self._session.flush()
        await self._session.refresh(certificate)
        return certificate

    async def count_announcements(self) -> int:
        result = await self._session.execute(
            select(func.count())
            .select_from(InternshipAnnouncementModel)
            .where(InternshipAnnouncementModel.organization_id == self._organization_id)
        )
        return int(result.scalar_one())

    async def count_applications(self) -> int:
        result = await self._session.execute(
            select(func.count())
            .select_from(InternshipApplicationModel)
            .where(InternshipApplicationModel.organization_id == self._organization_id)
        )
        return int(result.scalar_one())

    async def count_certificates(self) -> int:
        result = await self._session.execute(
            select(func.count())
            .select_from(InternshipCertificateModel)
            .where(InternshipCertificateModel.organization_id == self._organization_id)
        )
        return int(result.scalar_one())

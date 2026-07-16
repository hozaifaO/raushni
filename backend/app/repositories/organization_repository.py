from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.organization import OrganizationMembershipModel, OrganizationModel


class OrganizationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, organization_id: uuid.UUID) -> OrganizationModel | None:
        return await self._session.get(OrganizationModel, organization_id)

    async def get_by_slug(self, slug: str) -> OrganizationModel | None:
        normalized = slug.strip().lower()
        if not normalized:
            return None
        result = await self._session.execute(
            select(OrganizationModel).where(OrganizationModel.slug == normalized)
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        *,
        slug: str,
        name: str,
        status: str = "active",
        primary_host: str | None = None,
    ) -> OrganizationModel:
        org = OrganizationModel(
            id=uuid.uuid4(),
            slug=slug.strip().lower(),
            name=name,
            status=status,
            primary_host=primary_host,
        )
        self._session.add(org)
        await self._session.flush()
        await self._session.refresh(org)
        return org

    async def list_memberships(
        self, organization_id: uuid.UUID
    ) -> list[OrganizationMembershipModel]:
        result = await self._session.execute(
            select(OrganizationMembershipModel)
            .where(OrganizationMembershipModel.organization_id == organization_id)
            .order_by(OrganizationMembershipModel.email)
        )
        return list(result.scalars().all())

    async def get_membership(
        self,
        organization_id: uuid.UUID,
        membership_id: uuid.UUID,
    ) -> OrganizationMembershipModel | None:
        result = await self._session.execute(
            select(OrganizationMembershipModel).where(
                OrganizationMembershipModel.organization_id == organization_id,
                OrganizationMembershipModel.id == membership_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_membership_by_email(
        self,
        organization_id: uuid.UUID,
        email: str,
    ) -> OrganizationMembershipModel | None:
        normalized = email.strip().lower()
        if not normalized:
            return None
        result = await self._session.execute(
            select(OrganizationMembershipModel).where(
                OrganizationMembershipModel.organization_id == organization_id,
                OrganizationMembershipModel.email == normalized,
            )
        )
        return result.scalar_one_or_none()

    async def update_membership_role(
        self,
        organization_id: uuid.UUID,
        membership_id: uuid.UUID,
        *,
        role: str,
    ) -> OrganizationMembershipModel | None:
        row = await self.get_membership(organization_id, membership_id)
        if row is None:
            return None
        row.role = role
        await self._session.flush()
        await self._session.refresh(row)
        return row

    async def ensure_membership(
        self,
        *,
        organization_id: uuid.UUID,
        email: str,
        role: str,
    ) -> OrganizationMembershipModel:
        normalized = email.strip().lower()
        existing = await self.get_membership_by_email(organization_id, normalized)
        if existing is not None:
            return existing
        row = OrganizationMembershipModel(
            id=uuid.uuid4(),
            organization_id=organization_id,
            email=normalized,
            role=role,
        )
        self._session.add(row)
        await self._session.flush()
        await self._session.refresh(row)
        return row

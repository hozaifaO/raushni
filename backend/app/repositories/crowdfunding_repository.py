from __future__ import annotations

import builtins
import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crowdfunding import CampaignDonationModel, CampaignModel
from app.schemas.crowdfunding import (
    CampaignCreate,
    CampaignDonationCreate,
    CampaignStatus,
    CampaignUpdate,
)


class CrowdfundingRepository:
    def __init__(self, session: AsyncSession, *, organization_id: uuid.UUID) -> None:
        self._session = session
        self._organization_id = organization_id

    async def list(
        self,
        *,
        search: str | None = None,
        status_filter: CampaignStatus | None = None,
        public_only: bool = False,
    ) -> tuple[
        list[CampaignModel], dict[uuid.UUID, int], int, int, int, int, float, float
    ]:
        stmt: Select[tuple[CampaignModel]] = select(CampaignModel).where(
            CampaignModel.organization_id == self._organization_id
        )
        if public_only:
            stmt = stmt.where(CampaignModel.status == CampaignStatus.PUBLISHED.value)
        if search:
            query = f"%{search.strip().lower()}%"
            stmt = stmt.where(
                or_(
                    func.lower(CampaignModel.title).like(query),
                    func.lower(CampaignModel.summary).like(query),
                    func.lower(CampaignModel.location).like(query),
                    func.lower(CampaignModel.category).like(query),
                )
            )
        if status_filter is not None:
            stmt = stmt.where(CampaignModel.status == status_filter.value)

        stmt = stmt.order_by(
            CampaignModel.end_date.asc(), CampaignModel.created_at.desc()
        )
        result = await self._session.execute(stmt)
        items = list(result.scalars().all())

        counts_result = await self._session.execute(
            select(CampaignModel.status, func.count())
            .where(CampaignModel.organization_id == self._organization_id)
            .group_by(CampaignModel.status)
        )
        counts = {row[0]: int(row[1]) for row in counts_result.all()}
        aggregates = await self._session.execute(
            select(
                func.coalesce(func.sum(CampaignModel.target_amount), 0),
                func.coalesce(func.sum(CampaignModel.amount_raised), 0),
            ).where(CampaignModel.organization_id == self._organization_id)
        )
        total_target, total_raised = aggregates.one()
        donation_counts = await self._donation_counts()
        total = sum(counts.values())
        return (
            items,
            donation_counts,
            total,
            counts.get(CampaignStatus.DRAFT.value, 0),
            counts.get(CampaignStatus.PUBLISHED.value, 0),
            counts.get(CampaignStatus.FUNDED.value, 0),
            float(total_target),
            float(total_raised),
        )

    async def _donation_counts(self) -> dict[uuid.UUID, int]:
        result = await self._session.execute(
            select(CampaignDonationModel.campaign_id, func.count())
            .where(CampaignDonationModel.organization_id == self._organization_id)
            .group_by(CampaignDonationModel.campaign_id)
        )
        return {row[0]: int(row[1]) for row in result.all()}

    async def donation_count(self, campaign_id: uuid.UUID) -> int:
        result = await self._session.execute(
            select(func.count()).where(
                CampaignDonationModel.campaign_id == campaign_id,
                CampaignDonationModel.organization_id == self._organization_id,
            )
        )
        return int(result.scalar_one())

    async def get(self, campaign_id: uuid.UUID) -> CampaignModel | None:
        result = await self._session.execute(
            select(CampaignModel).where(
                CampaignModel.id == campaign_id,
                CampaignModel.organization_id == self._organization_id,
            )
        )
        return result.scalar_one_or_none()

    async def create(self, payload: CampaignCreate) -> CampaignModel:
        now = datetime.now(timezone.utc)
        data = payload.model_dump()
        data["category"] = payload.category.value
        data["status"] = payload.status.value
        data["target_amount"] = Decimal(str(payload.target_amount))
        data["amount_raised"] = Decimal(str(payload.amount_raised))
        data["currency"] = payload.currency.upper()
        campaign = CampaignModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            created_at=now,
            updated_at=now,
            **data,
        )
        self._session.add(campaign)
        await self._session.flush()
        await self._session.refresh(campaign)
        return campaign

    async def update(
        self, campaign_id: uuid.UUID, payload: CampaignUpdate
    ) -> CampaignModel | None:
        campaign = await self.get(campaign_id)
        if campaign is None:
            return None
        updates = payload.model_dump(exclude_unset=True)
        for key, value in list(updates.items()):
            if value is not None and hasattr(value, "value"):
                updates[key] = value.value
            if key in {"target_amount", "amount_raised"} and updates[key] is not None:
                updates[key] = Decimal(str(updates[key]))
            if key == "currency" and updates[key] is not None:
                updates[key] = str(updates[key]).upper()
        for key, value in updates.items():
            setattr(campaign, key, value)
        campaign.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(campaign)
        return campaign

    async def delete(self, campaign_id: uuid.UUID) -> bool:
        campaign = await self.get(campaign_id)
        if campaign is None:
            return False
        await self._session.delete(campaign)
        await self._session.flush()
        return True

    async def list_donations(
        self, campaign_id: uuid.UUID
    ) -> builtins.list[CampaignDonationModel]:
        result = await self._session.execute(
            select(CampaignDonationModel)
            .where(
                CampaignDonationModel.campaign_id == campaign_id,
                CampaignDonationModel.organization_id == self._organization_id,
            )
            .order_by(CampaignDonationModel.created_at.desc())
        )
        return list(result.scalars().all())

    async def record_donation(
        self, campaign_id: uuid.UUID, payload: CampaignDonationCreate
    ) -> CampaignModel | None:
        campaign = await self.get(campaign_id)
        if campaign is None:
            return None
        locked = await self._session.execute(
            select(CampaignModel)
            .where(
                CampaignModel.id == campaign_id,
                CampaignModel.organization_id == self._organization_id,
            )
            .with_for_update()
        )
        campaign = locked.scalar_one()
        donation = CampaignDonationModel(
            id=uuid.uuid4(),
            organization_id=self._organization_id,
            campaign_id=campaign_id,
            donor_name=payload.donor_name,
            amount=Decimal(str(payload.amount)),
            payment_method=payload.payment_method,
            receipt_no=payload.receipt_no,
            note=payload.note,
            created_at=datetime.now(timezone.utc),
        )
        self._session.add(donation)
        campaign.amount_raised = Decimal(str(campaign.amount_raised)) + Decimal(
            str(payload.amount)
        )
        if campaign.amount_raised >= campaign.target_amount:
            campaign.status = CampaignStatus.FUNDED.value
        campaign.updated_at = datetime.now(timezone.utc)
        await self._session.flush()
        await self._session.refresh(campaign)
        return campaign

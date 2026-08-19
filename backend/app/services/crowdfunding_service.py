from __future__ import annotations

from uuid import UUID

from app.models.crowdfunding import CampaignModel
from app.repositories.crowdfunding_repository import CrowdfundingRepository
from app.schemas.crowdfunding import (
    Campaign,
    CampaignCreate,
    CampaignDonation,
    CampaignDonationCreate,
    CampaignListResponse,
    CampaignStatus,
    CampaignUpdate,
)


class CampaignNotFoundError(LookupError):
    pass


class CrowdfundingService:
    def __init__(self, repository: CrowdfundingRepository) -> None:
        self._repository = repository

    @staticmethod
    def _progress(amount_raised: float, target_amount: float) -> int:
        if target_amount <= 0:
            return 0
        return min(100, round((amount_raised / target_amount) * 100))

    def _to_campaign(self, row: CampaignModel, donation_count: int) -> Campaign:
        amount_raised = float(row.amount_raised)
        target_amount = float(row.target_amount)
        payload = {
            "id": row.id,
            "title": row.title,
            "slug": row.slug,
            "summary": row.summary,
            "category": row.category,
            "status": row.status,
            "target_amount": target_amount,
            "amount_raised": amount_raised,
            "currency": row.currency,
            "start_date": row.start_date,
            "end_date": row.end_date,
            "location": row.location,
            "beneficiary_count": row.beneficiary_count,
            "cover_image_url": row.cover_image_url,
            "public_url": row.public_url,
            "cms_slug": row.cms_slug,
            "owner": row.owner,
            "highlights": list(row.highlights or []),
            "impact_metrics": list(row.impact_metrics or []),
            "notes": row.notes,
            "progress_percent": self._progress(amount_raised, target_amount),
            "remaining_amount": max(target_amount - amount_raised, 0),
            "donation_count": donation_count,
            "created_at": row.created_at,
            "updated_at": row.updated_at,
        }
        return Campaign.model_validate(payload)

    async def list_campaigns(
        self,
        *,
        search: str | None = None,
        status_filter: CampaignStatus | None = None,
        public_only: bool = False,
    ) -> CampaignListResponse:
        (
            items,
            donation_counts,
            total,
            draft,
            published,
            funded,
            total_target,
            total_raised,
        ) = await self._repository.list(
            search=search,
            status_filter=status_filter,
            public_only=public_only,
        )
        campaigns = [
            self._to_campaign(item, donation_counts.get(item.id, 0)) for item in items
        ]
        return CampaignListResponse(
            items=campaigns,
            total=total,
            draft=draft,
            published=published,
            funded=funded,
            total_target=total_target,
            total_raised=total_raised,
            overall_progress_percent=self._progress(total_raised, total_target),
        )

    async def create_campaign(self, payload: CampaignCreate) -> Campaign:
        campaign = await self._repository.create(payload)
        return self._to_campaign(campaign, 0)

    async def get_campaign(self, campaign_id: UUID) -> Campaign:
        campaign = await self._repository.get(campaign_id)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign {campaign_id} was not found")
        return self._to_campaign(campaign, await self._repository.donation_count(campaign_id))

    async def update_campaign(self, campaign_id: UUID, payload: CampaignUpdate) -> Campaign:
        campaign = await self._repository.update(campaign_id, payload)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign {campaign_id} was not found")
        return self._to_campaign(campaign, await self._repository.donation_count(campaign_id))

    async def set_status(self, campaign_id: UUID, status: CampaignStatus) -> Campaign:
        return await self.update_campaign(campaign_id, CampaignUpdate(status=status))

    async def delete_campaign(self, campaign_id: UUID) -> None:
        deleted = await self._repository.delete(campaign_id)
        if not deleted:
            raise CampaignNotFoundError(f"Campaign {campaign_id} was not found")

    async def list_donations(self, campaign_id: UUID) -> list[CampaignDonation]:
        if await self._repository.get(campaign_id) is None:
            raise CampaignNotFoundError(f"Campaign {campaign_id} was not found")
        rows = await self._repository.list_donations(campaign_id)
        return [
            CampaignDonation(
                id=row.id,
                campaign_id=row.campaign_id,
                donor_name=row.donor_name,
                amount=float(row.amount),
                payment_method=row.payment_method,
                receipt_no=row.receipt_no,
                note=row.note,
                created_at=row.created_at,
            )
            for row in rows
        ]

    async def record_donation(self, campaign_id: UUID, payload: CampaignDonationCreate) -> Campaign:
        campaign = await self._repository.record_donation(campaign_id, payload)
        if campaign is None:
            raise CampaignNotFoundError(f"Campaign {campaign_id} was not found")
        return self._to_campaign(campaign, await self._repository.donation_count(campaign_id))

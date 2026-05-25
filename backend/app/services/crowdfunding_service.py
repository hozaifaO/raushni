from __future__ import annotations

from datetime import date, datetime, timezone
from uuid import UUID, uuid4

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
    def __init__(self) -> None:
        self._campaigns: dict[UUID, Campaign] = {}
        self._donations: dict[UUID, list[CampaignDonation]] = {}
        self._seed_defaults()

    def list_campaigns(
        self,
        *,
        search: str | None = None,
        status_filter: CampaignStatus | None = None,
        public_only: bool = False,
    ) -> CampaignListResponse:
        items = list(self._campaigns.values())
        if public_only:
            items = [item for item in items if item.status == CampaignStatus.PUBLISHED]
        if search:
            query = search.strip().lower()
            items = [
                item
                for item in items
                if query in item.title.lower()
                or query in item.summary.lower()
                or query in item.location.lower()
                or query in item.category.value
            ]
        if status_filter is not None:
            items = [item for item in items if item.status == status_filter]
        items.sort(key=lambda item: (item.status != CampaignStatus.PUBLISHED, item.end_date, item.created_at))
        all_campaigns = list(self._campaigns.values())
        total_target = sum(item.target_amount for item in all_campaigns)
        total_raised = sum(item.amount_raised for item in all_campaigns)
        return CampaignListResponse(
            items=items,
            total=len(all_campaigns),
            draft=sum(1 for item in all_campaigns if item.status == CampaignStatus.DRAFT),
            published=sum(1 for item in all_campaigns if item.status == CampaignStatus.PUBLISHED),
            funded=sum(1 for item in all_campaigns if item.status == CampaignStatus.FUNDED),
            total_target=total_target,
            total_raised=total_raised,
            overall_progress_percent=self._progress(total_raised, total_target),
        )

    def create_campaign(self, payload: CampaignCreate) -> Campaign:
        now = datetime.now(timezone.utc)
        campaign = self._build_campaign(payload.model_dump(), created_at=now, updated_at=now)
        self._campaigns[campaign.id] = campaign
        self._donations[campaign.id] = []
        return campaign

    def get_campaign(self, campaign_id: UUID) -> Campaign:
        try:
            return self._campaigns[campaign_id]
        except KeyError as exc:
            raise CampaignNotFoundError(f"Campaign {campaign_id} was not found") from exc

    def update_campaign(self, campaign_id: UUID, payload: CampaignUpdate) -> Campaign:
        current = self.get_campaign(campaign_id)
        values = current.model_dump()
        values.update(payload.model_dump(exclude_unset=True))
        values["id"] = current.id
        values["created_at"] = current.created_at
        values["updated_at"] = datetime.now(timezone.utc)
        updated = self._build_campaign(values)
        self._campaigns[campaign_id] = updated
        return updated

    def set_status(self, campaign_id: UUID, status: CampaignStatus) -> Campaign:
        return self.update_campaign(campaign_id, CampaignUpdate(status=status))

    def delete_campaign(self, campaign_id: UUID) -> None:
        self.get_campaign(campaign_id)
        del self._campaigns[campaign_id]
        self._donations.pop(campaign_id, None)

    def list_donations(self, campaign_id: UUID) -> list[CampaignDonation]:
        self.get_campaign(campaign_id)
        return sorted(self._donations.get(campaign_id, []), key=lambda item: item.created_at, reverse=True)

    def record_donation(self, campaign_id: UUID, payload: CampaignDonationCreate) -> Campaign:
        campaign = self.get_campaign(campaign_id)
        donation = CampaignDonation(
            id=uuid4(),
            campaign_id=campaign_id,
            donor_name=payload.donor_name.strip(),
            amount=payload.amount,
            payment_method=payload.payment_method.strip(),
            receipt_no=payload.receipt_no.strip() if payload.receipt_no else None,
            note=payload.note.strip() if payload.note else None,
            created_at=datetime.now(timezone.utc),
        )
        self._donations.setdefault(campaign_id, []).append(donation)
        next_status = CampaignStatus.FUNDED if campaign.amount_raised + payload.amount >= campaign.target_amount else campaign.status
        return self.update_campaign(
            campaign_id,
            CampaignUpdate(amount_raised=campaign.amount_raised + payload.amount, status=next_status),
        )

    def _build_campaign(
        self,
        values: dict,
        *,
        created_at: datetime | None = None,
        updated_at: datetime | None = None,
    ) -> Campaign:
        campaign_id = values.get("id") or uuid4()
        amount_raised = float(values.get("amount_raised", 0))
        target_amount = float(values.get("target_amount", 1))
        donation_count = len(self._donations.get(campaign_id, []))
        return Campaign(
            **{
                **values,
                "id": campaign_id,
                "currency": str(values.get("currency", "INR")).upper(),
                "amount_raised": amount_raised,
                "target_amount": target_amount,
                "progress_percent": self._progress(amount_raised, target_amount),
                "remaining_amount": max(target_amount - amount_raised, 0),
                "donation_count": donation_count,
                "created_at": created_at or values["created_at"],
                "updated_at": updated_at or values["updated_at"],
            },
        )

    @staticmethod
    def _progress(amount_raised: float, target_amount: float) -> int:
        if target_amount <= 0:
            return 0
        return min(100, round((amount_raised / target_amount) * 100))

    def _seed_defaults(self) -> None:
        self.create_campaign(
            CampaignCreate(
                title="Project Sparsh School WATSAN Fund",
                slug="project-sparsh-school-watsan-fund",
                summary=(
                    "Raise funds for safe drinking water, gender-segregated sanitation, handwashing stations, "
                    "and hygiene education across marginalized schools in Muzaffarpur."
                ),
                category="watsan",
                status=CampaignStatus.PUBLISHED,
                target_amount=4811136,
                amount_raised=825000,
                start_date=date(2026, 5, 15),
                end_date=date(2026, 9, 30),
                location="Muzaffarpur District, Bihar",
                beneficiary_count=2500,
                cover_image_url="/assets/images/og-image.jpg",
                public_url="/donate?campaign=project-sparsh-school-watsan-fund",
                cms_slug="project-sparsh-school-watsan-fund",
                owner="Programs and Fundraising",
                highlights=[
                    "10 schools targeted for RO drinking water and sanitation infrastructure.",
                    "MHM, hygiene, and teacher sensitization sessions included.",
                    "Community ownership and maintenance plan built into the campaign.",
                ],
                impact_metrics=[
                    "2500 students reached",
                    "10 school WATSAN sites",
                    "12-month implementation window",
                ],
                notes="Seeded campaign aligned with Project Sparsh proposal and CMS project content.",
            ),
        )
        self.create_campaign(
            CampaignCreate(
                title="Internship Learning Support Fund",
                slug="internship-learning-support-fund",
                summary=(
                    "Support digital learning kits, certificates, mentor sessions, and operational costs "
                    "for Raushni internship cohorts."
                ),
                category="education",
                status=CampaignStatus.REVIEW,
                target_amount=350000,
                amount_raised=94000,
                start_date=date(2026, 6, 1),
                end_date=date(2026, 8, 31),
                location="Virtual / India",
                beneficiary_count=120,
                public_url="/donate?campaign=internship-learning-support-fund",
                cms_slug="internship-learning-support-fund",
                owner="Internship Management",
                highlights=[
                    "Mentor-led project exposure for students.",
                    "Certificate generation and verification support.",
                    "Needs-based support for learning resources.",
                ],
                impact_metrics=["120 interns supported", "4 mentor tracks", "Verified certificates"],
                notes="Ready for review before publishing.",
            ),
        )

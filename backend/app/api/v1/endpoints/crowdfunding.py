from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies.auth import require_write_access
from app.api.dependencies.services import get_crowdfunding_service
from app.schemas.crowdfunding import (
    Campaign,
    CampaignCreate,
    CampaignDonation,
    CampaignDonationCreate,
    CampaignListResponse,
    CampaignStatus,
    CampaignUpdate,
)
from app.services.crowdfunding_service import CampaignNotFoundError, CrowdfundingService


router = APIRouter(prefix="/crowdfunding", tags=["crowdfunding"])


@router.get("", response_model=CampaignListResponse)
async def list_campaigns(
    search: str | None = Query(default=None, max_length=80),
    status_filter: CampaignStatus | None = None,
    public_only: bool = False,
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> CampaignListResponse:
    return await service.list_campaigns(
        search=search, status_filter=status_filter, public_only=public_only
    )


@router.post("", response_model=Campaign, status_code=status.HTTP_201_CREATED)
async def create_campaign(
    payload: CampaignCreate,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    return await service.create_campaign(payload)


@router.get("/{campaign_id}", response_model=Campaign)
async def get_campaign(
    campaign_id: UUID,
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    try:
        return await service.get_campaign(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{campaign_id}", response_model=Campaign)
async def update_campaign(
    campaign_id: UUID,
    payload: CampaignUpdate,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    try:
        return await service.update_campaign(campaign_id, payload)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{campaign_id}/status/{campaign_status}", response_model=Campaign)
async def set_campaign_status(
    campaign_id: UUID,
    campaign_status: CampaignStatus,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    try:
        return await service.set_status(campaign_id, campaign_status)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: UUID,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Response:
    try:
        await service.delete_campaign(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{campaign_id}/donations", response_model=list[CampaignDonation])
async def list_campaign_donations(
    campaign_id: UUID,
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> list[CampaignDonation]:
    try:
        return await service.list_donations(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{campaign_id}/donations", response_model=Campaign, status_code=status.HTTP_201_CREATED)
async def record_campaign_donation(
    campaign_id: UUID,
    payload: CampaignDonationCreate,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    try:
        return await service.record_donation(campaign_id, payload)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

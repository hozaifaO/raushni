from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.dependencies.auth import require_write_access
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


def get_crowdfunding_service(request: Request) -> CrowdfundingService:
    return request.app.state.crowdfunding_service


@router.get("", response_model=CampaignListResponse)
def list_campaigns(
    search: str | None = None,
    status_filter: CampaignStatus | None = None,
    public_only: bool = False,
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> CampaignListResponse:
    return service.list_campaigns(search=search, status_filter=status_filter, public_only=public_only)


@router.post("", response_model=Campaign, status_code=status.HTTP_201_CREATED)
def create_campaign(
    payload: CampaignCreate,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    return service.create_campaign(payload)


@router.get("/{campaign_id}", response_model=Campaign)
def get_campaign(campaign_id: UUID, service: CrowdfundingService = Depends(get_crowdfunding_service)) -> Campaign:
    try:
        return service.get_campaign(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{campaign_id}", response_model=Campaign)
def update_campaign(
    campaign_id: UUID,
    payload: CampaignUpdate,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    try:
        return service.update_campaign(campaign_id, payload)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{campaign_id}/status/{campaign_status}", response_model=Campaign)
def set_campaign_status(
    campaign_id: UUID,
    campaign_status: CampaignStatus,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    try:
        return service.set_status(campaign_id, campaign_status)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_campaign(
    campaign_id: UUID,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Response:
    try:
        service.delete_campaign(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{campaign_id}/donations", response_model=list[CampaignDonation])
def list_campaign_donations(
    campaign_id: UUID,
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> list[CampaignDonation]:
    try:
        return service.list_donations(campaign_id)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{campaign_id}/donations", response_model=Campaign, status_code=status.HTTP_201_CREATED)
def record_campaign_donation(
    campaign_id: UUID,
    payload: CampaignDonationCreate,
    _role: object = Depends(require_write_access),
    service: CrowdfundingService = Depends(get_crowdfunding_service),
) -> Campaign:
    try:
        return service.record_donation(campaign_id, payload)
    except CampaignNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Response, status

from app.api.dependencies.auth import get_current_role, require_write_access
from app.api.dependencies.services import get_donation_service
from app.constants.roles import UserRole
from app.schemas.donation import (
    Donation,
    DonationCheckoutSession,
    DonationCreate,
    DonationListResponse,
    DonationMarkPaid,
    DonationPaymentStatus,
    DonationReceipt,
    DonationStatusEvent,
    DonationUpdate,
    PublicDonationCreate,
)
from app.services.donation_service import (
    DonationMarkPaidError,
    DonationNotFoundError,
    DonationReceiptFrozenError,
    DonationReceiptUnavailableError,
    DonationService,
)
from app.services.payment_service import PaymentGatewayError, PaymentGatewayUnavailableError


router = APIRouter(prefix="/donations", tags=["donations"])


@router.get("", response_model=DonationListResponse)
async def list_donations(
    search: str | None = Query(default=None, max_length=80),
    status_filter: DonationPaymentStatus | None = None,
    service: DonationService = Depends(get_donation_service),
) -> DonationListResponse:
    return await service.list_donations(search=search, payment_status=status_filter)


@router.post("", response_model=Donation, status_code=status.HTTP_201_CREATED)
async def create_donation(
    payload: DonationCreate,
    role: UserRole = Depends(require_write_access),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    try:
        return await service.create_donation(
            payload,
            actor_role=role.value,
            actor_email=x_user_email,
        )
    except DonationMarkPaidError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/public", response_model=Donation, status_code=status.HTTP_201_CREATED)
async def register_public_donation(
    payload: PublicDonationCreate,
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    return await service.create_donation(
        payload.to_donation_create(),
        actor_role="public",
        actor_email=None,
    )


@router.post("/{donation_id}/checkout", response_model=DonationCheckoutSession)
async def create_checkout_session(
    donation_id: UUID,
    service: DonationService = Depends(get_donation_service),
) -> DonationCheckoutSession:
    try:
        return await service.create_checkout_session(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PaymentGatewayUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except PaymentGatewayError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.get("/{donation_id}", response_model=Donation)
async def get_donation(
    donation_id: UUID,
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    try:
        return await service.get_donation(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{donation_id}/events", response_model=list[DonationStatusEvent])
async def list_donation_events(
    donation_id: UUID,
    role: UserRole = Depends(get_current_role),
    service: DonationService = Depends(get_donation_service),
) -> list[DonationStatusEvent]:
    if role == UserRole.GUEST:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Staff access is required to view donation status events.",
        )
    try:
        return await service.list_status_events(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{donation_id}/mark-paid", response_model=Donation)
async def mark_donation_paid(
    donation_id: UUID,
    payload: DonationMarkPaid,
    role: UserRole = Depends(require_write_access),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    try:
        return await service.mark_paid(
            donation_id,
            payload,
            actor_role=role.value,
            actor_email=x_user_email,
        )
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DonationMarkPaidError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except DonationReceiptFrozenError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.patch("/{donation_id}", response_model=Donation)
async def update_donation(
    donation_id: UUID,
    payload: DonationUpdate,
    role: UserRole = Depends(require_write_access),
    x_user_email: str | None = Header(default=None, alias="X-User-Email"),
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    try:
        return await service.update_donation(
            donation_id,
            payload,
            actor_role=role.value,
            actor_email=x_user_email,
        )
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DonationMarkPaidError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except DonationReceiptFrozenError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/{donation_id}/receipt", response_model=DonationReceipt)
async def issue_receipt(
    donation_id: UUID,
    _role: object = Depends(require_write_access),
    service: DonationService = Depends(get_donation_service),
) -> DonationReceipt:
    try:
        return await service.issue_receipt(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DonationReceiptUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{donation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_donation(
    donation_id: UUID,
    _role: object = Depends(require_write_access),
    service: DonationService = Depends(get_donation_service),
) -> Response:
    try:
        await service.delete_donation(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

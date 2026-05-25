from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.dependencies.auth import require_write_access
from app.schemas.donation import (
    Donation,
    DonationCheckoutSession,
    DonationCreate,
    DonationListResponse,
    DonationPaymentStatus,
    DonationReceipt,
    DonationUpdate,
)
from app.services.donation_service import (
    DonationNotFoundError,
    DonationReceiptUnavailableError,
    DonationService,
)
from app.services.payment_service import PaymentGatewayError, PaymentGatewayUnavailableError


router = APIRouter(prefix="/donations", tags=["donations"])


def get_donation_service(request: Request) -> DonationService:
    return request.app.state.donation_service


@router.get("", response_model=DonationListResponse)
def list_donations(
    search: str | None = None,
    status_filter: DonationPaymentStatus | None = None,
    service: DonationService = Depends(get_donation_service),
) -> DonationListResponse:
    return service.list_donations(search=search, payment_status=status_filter)


@router.post("", response_model=Donation, status_code=status.HTTP_201_CREATED)
def create_donation(
    payload: DonationCreate,
    _role: object = Depends(require_write_access),
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    return service.create_donation(payload)


@router.post("/public", response_model=Donation, status_code=status.HTTP_201_CREATED)
def register_public_donation(
    payload: DonationCreate,
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    public_payload = payload.model_copy(update={"payment_status": DonationPaymentStatus.PENDING})
    return service.create_donation(public_payload)


@router.post("/{donation_id}/checkout", response_model=DonationCheckoutSession)
def create_checkout_session(
    donation_id: UUID,
    service: DonationService = Depends(get_donation_service),
) -> DonationCheckoutSession:
    try:
        return service.create_checkout_session(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except PaymentGatewayUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
    except PaymentGatewayError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc


@router.get("/{donation_id}", response_model=Donation)
def get_donation(
    donation_id: UUID,
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    try:
        return service.get_donation(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{donation_id}", response_model=Donation)
def update_donation(
    donation_id: UUID,
    payload: DonationUpdate,
    _role: object = Depends(require_write_access),
    service: DonationService = Depends(get_donation_service),
) -> Donation:
    try:
        return service.update_donation(donation_id, payload)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/{donation_id}/receipt", response_model=DonationReceipt)
def issue_receipt(
    donation_id: UUID,
    _role: object = Depends(require_write_access),
    service: DonationService = Depends(get_donation_service),
) -> DonationReceipt:
    try:
        return service.issue_receipt(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DonationReceiptUnavailableError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/{donation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_donation(
    donation_id: UUID,
    _role: object = Depends(require_write_access),
    service: DonationService = Depends(get_donation_service),
) -> Response:
    try:
        service.delete_donation(donation_id)
    except DonationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

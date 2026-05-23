from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.dependencies.auth import require_write_access
from app.schemas.designation import (
    Designation,
    DesignationCreate,
    DesignationListResponse,
    DesignationStatus,
    DesignationUpdate,
)
from app.services.designation_service import DesignationConflictError, DesignationNotFoundError, DesignationService


router = APIRouter(prefix="/designations", tags=["designations"])


def get_designation_service(request: Request) -> DesignationService:
    return request.app.state.designation_service


@router.get("", response_model=DesignationListResponse)
def list_designations(
    search: str | None = None,
    status_filter: DesignationStatus | None = None,
    department: str | None = None,
    service: DesignationService = Depends(get_designation_service),
) -> DesignationListResponse:
    return service.list_designations(search=search, status_filter=status_filter, department=department)


@router.post("", response_model=Designation, status_code=status.HTTP_201_CREATED)
def create_designation(
    payload: DesignationCreate,
    _role: object = Depends(require_write_access),
    service: DesignationService = Depends(get_designation_service),
) -> Designation:
    try:
        return service.create_designation(payload)
    except DesignationConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/{designation_id}", response_model=Designation)
def get_designation(
    designation_id: UUID,
    service: DesignationService = Depends(get_designation_service),
) -> Designation:
    try:
        return service.get_designation(designation_id)
    except DesignationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{designation_id}", response_model=Designation)
def update_designation(
    designation_id: UUID,
    payload: DesignationUpdate,
    _role: object = Depends(require_write_access),
    service: DesignationService = Depends(get_designation_service),
) -> Designation:
    try:
        return service.update_designation(designation_id, payload)
    except DesignationConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except DesignationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{designation_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_designation(
    designation_id: UUID,
    _role: object = Depends(require_write_access),
    service: DesignationService = Depends(get_designation_service),
) -> Response:
    try:
        service.delete_designation(designation_id)
    except DesignationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

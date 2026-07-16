from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies.auth import require_write_access
from app.api.dependencies.services import get_designation_service
from app.schemas.designation import (
    Designation,
    DesignationCreate,
    DesignationListResponse,
    DesignationStatus,
    DesignationUpdate,
)
from app.services.designation_service import DesignationConflictError, DesignationNotFoundError, DesignationService


router = APIRouter(prefix="/designations", tags=["designations"])


@router.get("", response_model=DesignationListResponse)
async def list_designations(
    search: str | None = Query(default=None, max_length=80),
    status_filter: DesignationStatus | None = None,
    department: str | None = Query(default=None, max_length=80),
    service: DesignationService = Depends(get_designation_service),
) -> DesignationListResponse:
    return await service.list_designations(
        search=search, status_filter=status_filter, department=department
    )


@router.post("", response_model=Designation, status_code=status.HTTP_201_CREATED)
async def create_designation(
    payload: DesignationCreate,
    _role: object = Depends(require_write_access),
    service: DesignationService = Depends(get_designation_service),
) -> Designation:
    try:
        return await service.create_designation(payload)
    except DesignationConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/{designation_id}", response_model=Designation)
async def get_designation(
    designation_id: UUID,
    service: DesignationService = Depends(get_designation_service),
) -> Designation:
    try:
        return await service.get_designation(designation_id)
    except DesignationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{designation_id}", response_model=Designation)
async def update_designation(
    designation_id: UUID,
    payload: DesignationUpdate,
    _role: object = Depends(require_write_access),
    service: DesignationService = Depends(get_designation_service),
) -> Designation:
    try:
        return await service.update_designation(designation_id, payload)
    except DesignationConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except DesignationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{designation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_designation(
    designation_id: UUID,
    _role: object = Depends(require_write_access),
    service: DesignationService = Depends(get_designation_service),
) -> Response:
    try:
        await service.delete_designation(designation_id)
    except DesignationNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

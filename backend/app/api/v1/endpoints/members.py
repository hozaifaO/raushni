from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies.auth import require_write_access
from app.api.dependencies.services import get_member_service
from app.schemas.member import Member, MemberCreate, MemberListResponse, MemberStatus, MemberUpdate
from app.services.member_service import MemberNotFoundError, MemberService


router = APIRouter(prefix="/members", tags=["members"])


@router.get("", response_model=MemberListResponse)
async def list_members(
    search: str | None = Query(default=None, max_length=80),
    status_filter: MemberStatus | None = None,
    service: MemberService = Depends(get_member_service),
) -> MemberListResponse:
    return await service.list_members(search=search, status=status_filter)


@router.post("", response_model=Member, status_code=status.HTTP_201_CREATED)
async def create_member(
    payload: MemberCreate,
    _role: object = Depends(require_write_access),
    service: MemberService = Depends(get_member_service),
) -> Member:
    return await service.create_member(payload)


@router.get("/{member_id}", response_model=Member)
async def get_member(
    member_id: UUID,
    service: MemberService = Depends(get_member_service),
) -> Member:
    try:
        return await service.get_member(member_id)
    except MemberNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{member_id}", response_model=Member)
async def update_member(
    member_id: UUID,
    payload: MemberUpdate,
    _role: object = Depends(require_write_access),
    service: MemberService = Depends(get_member_service),
) -> Member:
    try:
        return await service.update_member(member_id, payload)
    except MemberNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: UUID,
    _role: object = Depends(require_write_access),
    service: MemberService = Depends(get_member_service),
) -> Response:
    try:
        await service.delete_member(member_id)
    except MemberNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

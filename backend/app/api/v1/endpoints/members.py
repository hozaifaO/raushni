from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.dependencies.auth import require_write_access
from app.schemas.member import Member, MemberCreate, MemberListResponse, MemberStatus, MemberUpdate
from app.services.member_service import MemberNotFoundError, MemberService


router = APIRouter(prefix="/members", tags=["members"])


def get_member_service(request: Request) -> MemberService:
    return request.app.state.member_service


@router.get("", response_model=MemberListResponse)
def list_members(
    search: str | None = None,
    status_filter: MemberStatus | None = None,
    service: MemberService = Depends(get_member_service),
) -> MemberListResponse:
    return service.list_members(search=search, status=status_filter)


@router.post("", response_model=Member, status_code=status.HTTP_201_CREATED)
def create_member(
    payload: MemberCreate,
    _role: object = Depends(require_write_access),
    service: MemberService = Depends(get_member_service),
) -> Member:
    return service.create_member(payload)


@router.get("/{member_id}", response_model=Member)
def get_member(
    member_id: UUID,
    service: MemberService = Depends(get_member_service),
) -> Member:
    try:
        return service.get_member(member_id)
    except MemberNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{member_id}", response_model=Member)
def update_member(
    member_id: UUID,
    payload: MemberUpdate,
    _role: object = Depends(require_write_access),
    service: MemberService = Depends(get_member_service),
) -> Member:
    try:
        return service.update_member(member_id, payload)
    except MemberNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    member_id: UUID,
    _role: object = Depends(require_write_access),
    service: MemberService = Depends(get_member_service),
) -> Response:
    try:
        service.delete_member(member_id)
    except MemberNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

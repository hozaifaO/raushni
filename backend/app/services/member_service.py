from __future__ import annotations

from uuid import UUID

from app.repositories.member_repository import MemberRepository
from app.schemas.member import (
    Member,
    MemberCreate,
    MemberListResponse,
    MemberStatus,
    MemberUpdate,
)


class MemberNotFoundError(LookupError):
    pass


class MemberService:
    def __init__(self, repository: MemberRepository) -> None:
        self._repository = repository

    async def list_members(
        self,
        *,
        search: str | None = None,
        status: MemberStatus | None = None,
    ) -> MemberListResponse:
        items, total, active, inactive, pending = await self._repository.list(
            search=search,
            status=status,
        )
        return MemberListResponse(
            items=[Member.model_validate(item) for item in items],
            total=total,
            active=active,
            inactive=inactive,
            pending=pending,
        )

    async def create_member(self, payload: MemberCreate) -> Member:
        member = await self._repository.create(payload)
        return Member.model_validate(member)

    async def get_member(self, member_id: UUID) -> Member:
        member = await self._repository.get(member_id)
        if member is None:
            raise MemberNotFoundError(f"Member {member_id} was not found")
        return Member.model_validate(member)

    async def update_member(self, member_id: UUID, payload: MemberUpdate) -> Member:
        member = await self._repository.update(member_id, payload)
        if member is None:
            raise MemberNotFoundError(f"Member {member_id} was not found")
        return Member.model_validate(member)

    async def delete_member(self, member_id: UUID) -> None:
        deleted = await self._repository.delete(member_id)
        if not deleted:
            raise MemberNotFoundError(f"Member {member_id} was not found")

from __future__ import annotations

from uuid import UUID

from app.core.config import get_settings
from app.core.redis import cache_delete, cache_get_json, cache_set_json
from app.repositories.member_repository import MemberRepository
from app.schemas.member import Member, MemberCreate, MemberListResponse, MemberStatus, MemberUpdate


class MemberNotFoundError(LookupError):
    pass


def _member_cache_key(organization_id: UUID, member_id: UUID) -> str:
    return f"org:{organization_id}:member:{member_id}"


class MemberService:
    def __init__(self, repository: MemberRepository) -> None:
        self._repository = repository
        self._ttl = get_settings().redis_cache_ttl_seconds

    @property
    def _organization_id(self) -> UUID:
        return self._repository._organization_id

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
        cache_key = _member_cache_key(self._organization_id, member_id)
        cached = await cache_get_json(cache_key)
        if cached is not None:
            return Member.model_validate(cached)

        member = await self._repository.get(member_id)
        if member is None:
            raise MemberNotFoundError(f"Member {member_id} was not found")
        schema = Member.model_validate(member)
        await cache_set_json(cache_key, schema.model_dump(mode="json"), self._ttl)
        return schema

    async def update_member(self, member_id: UUID, payload: MemberUpdate) -> Member:
        member = await self._repository.update(member_id, payload)
        if member is None:
            raise MemberNotFoundError(f"Member {member_id} was not found")
        await cache_delete(_member_cache_key(self._organization_id, member_id))
        return Member.model_validate(member)

    async def delete_member(self, member_id: UUID) -> None:
        deleted = await self._repository.delete(member_id)
        if not deleted:
            raise MemberNotFoundError(f"Member {member_id} was not found")
        await cache_delete(_member_cache_key(self._organization_id, member_id))

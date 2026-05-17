from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.schemas.member import Member, MemberCreate, MemberListResponse, MemberStatus, MemberUpdate


class MemberNotFoundError(LookupError):
    pass


class MemberService:
    def __init__(self) -> None:
        self._members: dict[UUID, Member] = {}

    def list_members(
        self,
        *,
        search: str | None = None,
        status: MemberStatus | None = None,
    ) -> MemberListResponse:
        items = list(self._members.values())

        if search:
            query = search.strip().lower()
            items = [
                member
                for member in items
                if query in member.full_name.lower()
                or query in member.phone.lower()
                or (member.email is not None and query in member.email.lower())
                or query in member.role.lower()
            ]

        if status is not None:
            items = [member for member in items if member.status == status]

        items.sort(key=lambda member: (member.joined_on, member.full_name.lower()), reverse=True)
        all_members = list(self._members.values())

        return MemberListResponse(
            items=items,
            total=len(all_members),
            active=sum(1 for member in all_members if member.status == MemberStatus.ACTIVE),
            inactive=sum(1 for member in all_members if member.status == MemberStatus.INACTIVE),
            pending=sum(1 for member in all_members if member.status == MemberStatus.PENDING),
        )

    def create_member(self, payload: MemberCreate) -> Member:
        now = datetime.now(timezone.utc)
        member = Member(
            id=uuid4(),
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self._members[member.id] = member
        return member

    def get_member(self, member_id: UUID) -> Member:
        try:
            return self._members[member_id]
        except KeyError as exc:
            raise MemberNotFoundError(f"Member {member_id} was not found") from exc

    def update_member(self, member_id: UUID, payload: MemberUpdate) -> Member:
        member = self.get_member(member_id)
        updates = payload.model_dump(exclude_unset=True)
        updated = member.model_copy(
            update={
                **updates,
                "updated_at": datetime.now(timezone.utc),
            },
        )
        self._members[member_id] = updated
        return updated

    def delete_member(self, member_id: UUID) -> None:
        self.get_member(member_id)
        del self._members[member_id]

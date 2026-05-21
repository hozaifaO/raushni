from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from app.constants.permissions import ROLE_PERMISSIONS
from app.constants.roles import UserRole
from app.schemas.settings import (
    AccountProfile,
    PlatformSettings,
    PlatformSettingsUpdate,
    RoleAccess,
    SettingsDashboard,
)
from app.schemas.user import UserAccount, UserAccountUpdate, UserStatus


class UserAccountNotFoundError(LookupError):
    pass


ROLE_DESCRIPTIONS = {
    UserRole.ADMIN: "Full platform administration including users, roles, CMS, and settings.",
    UserRole.STAFF: "Operational access for day-to-day records, content, and documents.",
    UserRole.GUEST: "Read-only access for review, audit, and supervised viewing.",
}


class SettingsService:
    def __init__(self) -> None:
        now = datetime.now(timezone.utc)
        self._users: dict[UUID, UserAccount] = {}
        for user in (
            UserAccount(
                id=uuid4(),
                name="Admin User",
                email="admin@raushni.com",
                role=UserRole.ADMIN,
                access_level="write",
                last_login_at=now,
            ),
            UserAccount(
                id=uuid4(),
                name="Program Staff",
                email="staff@raushni.com",
                role=UserRole.STAFF,
                access_level="write",
                last_login_at=now,
            ),
            UserAccount(
                id=uuid4(),
                name="Guest User",
                email="guest@raushni.com",
                role=UserRole.GUEST,
                access_level="read",
                last_login_at=now,
            ),
        ):
            self._users[user.id] = user

        self._platform = PlatformSettings()
        self._updated_at = now

    def get_profile(self, *, role: UserRole, email: str | None = None) -> AccountProfile:
        user = self._find_user(role=role, email=email)
        return AccountProfile(
            user=user,
            permissions=self._permissions_for(role),
            role=self._role_access(role),
            session_started_at=datetime.now(timezone.utc),
        )

    def get_settings(self) -> SettingsDashboard:
        return SettingsDashboard(
            users=sorted(self._users.values(), key=lambda user: (user.role.value, user.name)),
            roles=[self._role_access(role) for role in UserRole],
            platform=self._platform,
            updated_at=self._updated_at,
        )

    def update_platform(self, payload: PlatformSettingsUpdate) -> PlatformSettings:
        updates = payload.model_dump(exclude_unset=True)
        self._platform = self._platform.model_copy(update=updates)
        self._updated_at = datetime.now(timezone.utc)
        return self._platform

    def update_user(self, user_id: UUID, payload: UserAccountUpdate) -> UserAccount:
        try:
            user = self._users[user_id]
        except KeyError as exc:
            raise UserAccountNotFoundError(f"User {user_id} was not found") from exc

        updates = payload.model_dump(exclude_unset=True)
        if "role" in updates:
            updates["access_level"] = "write" if updates["role"] in {UserRole.ADMIN, UserRole.STAFF} else "read"
        updated = user.model_copy(update=updates)
        self._users[user_id] = updated
        self._updated_at = datetime.now(timezone.utc)
        return updated

    def _find_user(self, *, role: UserRole, email: str | None) -> UserAccount:
        normalized_email = email.strip().lower() if email else None
        if normalized_email:
            for user in self._users.values():
                if user.email.lower() == normalized_email:
                    return user

        for user in self._users.values():
            if user.role == role and user.status != UserStatus.SUSPENDED:
                return user

        return next(iter(self._users.values()))

    def _role_access(self, role: UserRole) -> RoleAccess:
        return RoleAccess(
            role=role,
            label=role.value.title(),
            description=ROLE_DESCRIPTIONS[role],
            permissions=self._permissions_for(role),
            can_write=role in {UserRole.ADMIN, UserRole.STAFF},
            is_admin=role == UserRole.ADMIN,
        )

    def _permissions_for(self, role: UserRole) -> list[str]:
        return sorted(ROLE_PERMISSIONS.get(role, set()))

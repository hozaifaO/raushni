from __future__ import annotations

from datetime import datetime, timezone
from uuid import NAMESPACE_URL, UUID, uuid5

from app.constants.permissions import ROLE_PERMISSIONS
from app.constants.roles import UserRole, normalize_role
from app.models.organization import OrganizationMembershipModel, OrganizationModel
from app.repositories.organization_repository import OrganizationRepository
from app.repositories.settings_repository import PlatformSettingsRepository
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

_KNOWN_DISPLAY_NAMES = {
    "admin@raushni.com": "Admin User",
    "admin@raushni.local": "Admin User",
    "staff@raushni.com": "Program Staff",
    "staff@raushni.local": "Program Staff",
    "guest@raushni.com": "Guest User",
    "guest@raushni.local": "Guest User",
}


class UserAccountStore:
    """Ephemeral name/status overlays until Better Auth owns identity (not auth SoT)."""

    def __init__(self) -> None:
        self._overlays: dict[UUID, dict[str, object]] = {}

    def apply(self, user: UserAccount) -> UserAccount:
        overlay = self._overlays.get(user.id)
        if not overlay:
            return user
        return user.model_copy(update=overlay)

    def update(self, user_id: UUID, payload: UserAccountUpdate) -> None:
        updates = {
            key: value
            for key, value in payload.model_dump(exclude_unset=True).items()
            if key in {"name", "status"}
        }
        if not updates:
            return
        existing = self._overlays.get(user_id, {})
        self._overlays[user_id] = {**existing, **updates}


class SettingsService:
    def __init__(
        self,
        repository: PlatformSettingsRepository,
        organization_repository: OrganizationRepository,
        organization: OrganizationModel,
        user_store: UserAccountStore,
    ) -> None:
        self._repository = repository
        self._organizations = organization_repository
        self._organization = organization
        self._users = user_store

    async def get_profile(
        self, *, role: UserRole, email: str | None = None
    ) -> AccountProfile:
        user = await self._resolve_user(role=role, email=email)
        return AccountProfile(
            user=user,
            permissions=self._permissions_for(role),
            role=self._role_access(role),
            session_started_at=datetime.now(timezone.utc),
            organization_id=self._organization.id,
            tenant_slug=self._organization.slug,
            organization_name=self._organization.name,
        )

    async def get_settings(self) -> SettingsDashboard:
        platform_row = await self._repository.get_or_create(
            default_organization_name=self._organization.name
        )
        memberships = await self._organizations.list_memberships(self._organization.id)
        users = [
            self._users.apply(self._membership_to_account(row)) for row in memberships
        ]
        users.sort(key=lambda user: (user.role.value, user.name.lower()))
        return SettingsDashboard(
            users=users,
            roles=[self._role_access(role) for role in UserRole],
            platform=PlatformSettings.model_validate(platform_row),
            updated_at=platform_row.updated_at,
            organization_id=self._organization.id,
            tenant_slug=self._organization.slug,
            organization_name=self._organization.name,
        )

    async def update_platform(
        self, payload: PlatformSettingsUpdate
    ) -> PlatformSettings:
        row = await self._repository.update(
            payload,
            default_organization_name=self._organization.name,
        )
        return PlatformSettings.model_validate(row)

    async def update_user(
        self, user_id: UUID, payload: UserAccountUpdate
    ) -> UserAccount:
        membership = await self._organizations.get_membership(
            self._organization.id, user_id
        )
        if membership is None:
            raise UserAccountNotFoundError(f"User {user_id} was not found")

        updates = payload.model_dump(exclude_unset=True)
        if "role" in updates and updates["role"] is not None:
            role_value = (
                updates["role"].value
                if isinstance(updates["role"], UserRole)
                else str(updates["role"])
            )
            updated = await self._organizations.update_membership_role(
                self._organization.id,
                user_id,
                role=role_value,
            )
            if updated is None:
                raise UserAccountNotFoundError(f"User {user_id} was not found")
            membership = updated

        overlay_fields = {k: v for k, v in updates.items() if k in {"name", "status"}}
        if overlay_fields:
            self._users.update(user_id, UserAccountUpdate(**overlay_fields))
        return self._users.apply(self._membership_to_account(membership))

    async def _resolve_user(self, *, role: UserRole, email: str | None) -> UserAccount:
        normalized_email = email.strip().lower() if email else None
        if normalized_email:
            membership = await self._organizations.get_membership_by_email(
                self._organization.id, normalized_email
            )
            if membership is not None:
                return self._users.apply(self._membership_to_account(membership))

        # NextAuth env login may succeed before a membership row exists; synthesize a session user.
        synthetic_id = uuid5(
            NAMESPACE_URL,
            f"org:{self._organization.id}:email:{normalized_email or role.value}",
        )
        display = _KNOWN_DISPLAY_NAMES.get(normalized_email or "", "") or (
            normalized_email.split("@", 1)[0].replace(".", " ").title()
            if normalized_email
            else role.value.title()
        )
        return self._users.apply(
            UserAccount(
                id=synthetic_id,
                name=display,
                email=normalized_email
                or f"{role.value.lower()}@{self._organization.slug}.local",
                role=role,
                access_level="write"
                if role in {UserRole.ADMIN, UserRole.STAFF}
                else "read",
                last_login_at=datetime.now(timezone.utc),
            )
        )

    def _membership_to_account(
        self, membership: OrganizationMembershipModel
    ) -> UserAccount:
        role = normalize_role(membership.role)
        email = membership.email
        name = (
            _KNOWN_DISPLAY_NAMES.get(email)
            or email.split("@", 1)[0].replace(".", " ").title()
        )
        return UserAccount(
            id=membership.id,
            name=name,
            email=email,
            role=role,
            status=UserStatus.ACTIVE,
            access_level="write"
            if role in {UserRole.ADMIN, UserRole.STAFF}
            else "read",
            last_login_at=None,
        )

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

from __future__ import annotations

from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    GUEST = "GUEST"


WRITE_ROLES = {UserRole.ADMIN, UserRole.STAFF}
READ_ONLY_ROLES = {UserRole.GUEST}


def normalize_role(value: str | None) -> UserRole:
    if not value:
        return UserRole.GUEST

    normalized = value.strip().upper()
    aliases = {
        "ADMINISTRATOR": UserRole.ADMIN,
        "RAUSHNI_ADMIN": UserRole.ADMIN,
        "REALM_ADMIN": UserRole.ADMIN,
        "MANAGER": UserRole.STAFF,
        "RAUSHNI_STAFF": UserRole.STAFF,
        "USER": UserRole.STAFF,
        "READ_ONLY": UserRole.GUEST,
        "READONLY": UserRole.GUEST,
        "VIEWER": UserRole.GUEST,
        "RAUSHNI_GUEST": UserRole.GUEST,
        "DEFAULT": UserRole.GUEST,
    }

    if normalized in aliases:
        return aliases[normalized]

    try:
        return UserRole(normalized)
    except ValueError:
        return UserRole.GUEST


def can_write(role: UserRole) -> bool:
    return role in WRITE_ROLES

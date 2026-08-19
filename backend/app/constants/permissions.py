from __future__ import annotations

from app.constants.roles import UserRole

READ_PERMISSIONS = {
    "activities:read",
    "beneficiaries:read",
    "crowdfunding:read",
    "dashboard:read",
    "designations:read",
    "documents:read",
    "donations:read",
    "enquiries:read",
    "events:read",
    "expenses:read",
    "internships:read",
    "members:read",
    "news:read",
    "projects:read",
    "reports:read",
    "settings:read",
}

WRITE_PERMISSIONS = {
    "activities:write",
    "beneficiaries:write",
    "crowdfunding:write",
    "designations:write",
    "documents:write",
    "donations:write",
    "enquiries:write",
    "events:write",
    "expenses:write",
    "internships:write",
    "members:write",
    "news:write",
    "projects:write",
    "reports:write",
    "settings:write",
}

ADMIN_PERMISSIONS = {
    "cms:read",
    "cms:write",
    "settings:write",
}

ROLE_PERMISSIONS = {
    UserRole.ADMIN: READ_PERMISSIONS | WRITE_PERMISSIONS | ADMIN_PERMISSIONS,
    UserRole.STAFF: (READ_PERMISSIONS | WRITE_PERMISSIONS) - {"settings:write"},
    UserRole.GUEST: READ_PERMISSIONS,
}


def has_permission(role: UserRole, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, set())

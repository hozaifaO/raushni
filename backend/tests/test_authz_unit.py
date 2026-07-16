from __future__ import annotations

import os

import pytest
from fastapi import HTTPException

from app.api.dependencies.auth import get_current_role, require_service_key, require_write_access
from app.constants.roles import UserRole, normalize_role
from app.core.config import get_settings


pytestmark = pytest.mark.unit


def test_normalize_role_aliases() -> None:
    assert normalize_role("administrator") == UserRole.ADMIN
    assert normalize_role("viewer") == UserRole.GUEST
    assert normalize_role("unknown") == UserRole.GUEST


def test_require_write_access_blocks_guest() -> None:
    with pytest.raises(HTTPException) as exc:
        require_write_access(
            authorization=None,
            x_api_key="test-internal-api-key",
            x_user_role="GUEST",
        )
    assert exc.value.status_code == 403


def test_require_write_access_allows_staff() -> None:
    role = require_write_access(
        authorization=None,
        x_api_key="test-internal-api-key",
        x_user_role="STAFF",
    )
    assert role == UserRole.STAFF


def test_require_service_key_when_auth_required(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("REQUIRE_AUTH", "true")
    monkeypatch.setenv("INTERNAL_API_KEY", "test-internal-api-key")
    get_settings.cache_clear()
    try:
        with pytest.raises(HTTPException) as exc:
            require_service_key(x_api_key=None, authorization=None)
        assert exc.value.status_code == 401

        require_service_key(x_api_key="test-internal-api-key", authorization=None)
        role = get_current_role(
            authorization=None,
            x_api_key="test-internal-api-key",
            x_user_role="ADMIN",
        )
        assert role == UserRole.ADMIN
    finally:
        os.environ["REQUIRE_AUTH"] = "false"
        get_settings.cache_clear()

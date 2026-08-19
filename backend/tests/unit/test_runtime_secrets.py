from __future__ import annotations

import pytest

from app.core.config import (
    Settings,
    database_connect_args,
    is_placeholder_secret,
    normalize_database_url,
    strip_ssl_query_for_asyncpg,
)

pytestmark = [pytest.mark.unit]


def test_normalize_database_url_asyncpg() -> None:
    assert normalize_database_url("postgresql://u:p@h/db").startswith(
        "postgresql+asyncpg://"
    )
    assert normalize_database_url("postgres://u:p@h/db").startswith(
        "postgresql+asyncpg://"
    )


def test_sslmode_require_sets_connect_args() -> None:
    url = "postgresql+asyncpg://u:p@h/db?sslmode=require&channel_binding=require"
    assert database_connect_args(url) == {"ssl": True}
    stripped = strip_ssl_query_for_asyncpg(url)
    assert "sslmode" not in stripped
    assert "channel_binding" not in stripped


def test_sslmode_disable_no_connect_args() -> None:
    url = "postgresql+asyncpg://u:p@h/db?sslmode=disable"
    assert database_connect_args(url) == {}


def test_placeholder_secret_detection() -> None:
    assert is_placeholder_secret("")
    assert is_placeholder_secret("change-me")
    assert is_placeholder_secret("dev-internal-api-key-change-me")
    assert not is_placeholder_secret("a" * 32)


def test_validate_runtime_secrets_fails_in_production(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.setenv("REQUIRE_AUTH", "true")
    monkeypatch.setenv(
        "DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/raushni_backend"
    )
    monkeypatch.setenv("REDIS_URL", "redis://localhost:6379")
    monkeypatch.setenv("INTERNAL_API_KEY", "change-me")
    monkeypatch.setenv("CMS_API_TOKEN", "change-me")
    Settings.model_config["env_file"] = None  # type: ignore[index]
    from app.core.config import get_settings

    get_settings.cache_clear()
    settings = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/raushni_backend",
        REDIS_URL="redis://localhost:6379",
        ENVIRONMENT="production",
        REQUIRE_AUTH=True,
        INTERNAL_API_KEY="change-me",
        CMS_API_TOKEN="change-me",
    )
    with pytest.raises(RuntimeError, match="INTERNAL_API_KEY"):
        settings.validate_runtime_secrets()


def test_validate_runtime_secrets_ok_with_strong_keys() -> None:
    settings = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/raushni_backend",
        REDIS_URL="redis://localhost:6379",
        ENVIRONMENT="production",
        REQUIRE_AUTH=True,
        INTERNAL_API_KEY="x" * 32,
        CMS_API_TOKEN="y" * 32,
    )
    settings.validate_runtime_secrets()


def test_org_secrets_path_stub() -> None:
    settings = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/raushni_backend",
        REDIS_URL="redis://localhost:6379",
        ENVIRONMENT="staging",
    )
    assert settings.resolved_org_secrets_prefix == "/raushni/staging/orgs"
    assert (
        settings.org_secret_path("acme", "razorpay")
        == "/raushni/staging/orgs/acme/razorpay"
    )
    overridden = Settings(
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/raushni_backend",
        REDIS_URL="redis://localhost:6379",
        ENVIRONMENT="staging",
        ORG_SECRETS_PREFIX="/custom/orgs/",
    )
    assert overridden.resolved_org_secrets_prefix == "/custom/orgs"
    assert overridden.org_secret_path("demo") == "/custom/orgs/demo"

from __future__ import annotations

import logging
import re
from functools import lru_cache
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

_PLACEHOLDER_KEY_RE = re.compile(
    r"(change-?me|replace-|dev-internal-api-key|your-?secret|example)",
    re.IGNORECASE,
)


def normalize_database_url(url: str) -> str:
    """Ensure SQLAlchemy async drivers use the asyncpg dialect."""
    if url.startswith("postgresql+asyncpg://"):
        return url
    if url.startswith("postgres://"):
        return "postgresql+asyncpg://" + url.removeprefix("postgres://")
    if url.startswith("postgresql://"):
        return "postgresql+asyncpg://" + url.removeprefix("postgresql://")
    return url


def database_connect_args(url: str) -> dict[str, object]:
    """
    Derive asyncpg connect_args from sslmode / ssl query params.
    Hosted Postgres (Neon, RDS, etc.) typically needs sslmode=require.
    """
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    sslmode = (query.get("sslmode") or query.get("ssl") or [""])[0].lower()
    if sslmode in {"require", "verify-ca", "verify-full", "true", "1"}:
        return {"ssl": True}
    if sslmode in {"disable", "allow", "prefer", "false", "0", ""}:
        return {}
    return {}


def strip_ssl_query_for_asyncpg(url: str) -> str:
    """asyncpg prefers connect_args for SSL; drop driver-incompatible query params."""
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    # asyncpg rejects these as connect kwargs if left on the URL.
    for key in ("sslmode", "ssl", "channel_binding"):
        query.pop(key, None)
    flat = {k: v[0] for k, v in query.items()}
    return urlunparse(parsed._replace(query=urlencode(flat)))


def is_placeholder_secret(value: str) -> bool:
    trimmed = value.strip()
    if not trimmed:
        return True
    if len(trimmed) < 32 and _PLACEHOLDER_KEY_RE.search(trimmed):
        return True
    return bool(_PLACEHOLDER_KEY_RE.search(trimmed)) and len(trimmed) < 48


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/raushni_backend",
        alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://localhost:6379", alias="REDIS_URL")
    environment: str = Field(default="development", alias="ENVIRONMENT")
    require_auth: bool = Field(default=False, alias="REQUIRE_AUTH")
    internal_api_key: str = Field(default="", alias="INTERNAL_API_KEY")
    cms_api_token: str = Field(default="", alias="CMS_API_TOKEN")
    # Default TTL for intentional cache_* usage (rate limits use SlowAPI separately).
    redis_cache_ttl_seconds: int = Field(default=60, alias="REDIS_CACHE_TTL_SECONDS")
    # Default off so production pods do not migrate on boot; local compose sets true.
    alembic_auto_upgrade: bool = Field(default=False, alias="ALEMBIC_AUTO_UPGRADE")
    default_tenant_slug: str = Field(default="raushni", alias="DEFAULT_TENANT_SLUG")
    # Stub for future per-org Secrets Manager paths: /raushni/{env}/orgs/{slug}/…
    # See docs/MULTI_TENANT.md. Razorpay is not wired yet.
    org_secrets_prefix: str = Field(default="", alias="ORG_SECRETS_PREFIX")
    cors_origins: str = Field(
        default=(
            "http://localhost:3000,http://localhost:3001,"
            "https://www.raushni.com,https://raushni.vercel.app"
        ),
        alias="CORS_ORIGINS",
    )
    rate_limit_default: str = Field(default="120/minute", alias="RATE_LIMIT_DEFAULT")
    rate_limit_public_write: str = Field(
        default="10/minute", alias="RATE_LIMIT_PUBLIC_WRITE"
    )

    def cors_origin_list(self) -> list[str]:
        return [part.strip() for part in self.cors_origins.split(",") if part.strip()]

    @field_validator("database_url", mode="before")
    @classmethod
    def _normalize_db_url(cls, value: object) -> object:
        if isinstance(value, str):
            return normalize_database_url(value)
        return value

    @property
    def resolved_org_secrets_prefix(self) -> str:
        """Secrets Manager prefix for org-scoped credentials (no loader yet)."""
        if self.org_secrets_prefix.strip():
            return self.org_secrets_prefix.strip().rstrip("/")
        env = self.environment.strip().lower() or "development"
        return f"/raushni/{env}/orgs"

    def org_secret_path(self, slug: str, *parts: str) -> str:
        """Build `/raushni/{env}/orgs/{slug}/…` (stub; unused until per-org providers land)."""
        base = f"{self.resolved_org_secrets_prefix}/{slug.strip()}"
        if not parts:
            return base
        return base + "/" + "/".join(p.strip("/") for p in parts if p.strip())

    @property
    def async_database_url(self) -> str:
        return normalize_database_url(self.database_url)

    @property
    def async_database_url_for_engine(self) -> str:
        return strip_ssl_query_for_asyncpg(self.async_database_url)

    @property
    def database_connect_args(self) -> dict[str, object]:
        return database_connect_args(self.async_database_url)

    @property
    def is_production_like(self) -> bool:
        return (
            self.environment.lower() in {"production", "staging"} or self.require_auth
        )

    def validate_runtime_secrets(self) -> None:
        if not self.database_url.strip():
            raise RuntimeError("DATABASE_URL is required.")
        if not self.redis_url.strip():
            raise RuntimeError("REDIS_URL is required.")

        if not self.is_production_like:
            if not self.internal_api_key.strip():
                logger.warning(
                    "INTERNAL_API_KEY is empty (local DX). Set it for BFF/auth testing."
                )
            if not self.cms_api_token.strip():
                logger.warning(
                    "CMS_API_TOKEN is empty (local DX). CMS Content API calls may fail."
                )
            return

        if (
            is_placeholder_secret(self.internal_api_key)
            or len(self.internal_api_key.strip()) < 32
        ):
            raise RuntimeError(
                "INTERNAL_API_KEY must be set to a non-placeholder secret (min 32 chars) "
                "when REQUIRE_AUTH=true or ENVIRONMENT is production/staging."
            )
        if (
            is_placeholder_secret(self.cms_api_token)
            or len(self.cms_api_token.strip()) < 32
        ):
            raise RuntimeError(
                "CMS_API_TOKEN must be set to a non-placeholder secret (min 32 chars) "
                "when REQUIRE_AUTH=true or ENVIRONMENT is production/staging."
            )

    @model_validator(mode="after")
    def _warn_or_validate(self) -> Settings:
        # Soft validate at import for local; hard fail deferred to lifespan for clearer boot errors.
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()

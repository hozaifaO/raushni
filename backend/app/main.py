from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.db import check_db
from app.core.lifespan import lifespan
from app.core.rate_limit import limiter
from app.core.redis import check_redis
from app.core.telemetry import configure_telemetry
from app.services.document_service import DocumentService
from app.services.settings_service import UserAccountStore

APP_NAME = "Raushni NGO API"
APP_VERSION = "1.0.0"


def create_app() -> FastAPI:
    settings = get_settings()
    production_like = settings.is_production_like
    app = FastAPI(
        title=APP_NAME,
        version=APP_VERSION,
        lifespan=lifespan,
        docs_url=None if production_like else "/docs",
        redoc_url=None if production_like else "/redoc",
        openapi_url=None if production_like else "/openapi.json",
    )
    configure_telemetry(app)
    # Staff user mirror only (not auth SoT). Domain services use Depends(get_db).
    app.state.user_account_store = UserAccountStore()
    app.state.document_service = DocumentService()
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    origins = settings.cors_origin_list()
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.get("/health")
    @limiter.exempt
    async def health() -> dict[str, Any]:
        return {
            "status": "healthy",
            "service": "raushni-backend",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": APP_VERSION,
        }

    @app.get("/health/ready")
    @limiter.exempt
    async def health_ready(response: Response) -> dict[str, Any]:
        db_ok = await check_db()
        redis_ok = await check_redis()
        ready = db_ok
        if not ready:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "ready"
            if ready and redis_ok
            else ("degraded" if ready else "unavailable"),
            "database": "ok" if db_ok else "error",
            "redis": "ok" if redis_ok else "error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": APP_VERSION,
        }

    @app.get("/api")
    @limiter.limit(settings.rate_limit_default)
    async def api_root(request: Request, response: Response) -> dict[str, Any]:
        if production_like:
            return {"name": APP_NAME, "version": APP_VERSION, "status": "running"}
        return {
            "name": APP_NAME,
            "version": APP_VERSION,
            "status": "running",
            "endpoints": [
                "GET /health",
                "GET /health/ready",
                "GET /api",
                "GET /api/v1/landing",
                "POST /api/v1/donations/public",
                "POST /api/v1/enquiries/public",
                "POST /api/v1/internships/applications/public",
            ],
        }

    app.include_router(api_router)

    return app


app = create_app()


def main() -> None:
    """Entry point for `poetry run raushni`."""
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()

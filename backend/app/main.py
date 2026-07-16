from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI, Response, status
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.db import check_db
from app.core.lifespan import lifespan
from app.core.redis import check_redis
from app.core.telemetry import configure_telemetry
from app.services.document_service import DocumentService
from app.services.settings_service import UserAccountStore


APP_NAME = "Raushni NGO API"
APP_VERSION = "1.0.0"


def create_app() -> FastAPI:
    app = FastAPI(title=APP_NAME, version=APP_VERSION, lifespan=lifespan)
    configure_telemetry(app)
    # Staff user mirror only (not auth SoT). Domain services use Depends(get_db).
    app.state.user_account_store = UserAccountStore()
    app.state.document_service = DocumentService()

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health")
    async def health() -> dict[str, Any]:
        return {
            "status": "healthy",
            "service": "raushni-backend",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": APP_VERSION,
        }

    @app.get("/health/ready")
    async def health_ready(response: Response) -> dict[str, Any]:
        db_ok = await check_db()
        redis_ok = await check_redis()
        ready = db_ok
        if not ready:
            response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {
            "status": "ready" if ready and redis_ok else ("degraded" if ready else "unavailable"),
            "database": "ok" if db_ok else "error",
            "redis": "ok" if redis_ok else "error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "version": APP_VERSION,
        }

    @app.get("/api")
    async def api_root() -> dict[str, Any]:
        return {
            "name": APP_NAME,
            "version": APP_VERSION,
            "status": "running",
            "endpoints": [
                "GET /health",
                "GET /health/ready",
                "GET /api",
                "GET /api/v1/dashboard/status",
                "GET /api/v1/account/profile",
                "GET /api/v1/settings",
                "GET /api/v1/landing",
                "GET /api/v1/activities",
                "POST /api/v1/activities",
                "GET /api/v1/beneficiaries",
                "POST /api/v1/beneficiaries",
                "GET /api/v1/donations",
                "POST /api/v1/donations",
                "POST /api/v1/donations/{id}/checkout",
                "POST /api/v1/webhooks/stripe",
                "GET /api/v1/crowdfunding",
                "POST /api/v1/crowdfunding",
                "POST /api/v1/crowdfunding/{id}/donations",
                "GET /api/v1/designations",
                "POST /api/v1/designations",
                "GET /api/v1/internships",
                "POST /api/v1/internships/applications/public",
                "POST /api/v1/internships/applications/{id}/certificate",
                "GET /api/v1/events",
                "POST /api/v1/events",
                "GET /api/v1/expenses",
                "POST /api/v1/expenses",
                "GET /api/v1/news",
                "POST /api/v1/news",
                "GET /api/v1/members",
                "POST /api/v1/members",
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

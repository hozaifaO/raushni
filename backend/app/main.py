from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.services.designation_service import DesignationService
from app.services.donation_service import DonationService
from app.services.internship_service import InternshipService
from app.services.document_service import DocumentService
from app.services.member_service import MemberService
from app.services.project_service import ProjectService
from app.services.settings_service import SettingsService


APP_NAME = "Raushni NGO API"
APP_VERSION = "1.0.0"


def create_app() -> FastAPI:
    app = FastAPI(title=APP_NAME, version=APP_VERSION)
    app.state.member_service = MemberService()
    app.state.designation_service = DesignationService()
    app.state.donation_service = DonationService()
    app.state.internship_service = InternshipService()
    app.state.document_service = DocumentService()
    app.state.settings_service = SettingsService()
    app.state.project_service = ProjectService()

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

    @app.get("/api")
    async def api_root() -> dict[str, Any]:
        return {
            "name": APP_NAME,
            "version": APP_VERSION,
            "status": "running",
            "endpoints": [
                "GET /health",
                "GET /api",
                "GET /api/v1/dashboard/status",
                "GET /api/v1/account/profile",
                "GET /api/v1/settings",
                "GET /api/v1/landing",
                "GET /api/v1/donations",
                "POST /api/v1/donations",
                "GET /api/v1/designations",
                "POST /api/v1/designations",
                "GET /api/v1/internships",
                "POST /api/v1/internships/applications/public",
                "POST /api/v1/internships/applications/{id}/certificate",
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

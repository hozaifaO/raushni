from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints import landing, members


api_router = APIRouter(prefix="/api/v1")
api_router.include_router(landing.router)
api_router.include_router(members.router)

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies.auth import require_write_access
from app.api.dependencies.services import get_project_service
from app.schemas.project import Project, ProjectCreate, ProjectListResponse, ProjectStatus, ProjectUpdate
from app.services.project_service import ProjectNotFoundError, ProjectService


router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse)
async def list_projects(
    search: str | None = Query(default=None, max_length=80),
    status_filter: ProjectStatus | None = None,
    service: ProjectService = Depends(get_project_service),
) -> ProjectListResponse:
    return await service.list_projects(search=search, status_filter=status_filter)


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    payload: ProjectCreate,
    _role: object = Depends(require_write_access),
    service: ProjectService = Depends(get_project_service),
) -> Project:
    return await service.create_project(payload)


@router.get("/{project_id}", response_model=Project)
async def get_project(
    project_id: UUID,
    service: ProjectService = Depends(get_project_service),
) -> Project:
    try:
        return await service.get_project(project_id)
    except ProjectNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{project_id}", response_model=Project)
async def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    _role: object = Depends(require_write_access),
    service: ProjectService = Depends(get_project_service),
) -> Project:
    try:
        return await service.update_project(project_id, payload)
    except ProjectNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: UUID,
    _role: object = Depends(require_write_access),
    service: ProjectService = Depends(get_project_service),
) -> Response:
    try:
        await service.delete_project(project_id)
    except ProjectNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

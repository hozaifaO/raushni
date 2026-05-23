from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.dependencies.auth import require_write_access
from app.schemas.project import Project, ProjectCreate, ProjectListResponse, ProjectStatus, ProjectUpdate
from app.services.project_service import ProjectNotFoundError, ProjectService


router = APIRouter(prefix="/projects", tags=["projects"])


def get_project_service(request: Request) -> ProjectService:
    return request.app.state.project_service


@router.get("", response_model=ProjectListResponse)
def list_projects(
    search: str | None = None,
    status_filter: ProjectStatus | None = None,
    service: ProjectService = Depends(get_project_service),
) -> ProjectListResponse:
    return service.list_projects(search=search, status_filter=status_filter)


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    _role: object = Depends(require_write_access),
    service: ProjectService = Depends(get_project_service),
) -> Project:
    return service.create_project(payload)


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: UUID, service: ProjectService = Depends(get_project_service)) -> Project:
    try:
        return service.get_project(project_id)
    except ProjectNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch("/{project_id}", response_model=Project)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    _role: object = Depends(require_write_access),
    service: ProjectService = Depends(get_project_service),
) -> Project:
    try:
        return service.update_project(project_id, payload)
    except ProjectNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    _role: object = Depends(require_write_access),
    service: ProjectService = Depends(get_project_service),
) -> Response:
    try:
        service.delete_project(project_id)
    except ProjectNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    return Response(status_code=status.HTTP_204_NO_CONTENT)

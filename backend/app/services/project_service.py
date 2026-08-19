from __future__ import annotations

from uuid import UUID

from app.repositories.project_repository import ProjectRepository
from app.schemas.project import (
    Project,
    ProjectCreate,
    ProjectListResponse,
    ProjectStatus,
    ProjectUpdate,
)


class ProjectNotFoundError(LookupError):
    pass


class ProjectService:
    def __init__(self, repository: ProjectRepository) -> None:
        self._repository = repository

    async def list_projects(
        self,
        *,
        search: str | None = None,
        status_filter: ProjectStatus | None = None,
    ) -> ProjectListResponse:
        (
            items,
            total,
            proposed,
            active,
            completed,
            total_budget,
            total_beneficiaries,
        ) = await self._repository.list(
            search=search,
            status_filter=status_filter,
        )
        return ProjectListResponse(
            items=[Project.model_validate(item) for item in items],
            total=total,
            proposed=proposed,
            active=active,
            completed=completed,
            total_budget=total_budget,
            total_beneficiaries=total_beneficiaries,
        )

    async def create_project(self, payload: ProjectCreate) -> Project:
        project = await self._repository.create(payload)
        return Project.model_validate(project)

    async def get_project(self, project_id: UUID) -> Project:
        project = await self._repository.get(project_id)
        if project is None:
            raise ProjectNotFoundError(f"Project {project_id} was not found")
        return Project.model_validate(project)

    async def update_project(self, project_id: UUID, payload: ProjectUpdate) -> Project:
        project = await self._repository.update(project_id, payload)
        if project is None:
            raise ProjectNotFoundError(f"Project {project_id} was not found")
        return Project.model_validate(project)

    async def delete_project(self, project_id: UUID) -> None:
        deleted = await self._repository.delete(project_id)
        if not deleted:
            raise ProjectNotFoundError(f"Project {project_id} was not found")

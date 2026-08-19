from __future__ import annotations

from uuid import UUID

from app.repositories.designation_repository import DesignationRepository
from app.schemas.designation import (
    Designation,
    DesignationCreate,
    DesignationListResponse,
    DesignationStatus,
    DesignationUpdate,
)


class DesignationNotFoundError(LookupError):
    pass


class DesignationConflictError(ValueError):
    pass


class DesignationService:
    def __init__(self, repository: DesignationRepository) -> None:
        self._repository = repository

    async def list_designations(
        self,
        *,
        search: str | None = None,
        status_filter: DesignationStatus | None = None,
        department: str | None = None,
    ) -> DesignationListResponse:
        (
            items,
            total,
            active,
            inactive,
            archived,
            assigned_staff,
            open_slots,
        ) = await self._repository.list(
            search=search,
            status_filter=status_filter,
            department=department,
        )
        return DesignationListResponse(
            items=[Designation.model_validate(item) for item in items],
            total=total,
            active=active,
            inactive=inactive,
            archived=archived,
            assigned_staff=assigned_staff,
            open_slots=open_slots,
        )

    async def create_designation(self, payload: DesignationCreate) -> Designation:
        existing = await self._repository.get_by_code(payload.code)
        if existing is not None:
            raise DesignationConflictError(
                f"Designation code {payload.code} already exists"
            )
        designation = await self._repository.create(payload)
        return Designation.model_validate(designation)

    async def get_designation(self, designation_id: UUID) -> Designation:
        designation = await self._repository.get(designation_id)
        if designation is None:
            raise DesignationNotFoundError(
                f"Designation {designation_id} was not found"
            )
        return Designation.model_validate(designation)

    async def update_designation(
        self, designation_id: UUID, payload: DesignationUpdate
    ) -> Designation:
        if payload.code is not None:
            existing = await self._repository.get_by_code(
                payload.code, ignore_id=designation_id
            )
            if existing is not None:
                raise DesignationConflictError(
                    f"Designation code {payload.code} already exists"
                )
        designation = await self._repository.update(designation_id, payload)
        if designation is None:
            raise DesignationNotFoundError(
                f"Designation {designation_id} was not found"
            )
        return Designation.model_validate(designation)

    async def delete_designation(self, designation_id: UUID) -> None:
        deleted = await self._repository.delete(designation_id)
        if not deleted:
            raise DesignationNotFoundError(
                f"Designation {designation_id} was not found"
            )

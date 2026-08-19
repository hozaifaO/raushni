from __future__ import annotations

from collections.abc import Callable
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.api.dependencies.auth import require_write_access
from app.schemas.simple_record import (
    SimpleRecord,
    SimpleRecordCreate,
    SimpleRecordListResponse,
    SimpleRecordStatus,
    SimpleRecordUpdate,
)
from app.services.simple_crud_service import (
    SimpleCrudService,
    SimpleRecordNotFoundError,
)


def build_simple_crud_router(
    *,
    prefix: str,
    tag: str,
    get_service: Callable[..., SimpleCrudService],
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])

    @router.get("", response_model=SimpleRecordListResponse)
    async def list_records(
        search: str | None = Query(default=None, max_length=80),
        status_filter: SimpleRecordStatus | None = None,
        service: SimpleCrudService = Depends(get_service),
    ) -> SimpleRecordListResponse:
        return await service.list_records(search=search, status_filter=status_filter)

    @router.post("", response_model=SimpleRecord, status_code=status.HTTP_201_CREATED)
    async def create_record(
        payload: SimpleRecordCreate,
        _role: object = Depends(require_write_access),
        service: SimpleCrudService = Depends(get_service),
    ) -> SimpleRecord:
        return await service.create_record(payload)

    @router.get("/{record_id}", response_model=SimpleRecord)
    async def get_record(
        record_id: UUID,
        service: SimpleCrudService = Depends(get_service),
    ) -> SimpleRecord:
        try:
            return await service.get_record(record_id)
        except SimpleRecordNotFoundError as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
            ) from exc

    @router.patch("/{record_id}", response_model=SimpleRecord)
    async def update_record(
        record_id: UUID,
        payload: SimpleRecordUpdate,
        _role: object = Depends(require_write_access),
        service: SimpleCrudService = Depends(get_service),
    ) -> SimpleRecord:
        try:
            return await service.update_record(record_id, payload)
        except SimpleRecordNotFoundError as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
            ) from exc

    @router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
    async def delete_record(
        record_id: UUID,
        _role: object = Depends(require_write_access),
        service: SimpleCrudService = Depends(get_service),
    ) -> Response:
        try:
            await service.delete_record(record_id)
        except SimpleRecordNotFoundError as exc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)
            ) from exc
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return router

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.api.dependencies.auth import require_write_access
from app.schemas.simple_record import (
    SimpleRecord,
    SimpleRecordCreate,
    SimpleRecordListResponse,
    SimpleRecordStatus,
    SimpleRecordUpdate,
)
from app.services.simple_crud_service import SimpleCrudService, SimpleRecordNotFoundError


def build_simple_crud_router(*, prefix: str, tag: str, state_key: str) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])

    def get_service(request: Request) -> SimpleCrudService:
        return getattr(request.app.state, state_key)

    @router.get("", response_model=SimpleRecordListResponse)
    def list_records(
        search: str | None = None,
        status_filter: SimpleRecordStatus | None = None,
        service: SimpleCrudService = Depends(get_service),
    ) -> SimpleRecordListResponse:
        return service.list_records(search=search, status_filter=status_filter)

    @router.post("", response_model=SimpleRecord, status_code=status.HTTP_201_CREATED)
    def create_record(
        payload: SimpleRecordCreate,
        _role: object = Depends(require_write_access),
        service: SimpleCrudService = Depends(get_service),
    ) -> SimpleRecord:
        return service.create_record(payload)

    @router.get("/{record_id}", response_model=SimpleRecord)
    def get_record(record_id: UUID, service: SimpleCrudService = Depends(get_service)) -> SimpleRecord:
        try:
            return service.get_record(record_id)
        except SimpleRecordNotFoundError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    @router.patch("/{record_id}", response_model=SimpleRecord)
    def update_record(
        record_id: UUID,
        payload: SimpleRecordUpdate,
        _role: object = Depends(require_write_access),
        service: SimpleCrudService = Depends(get_service),
    ) -> SimpleRecord:
        try:
            return service.update_record(record_id, payload)
        except SimpleRecordNotFoundError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    @router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_record(
        record_id: UUID,
        _role: object = Depends(require_write_access),
        service: SimpleCrudService = Depends(get_service),
    ) -> Response:
        try:
            service.delete_record(record_id)
        except SimpleRecordNotFoundError as exc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return router

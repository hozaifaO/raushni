from __future__ import annotations

from uuid import UUID

from app.repositories.simple_record_repository import SimpleRecordRepository
from app.schemas.simple_record import (
    SimpleRecord,
    SimpleRecordCreate,
    SimpleRecordListResponse,
    SimpleRecordStatus,
    SimpleRecordUpdate,
)


class SimpleRecordNotFoundError(LookupError):
    pass


class SimpleCrudService:
    def __init__(self, repository: SimpleRecordRepository) -> None:
        self._repository = repository
        self.module = repository.module

    async def list_records(
        self,
        *,
        search: str | None = None,
        status_filter: SimpleRecordStatus | None = None,
    ) -> SimpleRecordListResponse:
        items, total, active, published, archived = await self._repository.list(
            search=search,
            status_filter=status_filter,
        )
        return SimpleRecordListResponse(
            items=[SimpleRecord.model_validate(item) for item in items],
            total=total,
            active=active,
            published=published,
            archived=archived,
        )

    async def create_record(self, payload: SimpleRecordCreate) -> SimpleRecord:
        record = await self._repository.create(payload)
        return SimpleRecord.model_validate(record)

    async def get_record(self, record_id: UUID) -> SimpleRecord:
        record = await self._repository.get(record_id)
        if record is None:
            raise SimpleRecordNotFoundError(f"{self.module} record {record_id} was not found")
        return SimpleRecord.model_validate(record)

    async def update_record(self, record_id: UUID, payload: SimpleRecordUpdate) -> SimpleRecord:
        record = await self._repository.update(record_id, payload)
        if record is None:
            raise SimpleRecordNotFoundError(f"{self.module} record {record_id} was not found")
        return SimpleRecord.model_validate(record)

    async def delete_record(self, record_id: UUID) -> None:
        deleted = await self._repository.delete(record_id)
        if not deleted:
            raise SimpleRecordNotFoundError(f"{self.module} record {record_id} was not found")

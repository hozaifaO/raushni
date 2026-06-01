from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

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
    def __init__(self, module: str) -> None:
        self.module = module
        self._records: dict[UUID, SimpleRecord] = {}

    def list_records(
        self,
        *,
        search: str | None = None,
        status_filter: SimpleRecordStatus | None = None,
    ) -> SimpleRecordListResponse:
        items = list(self._records.values())
        if search:
            query = search.strip().lower()
            items = [
                record
                for record in items
                if query in record.title.lower()
                or query in record.category.lower()
                or query in record.summary.lower()
                or (record.contact_name is not None and query in record.contact_name.lower())
            ]
        if status_filter is not None:
            items = [record for record in items if record.status == status_filter]
        items.sort(key=lambda record: (record.record_date, record.title.lower()), reverse=True)
        all_records = list(self._records.values())
        return SimpleRecordListResponse(
            items=items,
            total=len(all_records),
            active=sum(1 for record in all_records if record.status == SimpleRecordStatus.ACTIVE),
            published=sum(1 for record in all_records if record.status == SimpleRecordStatus.PUBLISHED),
            archived=sum(1 for record in all_records if record.status == SimpleRecordStatus.ARCHIVED),
        )

    def create_record(self, payload: SimpleRecordCreate) -> SimpleRecord:
        now = datetime.now(timezone.utc)
        record = SimpleRecord(
            id=uuid4(),
            module=self.module,
            created_at=now,
            updated_at=now,
            **payload.model_dump(),
        )
        self._records[record.id] = record
        return record

    def get_record(self, record_id: UUID) -> SimpleRecord:
        try:
            return self._records[record_id]
        except KeyError as exc:
            raise SimpleRecordNotFoundError(f"{self.module} record {record_id} was not found") from exc

    def update_record(self, record_id: UUID, payload: SimpleRecordUpdate) -> SimpleRecord:
        record = self.get_record(record_id)
        updated = record.model_copy(
            update={
                **payload.model_dump(exclude_unset=True),
                "updated_at": datetime.now(timezone.utc),
            },
        )
        self._records[record_id] = updated
        return updated

    def delete_record(self, record_id: UUID) -> None:
        self.get_record(record_id)
        del self._records[record_id]

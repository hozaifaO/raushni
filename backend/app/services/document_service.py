from __future__ import annotations

from app.services.cms_template_service import DEFAULT_DOCUMENT_TEMPLATES, get_document_template


class DocumentService:
    def list_templates(self) -> list[dict[str, object]]:
        return [get_document_template(key) | {"key": key} for key in DEFAULT_DOCUMENT_TEMPLATES]

    def get_template(self, key: str) -> dict[str, object]:
        return get_document_template(key) | {"key": key}

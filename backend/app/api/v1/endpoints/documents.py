from __future__ import annotations

from fastapi import APIRouter, Request

from app.services.document_service import DocumentService


router = APIRouter(prefix="/documents", tags=["documents"])


def get_document_service(request: Request) -> DocumentService:
    service = getattr(request.app.state, "document_service", None)
    if service is None:
      service = DocumentService()
      request.app.state.document_service = service
    return service


@router.get("/templates")
def list_document_templates(request: Request) -> list[dict[str, object]]:
    return get_document_service(request).list_templates()


@router.get("/templates/{key}")
def get_document_template(key: str, request: Request) -> dict[str, object]:
    return get_document_service(request).get_template(key)

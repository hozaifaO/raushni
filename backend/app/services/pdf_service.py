"""Server-side PDF generation — stub until a real renderer is chosen.

Today the product uses HTML + browser print + QR SVGs. When you need
server PDFs (email attachments, archival), implement `PdfService.render`
and optionally add reportlab / weasyprint / a document microservice.

See also: services/document_generator/ (standalone stub service).
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any


class PdfDocumentKind(str, Enum):
    DONATION_RECEIPT = "donation_receipt"
    MEMBER_ID_CARD = "member_id_card"
    APPOINTMENT_LETTER = "appointment_letter"
    INTERNSHIP_CERTIFICATE = "internship_certificate"


@dataclass(frozen=True)
class PdfRenderRequest:
    kind: PdfDocumentKind
    data: dict[str, Any]
    template_key: str | None = None


@dataclass(frozen=True)
class PdfRenderResult:
    content_type: str
    body: bytes
    filename: str


class PdfNotImplementedError(RuntimeError):
    pass


class PdfService:
    """Application-facing PDF API. Keep ReportLab/etc. behind this boundary."""

    async def render(self, request: PdfRenderRequest) -> PdfRenderResult:
        raise PdfNotImplementedError(
            f"PDF render for {request.kind.value!r} is not implemented yet. "
            "HTML print paths remain the production path."
        )


def get_pdf_service() -> PdfService:
    return PdfService()

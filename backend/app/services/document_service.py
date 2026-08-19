from __future__ import annotations

from hashlib import sha256
from io import BytesIO

try:
    import qrcode
    import qrcode.image.svg
except ModuleNotFoundError:
    qrcode = None

from app.services.cms_template_service import (
    DEFAULT_DOCUMENT_TEMPLATES,
    get_document_template,
)


class DocumentService:
    def list_templates(self) -> list[dict[str, object]]:
        return [
            get_document_template(key) | {"key": key}
            for key in DEFAULT_DOCUMENT_TEMPLATES
        ]

    def get_template(self, key: str) -> dict[str, object]:
        return get_document_template(key) | {"key": key}

    def make_qr_svg(self, value: str) -> str:
        if qrcode is not None:
            image = qrcode.make(value, image_factory=qrcode.image.svg.SvgPathImage)
            buffer = BytesIO()
            image.save(buffer)
            return buffer.getvalue().decode("utf-8")
        return self._fallback_qr_svg(value)

    def _fallback_qr_svg(self, value: str) -> str:
        digest = sha256(value.encode("utf-8")).digest()
        cells = 21
        size = 168
        cell = size // cells
        rects = [
            f'<rect x="0" y="0" width="{size}" height="{size}" fill="white"/>',
            f'<rect x="0" y="0" width="{size}" height="{size}" fill="none" stroke="#111827" stroke-width="4"/>',
        ]
        for y in range(cells):
            for x in range(cells):
                finder = (
                    (x < 7 and y < 7)
                    or (x >= cells - 7 and y < 7)
                    or (x < 7 and y >= cells - 7)
                )
                byte = digest[(x + y * cells) % len(digest)]
                if finder or ((byte >> (x % 8)) & 1):
                    rects.append(
                        f'<rect x="{x * cell}" y="{y * cell}" width="{cell}" height="{cell}" fill="#111827"/>'
                    )
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}" role="img" aria-label="Document verification QR code">{"".join(rects)}</svg>'

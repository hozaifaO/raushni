from __future__ import annotations

import json
import os
from collections.abc import Mapping
from functools import lru_cache
from html import escape
from string import Template
from urllib.parse import urlencode
from urllib.request import Request, urlopen


DEFAULT_DOCUMENT_TEMPLATES: dict[str, dict[str, object]] = {
    "donation-receipt": {
        "title": "Official Receipt",
        "legalNote": "Registered under Section 8 of Companies Act, 2013 | 12A & 80G Tax Exempted",
        "thankYouNote": "Thank you for supporting Raushni.",
        "signatoryLabel": "Authorized signatory",
    },
    "internship-completion-certificate": {
        "title": "Certificate of Completion",
        "subtitle": "This certificate is proudly awarded to",
        "body": (
            "for successfully completing <strong>${program_title}</strong> in the "
            "<strong>${track}</strong> track with professional conduct, practical contribution, "
            "and learning commitment."
        ),
        "footer": "This certificate can be authenticated using the QR code or verification URL.",
        "signatoryLabel": "Authorized Signatory",
        "htmlTemplate": "",
    },
}


def render_template(value: str, context: Mapping[str, object]) -> str:
    safe_context = {key: escape(str(item)) for key, item in context.items()}
    return Template(value).safe_substitute(safe_context)


def _cms_api_token() -> str:
    return (os.getenv("CMS_API_TOKEN") or os.getenv("STRAPI_CMS_API_TOKEN") or "").strip()


@lru_cache(maxsize=32)
def get_document_template(key: str) -> dict[str, object]:
    fallback = DEFAULT_DOCUMENT_TEMPLATES.get(key, {})
    base_url = os.getenv("CMS_INTERNAL_URL") or os.getenv("NEXT_PUBLIC_CMS_URL") or "http://strapi:1337"
    query = urlencode({"filters[key][$eq]": key, "populate": "*"})
    url = f"{base_url.rstrip('/')}/api/document-templates?{query}"
    headers = {"Accept": "application/json"}
    token = _cms_api_token()
    if token:
        headers["X-CMS-API-Key"] = token
    try:
        request = Request(url, headers=headers)
        with urlopen(request, timeout=2) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception:
        return fallback

    attrs = (payload.get("data") or [{}])[0].get("attributes") or {}
    return {**fallback, **attrs}

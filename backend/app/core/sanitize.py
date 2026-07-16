from __future__ import annotations

import re
from typing import Annotated, Any

from pydantic import BeforeValidator

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_HTML_TAGS = re.compile(r"<[^>]+>")
_COLLAPSE_WS = re.compile(r"[ \t\f\v]+")


def reject_control_chars(value: str) -> str:
    """Strip NUL and other C0 control characters (keep \\n / \\r / \\t for later collapse)."""
    return _CONTROL_CHARS.sub("", value)


def strip_and_collapse_ws(value: str) -> str:
    """Trim ends and collapse runs of horizontal whitespace; preserve newlines."""
    cleaned = reject_control_chars(value)
    lines = [_COLLAPSE_WS.sub(" ", line).strip() for line in cleaned.replace("\r\n", "\n").split("\n")]
    return "\n".join(line for line in lines if line or len(lines) == 1).strip()


def strip_html_tags(value: str) -> str:
    """Remove HTML tags from free-text that may later be rendered."""
    return _HTML_TAGS.sub("", value)


def _sanitize_plain(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    return strip_and_collapse_ws(value)


def _sanitize_free_text(value: Any) -> Any:
    if not isinstance(value, str):
        return value
    return strip_and_collapse_ws(strip_html_tags(value))


def _sanitize_optional_plain(value: Any) -> Any:
    if value is None:
        return None
    return _sanitize_plain(value)


def _sanitize_optional_free_text(value: Any) -> Any:
    if value is None:
        return None
    return _sanitize_free_text(value)


SanitizedStr = Annotated[str, BeforeValidator(_sanitize_plain)]
OptionalSanitizedStr = Annotated[str | None, BeforeValidator(_sanitize_optional_plain)]
FreeTextSanitizedStr = Annotated[str, BeforeValidator(_sanitize_free_text)]
OptionalFreeTextSanitizedStr = Annotated[str | None, BeforeValidator(_sanitize_optional_free_text)]

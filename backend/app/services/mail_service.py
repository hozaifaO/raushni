"""Outbound email — stub until SMTP (or provider) is wired.

Implement `MailService.send`, then install optional Poetry group:
  poetry install --with mail   # aiosmtplib

Env (when implementing): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_FROM
"""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class MailMessage:
    to: str
    subject: str
    body_text: str
    body_html: str | None = None


class MailNotConfiguredError(RuntimeError):
    pass


class MailService:
    """Application-facing mail API. Callers should not import SMTP libs directly."""

    def configured(self) -> bool:
        return bool(os.getenv("SMTP_HOST", "").strip())

    async def send(self, message: MailMessage) -> None:
        if not self.configured():
            raise MailNotConfiguredError(
                "Mail is not configured. Set SMTP_HOST (and SMTP_* / MAIL_FROM), "
                "then implement MailService.send."
            )
        raise NotImplementedError(
            "MailService.send is a stub. Wire SMTP/provider here when ready."
        )


def get_mail_service() -> MailService:
    return MailService()

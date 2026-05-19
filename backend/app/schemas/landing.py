from __future__ import annotations

from pydantic import BaseModel


class LandingSection(BaseModel):
    title: str
    body: str


class LandingContact(BaseModel):
    address: str
    phone: str
    email: str


class LandingContent(BaseModel):
    organization: str
    vision: str
    mission: str
    objectives: list[str]
    sections: list[LandingSection]
    contact: LandingContact
    assets: dict[str, str]

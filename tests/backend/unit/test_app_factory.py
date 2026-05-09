from __future__ import annotations

import pytest
from fastapi import FastAPI

from app.main import APP_NAME, APP_VERSION, create_app


pytestmark = pytest.mark.unit


def test_create_app_returns_configured_fastapi_instance() -> None:
    test_app = create_app()

    assert isinstance(test_app, FastAPI)
    assert test_app.title == APP_NAME
    assert test_app.version == APP_VERSION


def test_create_app_registers_public_routes() -> None:
    test_app = create_app()
    routes = {route.path for route in test_app.routes}

    assert "/health" in routes
    assert "/api" in routes
    assert "/docs" in routes
    assert "/openapi.json" in routes


def test_create_app_instances_do_not_share_router_state() -> None:
    first = create_app()
    second = create_app()

    assert first is not second
    assert len(first.routes) == len(second.routes)

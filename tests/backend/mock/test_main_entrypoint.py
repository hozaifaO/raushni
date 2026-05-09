from __future__ import annotations

from unittest.mock import patch

import pytest

from app.main import main


pytestmark = pytest.mark.mock


def test_main_starts_uvicorn_with_expected_app_target() -> None:
    with patch("uvicorn.run") as run:
        main()

    run.assert_called_once_with(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )

"""Donation integrity: anonymous flag, receipt freeze, status events.

Revision ID: 0005_donations_integrity
Revises: 0004_internships_settings
Create Date: 2026-07-15

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0005_donations_integrity"
down_revision: Union[str, None] = "0004_internships_settings"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "donations",
        sa.Column(
            "is_anonymous",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "donations",
        sa.Column("receipt_issued_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.add_column(
        "donations",
        sa.Column("receipt_snapshot", postgresql.JSONB(), nullable=True),
    )

    op.create_table(
        "donation_status_events",
        sa.Column(
            "id",
            postgresql.UUID(as_uuid=True),
            primary_key=True,
            server_default=sa.text("gen_random_uuid()"),
        ),
        sa.Column("donation_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("from_status", sa.String(length=20), nullable=True),
        sa.Column("to_status", sa.String(length=20), nullable=False),
        sa.Column("transaction_reference", sa.String(length=120), nullable=True),
        sa.Column("actor_role", sa.String(length=40), nullable=True),
        sa.Column("actor_email", sa.String(length=255), nullable=True),
        sa.Column("note", sa.String(length=500), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("NOW()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["donation_id"],
            ["donations.id"],
            name="fk_donation_status_events_donation_id",
            ondelete="CASCADE",
        ),
    )
    op.create_index(
        "ix_donation_status_events_donation_id",
        "donation_status_events",
        ["donation_id"],
    )
    op.create_index(
        "ix_donation_status_events_created_at",
        "donation_status_events",
        ["created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_donation_status_events_created_at", table_name="donation_status_events")
    op.drop_index("ix_donation_status_events_donation_id", table_name="donation_status_events")
    op.drop_table("donation_status_events")
    op.drop_column("donations", "receipt_snapshot")
    op.drop_column("donations", "receipt_issued_at")
    op.drop_column("donations", "is_anonymous")

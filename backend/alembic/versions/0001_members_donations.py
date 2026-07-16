"""Create API-aligned members, donations, and receipt_counters tables.

Revision ID: 0001_members_donations
Revises:
Create Date: 2026-07-15

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0001_members_donations"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')

    op.create_table(
        "members",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("role", sa.String(length=80), nullable=False, server_default="Volunteer"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("joined_on", sa.Date(), nullable=False),
        sa.Column("address", sa.String(length=240), nullable=True),
        sa.Column("emergency_contact", sa.String(length=120), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    )
    op.create_index(
        "uq_members_email_not_null",
        "members",
        ["email"],
        unique=True,
        postgresql_where=sa.text("email IS NOT NULL"),
    )
    op.create_index("ix_members_status", "members", ["status"])

    op.create_table(
        "receipt_counters",
        sa.Column("year", sa.Integer(), primary_key=True),
        sa.Column("last_value", sa.Integer(), nullable=False, server_default="1000"),
    )

    op.create_table(
        "donations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("donor_name", sa.String(length=140), nullable=False),
        sa.Column("donor_email", sa.String(length=255), nullable=True),
        sa.Column("donor_phone", sa.String(length=20), nullable=False),
        sa.Column("donor_address", sa.String(length=260), nullable=True),
        sa.Column("donor_pan", sa.String(length=20), nullable=True),
        sa.Column("donor_type", sa.String(length=40), nullable=False, server_default="individual"),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("purpose", sa.String(length=40), nullable=False, server_default="general"),
        sa.Column("payment_method", sa.String(length=40), nullable=False, server_default="upi"),
        sa.Column("payment_status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("transaction_reference", sa.String(length=120), nullable=True),
        sa.Column("donation_date", sa.Date(), nullable=False),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("gateway_provider", sa.String(length=40), nullable=True),
        sa.Column("gateway_session_id", sa.String(length=160), nullable=True),
        sa.Column("gateway_payment_intent", sa.String(length=160), nullable=True),
        sa.Column("checkout_url", sa.String(length=500), nullable=True),
        sa.Column("receipt_number", sa.String(length=50), nullable=False),
        sa.Column("receipt_issued", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.UniqueConstraint("receipt_number", name="uq_donations_receipt_number"),
    )
    op.create_index("ix_donations_payment_status", "donations", ["payment_status"])
    op.create_index("ix_donations_gateway_session_id", "donations", ["gateway_session_id"])


def downgrade() -> None:
    op.drop_index("ix_donations_gateway_session_id", table_name="donations")
    op.drop_index("ix_donations_payment_status", table_name="donations")
    op.drop_table("donations")
    op.drop_table("receipt_counters")
    op.drop_index("ix_members_status", table_name="members")
    op.drop_index("uq_members_email_not_null", table_name="members")
    op.drop_table("members")

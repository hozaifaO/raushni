"""Create designations and simple_records tables.

Revision ID: 0002_designations_simple
Revises: 0001_members_donations
Create Date: 2026-07-15

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0002_designations_simple"
down_revision: Union[str, None] = "0001_members_donations"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "designations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("code", sa.String(length=30), nullable=False),
        sa.Column("department", sa.String(length=80), nullable=False),
        sa.Column("level", sa.String(length=40), nullable=False, server_default="volunteer"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("reports_to", sa.String(length=120), nullable=True),
        sa.Column("description", sa.String(length=700), nullable=False),
        sa.Column("assignment_scope", sa.String(length=160), nullable=False),
        sa.Column("responsibilities", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("required_documents", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("staff_assigned", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("volunteer_slots", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cms_slug", sa.String(length=120), nullable=True),
        sa.Column("notes", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.UniqueConstraint("code", name="uq_designations_code"),
    )
    op.create_index("ix_designations_status", "designations", ["status"])
    op.create_index("ix_designations_department", "designations", ["department"])

    op.create_table(
        "simple_records",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("module", sa.String(length=40), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False, server_default="general"),
        sa.Column("summary", sa.String(length=1200), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="active"),
        sa.Column("record_date", sa.Date(), nullable=False),
        sa.Column("contact_name", sa.String(length=140), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=True),
        sa.Column("amount", sa.Numeric(12, 2), nullable=True),
        sa.Column("location", sa.String(length=180), nullable=True),
        sa.Column("notes", sa.String(length=1200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    )
    op.create_index("ix_simple_records_module_status", "simple_records", ["module", "status"])
    op.create_index("ix_simple_records_module_record_date", "simple_records", ["module", "record_date"])


def downgrade() -> None:
    op.drop_index("ix_simple_records_module_record_date", table_name="simple_records")
    op.drop_index("ix_simple_records_module_status", table_name="simple_records")
    op.drop_table("simple_records")
    op.drop_index("ix_designations_department", table_name="designations")
    op.drop_index("ix_designations_status", table_name="designations")
    op.drop_table("designations")

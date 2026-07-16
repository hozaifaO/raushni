"""Create projects, campaigns, and campaign_donations tables.

Revision ID: 0003_projects_crowdfunding
Revises: 0002_designations_simple
Create Date: 2026-07-15

"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0003_projects_crowdfunding"
down_revision: Union[str, None] = "0002_designations_simple"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("summary", sa.String(length=1200), nullable=False),
        sa.Column("location", sa.String(length=180), nullable=False),
        sa.Column("focus_area", sa.String(length=120), nullable=False, server_default="Education and WATSAN"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="proposed"),
        sa.Column("priority", sa.String(length=20), nullable=False, server_default="high"),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("budget", sa.Numeric(14, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("beneficiaries", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("schools_targeted", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("progress", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("manager", sa.String(length=120), nullable=False, server_default="Project Manager"),
        sa.Column("donor", sa.String(length=160), nullable=True),
        sa.Column("proposal_url", sa.String(length=300), nullable=True),
        sa.Column("cms_slug", sa.String(length=160), nullable=True),
        sa.Column("objectives", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("milestones", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("risks", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("notes", sa.String(length=1200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.UniqueConstraint("slug", name="uq_projects_slug"),
    )
    op.create_index("ix_projects_status", "projects", ["status"])

    op.create_table(
        "campaigns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("slug", sa.String(length=140), nullable=False),
        sa.Column("summary", sa.String(length=900), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False, server_default="education"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="draft"),
        sa.Column("target_amount", sa.Numeric(14, 2), nullable=False),
        sa.Column("amount_raised", sa.Numeric(14, 2), nullable=False, server_default="0"),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="INR"),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("location", sa.String(length=180), nullable=False, server_default="India"),
        sa.Column("beneficiary_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("cover_image_url", sa.String(length=400), nullable=True),
        sa.Column("public_url", sa.String(length=400), nullable=True),
        sa.Column("cms_slug", sa.String(length=160), nullable=True),
        sa.Column("owner", sa.String(length=120), nullable=False, server_default="Fundraising Team"),
        sa.Column("highlights", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("impact_metrics", postgresql.JSONB(), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column("notes", sa.String(length=1200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.UniqueConstraint("slug", name="uq_campaigns_slug"),
    )
    op.create_index("ix_campaigns_status", "campaigns", ["status"])

    op.create_table(
        "campaign_donations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("campaigns.id", ondelete="CASCADE"), nullable=False),
        sa.Column("donor_name", sa.String(length=140), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("payment_method", sa.String(length=80), nullable=False, server_default="upi"),
        sa.Column("receipt_no", sa.String(length=80), nullable=True),
        sa.Column("note", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("NOW()"), nullable=False),
    )
    op.create_index("ix_campaign_donations_campaign_id", "campaign_donations", ["campaign_id"])


def downgrade() -> None:
    op.drop_index("ix_campaign_donations_campaign_id", table_name="campaign_donations")
    op.drop_table("campaign_donations")
    op.drop_index("ix_campaigns_status", table_name="campaigns")
    op.drop_table("campaigns")
    op.drop_index("ix_projects_status", table_name="projects")
    op.drop_table("projects")

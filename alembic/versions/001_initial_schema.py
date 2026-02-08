"""Initial schema: portfolios and portfolio_versions tables

Revision ID: 001
Revises:
Create Date: 2024-02-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.sqlite import JSON as SQLiteJSON


# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create portfolios table
    op.create_table(
        'portfolios',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('portfolio_focus', sa.String(50), nullable=False, server_default='general'),
        sa.Column('status', sa.String(20), nullable=False, server_default='draft'),

        # Data source flags
        sa.Column('has_linkedin', sa.Boolean(), default=False),
        sa.Column('has_resume', sa.Boolean(), default=False),
        sa.Column('has_github', sa.Boolean(), default=False),
        sa.Column('has_codeforces', sa.Boolean(), default=False),
        sa.Column('has_leetcode', sa.Boolean(), default=False),

        # Raw input data (JSON)
        sa.Column('linkedin_data', SQLiteJSON, nullable=True),
        sa.Column('resume_text', sa.Text(), nullable=True),
        sa.Column('github_data', SQLiteJSON, nullable=True),
        sa.Column('codeforces_data', SQLiteJSON, nullable=True),
        sa.Column('leetcode_data', SQLiteJSON, nullable=True),

        # Generated output (JSON)
        sa.Column('public_portfolio_json', SQLiteJSON, nullable=True),
        sa.Column('private_coaching_json', SQLiteJSON, nullable=True),
        sa.Column('ai_generation_metadata', SQLiteJSON, nullable=True),

        # Error tracking
        sa.Column('error_message', sa.Text(), nullable=True),

        # Timestamps
        sa.Column('generation_started_at', sa.DateTime(), nullable=True),
        sa.Column('generation_completed_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )

    # Create indexes for portfolios
    op.create_index('idx_portfolio_slug', 'portfolios', ['slug'], unique=True)
    op.create_index('idx_portfolio_status', 'portfolios', ['status'])
    op.create_index('idx_portfolio_created_at', 'portfolios', ['created_at'])

    # Create portfolio_versions table
    op.create_table(
        'portfolio_versions',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('portfolio_id', sa.String(36), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('public_portfolio_json', SQLiteJSON, nullable=False),
        sa.Column('private_coaching_json', SQLiteJSON, nullable=True),
        sa.Column('changes_summary', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(20), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['portfolio_id'], ['portfolios.id'], ondelete='CASCADE'),
    )

    # Create indexes for portfolio_versions
    op.create_index('idx_version_portfolio_id', 'portfolio_versions', ['portfolio_id'])
    op.create_index('idx_version_created_at', 'portfolio_versions', ['created_at'])


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('idx_version_created_at', table_name='portfolio_versions')
    op.drop_index('idx_version_portfolio_id', table_name='portfolio_versions')
    op.drop_index('idx_portfolio_created_at', table_name='portfolios')
    op.drop_index('idx_portfolio_status', table_name='portfolios')
    op.drop_index('idx_portfolio_slug', table_name='portfolios')

    # Drop tables
    op.drop_table('portfolio_versions')
    op.drop_table('portfolios')

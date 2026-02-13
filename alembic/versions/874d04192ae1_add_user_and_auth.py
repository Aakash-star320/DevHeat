"""add_user_and_auth

Revision ID: 874d04192ae1
Revises: 002_versioning
Create Date: 2026-02-13 06:27:40.617249

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '874d04192ae1'
down_revision: Union[str, None] = '24183b7f2a2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

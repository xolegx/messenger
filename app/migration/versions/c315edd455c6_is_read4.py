"""'is_read4'

Revision ID: c315edd455c6
Revises: 9a2b38be07a4
Create Date: 2025-01-14 22:39:57.241025

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c315edd455c6'
down_revision: Union[str, None] = '9a2b38be07a4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

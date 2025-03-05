"""'date'

Revision ID: 67b6b6f95bf5
Revises: 46fe33ddcf5d
Create Date: 2025-03-05 21:22:51.650475

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '67b6b6f95bf5'
down_revision: Union[str, None] = '46fe33ddcf5d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

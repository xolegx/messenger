"""'lastseen'

Revision ID: 46fe33ddcf5d
Revises: 047eb249b416
Create Date: 2025-03-05 21:17:26.408346

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '46fe33ddcf5d'
down_revision: Union[str, None] = '047eb249b416'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

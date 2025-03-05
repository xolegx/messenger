"""'relation'

Revision ID: 047eb249b416
Revises: 7f5530e9a8b8
Create Date: 2025-03-05 21:08:12.086941

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '047eb249b416'
down_revision: Union[str, None] = '7f5530e9a8b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

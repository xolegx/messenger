"""'addLastSeen'

Revision ID: 6addf7067a84
Revises: 7c151d01d8d9
Create Date: 2025-02-25 20:23:38.602011

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6addf7067a84'
down_revision: Union[str, None] = '7c151d01d8d9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

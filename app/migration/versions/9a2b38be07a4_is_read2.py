"""'is_read2'

Revision ID: 9a2b38be07a4
Revises: b4a6eda1a01f
Create Date: 2025-01-14 22:08:51.222718

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9a2b38be07a4'
down_revision: Union[str, None] = 'b4a6eda1a01f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

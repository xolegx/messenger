from app.core.base import BaseCORE
from app.users.models import User


class UsersCORE(BaseCORE):
    model = User

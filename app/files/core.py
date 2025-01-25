from sqlalchemy import select, and_, or_
from app.core.base import BaseCORE
from app.chat.models import Message
from app.database import async_session_maker
from app.config import get_auth_data


class MessagesCORE(BaseCORE):
    model = Message

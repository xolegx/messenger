from sqlalchemy import select, and_, or_
from app.core.base import BaseCORE
from app.chat.models import Message
from app.database import async_session_maker
from app.config import get_auth_data
from cryptography.fernet import Fernet
from typing import List
from app.files.models import File


class MessagesCORE(BaseCORE):
    model = Message

    @classmethod
    async def get_messages_between_users(cls, user_id_1: int, user_id_2: int):
        """
        Асинхронно находит и возвращает все сообщения между двумя пользователями.

        Аргументы:
            user_id_1: ID первого пользователя.
            user_id_2: ID второго пользователя.

        Возвращает:
            Список сообщений между двумя пользователями.
        """
        async with async_session_maker() as session:
            query = select(cls.model).filter(
                or_(
                    and_(cls.model.sender_id == user_id_1, cls.model.recipient_id == user_id_2),
                    and_(cls.model.sender_id == user_id_2, cls.model.recipient_id == user_id_1)
                )
            ).order_by(cls.model.id)
            result = await session.execute(query)
            messages = result.scalars().all()
            for message in messages:
                message.content = decrypt_message(message.content)
            return messages

    @classmethod
    async def save_message(cls, content: str, sender_id: int, recipient_id: int, is_sticker: bool = False,
                           file_ids: List[int] = None):
        encrypted_content = encrypt_message(content) if content else None
        async with async_session_maker() as session:
            message = cls.model(content=encrypted_content, sender_id=sender_id, recipient_id=recipient_id,
                                is_sticker=is_sticker)
            session.add(message)
            if file_ids:
                files = await session.execute(select(File).where(File.id.in_(file_ids)))
                message.files.extend(files.scalars().all())
            await session.commit()


auth_data = get_auth_data()
crypt_key = auth_data['crypt_key']  # Получаем ключ из данных аутентификации

# Создаем экземпляр Fernet с вашим ключом
cipher_suite = Fernet(crypt_key)


def encrypt_message(message: str) -> str:
    return cipher_suite.encrypt(message.encode()).decode()  # Шифруем сообщение


def decrypt_message(encrypted_message: str) -> str:
    return cipher_suite.decrypt(encrypted_message.encode()).decode()  # Расшифровываем сообщение

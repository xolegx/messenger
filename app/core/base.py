from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.future import select
from sqlalchemy import update as sqlalchemy_update, delete as sqlalchemy_delete, func
from app.database import async_session_maker


class BaseCORE:
    model = None

    @classmethod
    async def find_one_or_none_by_id(cls, data_id: int):
        """
        јсинхронно находит и возвращает один экземпл€р модели по указанным критери€м или None.

        јргументы:
            data_id:  ритерии фильтрации в виде идентификатора записи.

        ¬озвращает:
            Ёкземпл€р модели или None, если ничего не найдено.
        """
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=data_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_one_or_none(cls, **filter_by):
        """
        јсинхронно находит и возвращает один экземпл€р модели по указанным критери€м или None.

        јргументы:
            **filter_by:  ритерии фильтрации в виде именованных параметров.

        ¬озвращает:
            Ёкземпл€р модели или None, если ничего не найдено.
        """
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        """
        јсинхронно находит и возвращает все экземпл€ры модели, удовлетвор€ющие указанным критери€м.

        јргументы:
            **filter_by:  ритерии фильтрации в виде именованных параметров.

        ¬озвращает:
            —писок экземпл€ров модели.
        """
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def add(cls, **values):
        """
        јсинхронно создает новый экземпл€р модели с указанными значени€ми.

        јргументы:
            **values: »менованные параметры дл€ создани€ нового экземпл€ра модели.

        ¬озвращает:
            —озданный экземпл€р модели.
        """
        async with async_session_maker() as session:
            async with session.begin():
                new_instance = cls.model(**values)
                session.add(new_instance)
                try:
                    await session.commit()
                except SQLAlchemyError as e:
                    await session.rollback()
                    raise e
                return new_instance

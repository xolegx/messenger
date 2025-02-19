from sqlalchemy import insert
from sqlalchemy.future import select
from app.database import async_session_maker


class BaseCORE:
    model = None

    @classmethod
    async def find_one_or_none_by_id(cls, data_id: int):
        """
                Асинхронно находит и возвращает один экземпляр модели по указанным критериям или None.

                Аргументы:
                    data_id: Критерии фильтрации в виде идентификатора записи.

                Возвращает:
                    Экземпляр модели или None, если ничего не найдено.
                """
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(id=data_id)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_one_or_none(cls, **filter_by):
        """
        Асинхронно находит и возвращает один экземпляр модели по указанным критериям или None.

        Аргументы:
            **filter_by: Критерии фильтрации в виде именованных параметров.

        Возвращает:
            Экземпляр модели или None, если ничего не найдено.
        """
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalar_one_or_none()

    @classmethod
    async def find_all(cls, **filter_by):
        """
        Асинхронно находит и возвращает все экземпляры модели, удовлетворяющие указанным критериям.

        Аргументы:
            **filter_by: Критерии фильтрации в виде именованных параметров.

        Возвращает:
            Список экземпляров модели.
        """
        async with async_session_maker() as session:
            query = select(cls.model).filter_by(**filter_by)
            result = await session.execute(query)
            return result.scalars().all()

    @classmethod
    async def add(cls, **values):
        async with async_session_maker() as session:
            async with session.begin():
                stmt = insert(cls.model).values(**values).returning(cls.model.id)
                result = await session.execute(stmt)
                created_id = result.scalar()
                await session.commit()
                return created_id  # Возвращаем id созданного сообщения

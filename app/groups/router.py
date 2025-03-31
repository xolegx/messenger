from fastapi.templating import Jinja2Templates
from fastapi import HTTPException, APIRouter, Depends
from app.database import async_session_maker
from app.groups.models import GroupChatMember, GroupChat
from app.users.models import User
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix='/groups', tags=['Groups'])
templates = Jinja2Templates(directory='app/templates')


async def get_db():
    async with async_session_maker() as session:
        yield session

@router.post("/group_chat/{group_chat_id}/add_user/{user_id}")
async def add_user_to_group(group_chat_id: int, user_id: int, session: AsyncSession = Depends(get_db)):
    # Проверка существования группы
    result = await session.execute(select(GroupChat).filter(GroupChat.id == group_chat_id))
    group_chat = result.scalars().first()
    if not group_chat:
        raise HTTPException(status_code=404, detail="Group chat not found")

    # Проверка существования пользователя
    result = await session.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Проверка, был ли уже добавлен пользователь в группу
    result = await session.execute(select(GroupChatMember).filter(
        GroupChatMember.user_id == user_id,
        GroupChatMember.group_chat_id == group_chat_id
    ))
    existing_member = result.scalars().first()
    if existing_member:
        raise HTTPException(status_code=400, detail="User already in group")

    # Добавление пользователя в группу
    new_member = GroupChatMember(user_id=user_id, group_chat_id=group_chat_id)
    session.add(new_member)
    await session.commit()
    await session.refresh(new_member)

    return {"message": "User added to group successfully", "member": new_member}


@router.post("/group_chat/create")
async def create_group_chat(name: str, session: AsyncSession = Depends(get_db)):
    # Проверка на наличие группы с таким же именем
    result = await session.execute(select(GroupChat).filter(GroupChat.name == name))
    existing_group = result.scalars().first()
    if existing_group:
        raise HTTPException(status_code=400, detail="Group chat with this name already exists")

    # Создание новой группы
    new_group_chat = GroupChat(name=name)
    session.add(new_group_chat)
    await session.commit()
    await session.refresh(new_group_chat)

    return {"message": "Group chat created successfully", "group_chat": new_group_chat}
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Depends, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import List, Dict
from app.chat.core import MessagesCORE
from app.chat.schemas import MessageRead, MessageCreate
from app.chat.models import Message
from app.users.core import UsersCORE
from app.users.dependencies import get_current_user
from app.users.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from sqlalchemy.future import select

import asyncio

router = APIRouter(prefix='/chat', tags=['Chat'])
templates = Jinja2Templates(directory='app/templates')
active_connections: Dict[int, WebSocket] = {}


async def notify_user(user_id: int, message: dict):
    if user_id in active_connections:
        websocket = active_connections[user_id]
        await websocket.send_json(message)


@router.get("/", response_class=HTMLResponse, summary="Chat Page")
async def get_chat_page(request: Request, user_data: User = Depends(get_current_user)):
    users_all = await UsersCORE.find_all()
    return templates.TemplateResponse("chat.html",
                                      {"request": request, "user": user_data, 'users_all': users_all})


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await websocket.accept()
    active_connections[user_id] = websocket
    try:
        while True:
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        active_connections.pop(user_id, None)


@router.get("/messages/{user_id}", response_model=List[MessageRead])
async def get_messages(user_id: int, current_user: User = Depends(get_current_user)):
    '''@router.get("/messages/{user_id}", response_model=List[MessageRead])
async def get_messages(user_id: int, current_user: User = Depends(get_current_user)):
    messages = await MessagesCORE.get_messages_between_users(user_id_1=user_id, user_id_2=current_user.id) or []
    return messages'''
    return await MessagesCORE.get_messages_between_users(user_id_1=user_id, user_id_2=current_user.id) or []


@router.post("/messages", response_model=MessageCreate)
async def send_message(message: MessageCreate, current_user: User = Depends(get_current_user)):
    await MessagesCORE.add(
        sender_id=current_user.id,
        content=message.content,
        recipient_id=message.recipient_id,
    )
    message_data = {
        'sender_id': current_user.id,
        'recipient_id': message.recipient_id,
        'content': message.content,
    }
    await notify_user(message.recipient_id, message_data)
    await notify_user(current_user.id, message_data)
    return {'recipient_id': message.recipient_id, 'content': message.content, 'status': 'ok', 'msg': 'Message saved!'}


@router.put("/messages/{message_id}/read")
async def mark_as_read(message_id: int):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(Message.id == message_id)
        )
        message = result.scalars().first()

        if not message:
            raise HTTPException(status_code=404, detail="Message not found")

        message.is_read = True
        await session.commit()
        await session.refresh(message)

    return message


@router.get("/messages/unread/{user_id}")
async def count_unread_messages(user_id: int, user_data: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(
            select(Message).filter(
                Message.recipient_id == user_data.id,
                Message.sender_id == user_id,
                Message.is_read == False
            )
        )
        unread_messages = result.scalars().all()  # Получаем все непрочитанные сообщения
        count = len(unread_messages)  # Подсчитываем количество непрочитанных сообщений

    return {"unread_count": count}

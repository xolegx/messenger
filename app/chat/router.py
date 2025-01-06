from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import List, Dict
from app.chat.core import MessagesCORE
from app.chat.schemas import MessageRead, MessageCreate
from app.users.core import UsersCORE
from app.users.dependencies import get_current_user
from app.users.models import User
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio

router = APIRouter(prefix='/chat', tags=['Chat'])
templates = Jinja2Templates(directory='app/templates')
active_connections: Dict[int, WebSocket] = {}


async def get_db():
    async with AsyncSession() as sessions:
        yield sessions
# class ConnectionManager:
#     def __init__(self):
#         self.active_connections: List[WebSocket] = []
#
#     async def connect(self, websocket: WebSocket):
#         await websocket.accept()
#         self.active_connections.append(websocket)
#
#     def disconnect(self, websocket: WebSocket):
#         self.active_connections.remove(websocket)
#
#     async def broadcast(self, message: str):
#         for connection in self.active_connections:
#             await connection.send_text(message)
#
#
# manager = ConnectionManager()


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
    # await manager.connect(websocket)
    # try:
    #     await manager.broadcast(f"User {user_id} is online")
    #     while True:
    #         data = await websocket.receive_text()
    #         # Обработка сообщений от пользователя
    # except WebSocketDisconnect:
    #     manager.disconnect(websocket)
    #     await manager.broadcast(f"User {user_id} is offline")


@router.get("/messages/{user_id}", response_model=List[MessageRead])
async def get_messages(user_id: int, current_user: User = Depends(get_current_user)):
    return await MessagesCORE.get_messages_between_users(user_id_1=user_id, user_id_2=current_user.id) or []


@router.post("/messages", response_model=MessageCreate)
async def send_message(message: MessageCreate, current_user: User = Depends(get_current_user)):
    await MessagesCORE.add(
        sender_id=current_user.id,
        content=message.content,
        recipient_id=message.recipient_id
    )
    message_data = {
        'sender_id': current_user.id,
        'recipient_id': message.recipient_id,
        'content': message.content,
    }
    await notify_user(message.recipient_id, message_data)
    await notify_user(current_user.id, message_data)
    return {'recipient_id': message.recipient_id, 'content': message.content, 'status': 'ok', 'msg': 'Message saved!'}

# from sqlalchemy.future import select
# @router.get("/w")
# async def websock(db: AsyncSession = Depends(get_db)):
#     async with db.begin():
#         result = await db.execute(select(User).filter(User.id == 1))
#         user = result.scalars().first()
#         if user:
#             user.is_online = "True"
#
#     await db.commit()
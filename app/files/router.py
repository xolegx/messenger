from fastapi import APIRouter, UploadFile, File as FastAPIFile, Depends
from typing import List
import shutil
import os
from app.files.schemas import FileRead
from app.database import async_session_maker
from app.files.models import File
from sqlalchemy.future import select
from sqlalchemy import or_
from app.users.models import User
from app.chat.models import Message
from app.users.dependencies import get_current_user

router = APIRouter(prefix='/files', tags=['File'])

UPLOAD_DIRECTORY = "./uploaded_files"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


@router.post("/upload/", response_model=FileRead)
async def upload_file(file: UploadFile = FastAPIFile(...), message_id: int = None, sender_id: int = None, recipient_id: int = None,
                      current_user: User = Depends(get_current_user)):
    file_location = f"{UPLOAD_DIRECTORY}/{file.filename}"

    # Сохранение файла на диск
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    async with async_session_maker() as session:
        db_file = File(filename=file.filename, file_url=file_location, message_id=message_id, sender_id=sender_id, recipient_id=recipient_id)
        session.add(db_file)
        await session.commit()
        await session.refresh(db_file)

        return {
            'id': db_file.id,
            'filename': db_file.filename,
            'file_url': db_file.file_url,
            'message_id': db_file.message_id,
            'status': 'ok',
            'msg': 'File uploaded successfully!'
        }


@router.get("/", response_model=List[FileRead])
async def get_files(current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(select(File).filter(or_(File.sender_id == current_user.id, File.recipient_id == current_user.id)))
        files = result.scalars().all()
        return files

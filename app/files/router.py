import logging
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, Depends, HTTPException, Form
from fastapi.responses import FileResponse
from typing import List
from sqlalchemy.future import select
from sqlalchemy import or_
from PIL import Image, UnidentifiedImageError
import mimetypes

from app.chat.models import Message
from app.database import async_session_maker
from app.users.models import User
from app.users.dependencies import get_current_user
from app.files.schemas import FileRead
from app.files.models import File

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
router = APIRouter(prefix='/files', tags=['File'])

UPLOAD_DIRECTORY = "./uploaded_files"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


@router.post("/upload-file/")
async def upload_file(file: UploadFile = File,
                      message_id: int = Form(...),
                      recipient_id: int = Form(...),
                      sender_id: int = Form(...),
                      current_user: User = Depends(get_current_user)):
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = timestamp + file.filename
    file_path = os.path.join(UPLOAD_DIRECTORY, filename)
    preview = "preview_" + timestamp + file.filename
    preview_path = os.path.join(UPLOAD_DIRECTORY, preview)

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    mime_type, _ = mimetypes.guess_type(file_path)
    if mime_type and mime_type.startswith('image'):
        try:
            with Image.open(file_path) as img:
                img.thumbnail((500, 500))
                img.save(preview_path)
        except UnidentifiedImageError:
            return {'error': 'Uploaded file is not a valid image.'}

    file_size = os.path.getsize(file_path)

    async with async_session_maker() as session:
        recipient_data = await session.execute(select(User).filter(User.id == recipient_id))
        recipient = recipient_data.scalars().first()
        # logger.info(f"info: {recipient.name}")

        db_file = File(filename=file.filename,
                       file_url=file_path,
                       preview_url=preview_path,
                       file_size=file_size,
                       sender=current_user.name,
                       recipient=recipient.name,
                       message_id=message_id,
                       recipient_id=recipient_id,
                       sender_id=sender_id,
                       )
        session.add(db_file)
        await session.commit()
        await session.refresh(db_file)

        return {'id_file': db_file.id}


@router.get("/", response_model=List[FileRead])
async def get_files(current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(select(File).filter(or_(File.recipient_id == current_user.id, File.sender_id == current_user.id)))
        files = result.scalars().all()
        return files


@router.get("/download-file/{file_id}")
async def download_file(file_id: int, current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        db_file = await session.get(File, file_id)
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")

        file_path = db_file.file_url
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on server")

        return FileResponse(path=file_path, filename=db_file.filename, media_type='application/octet-stream')


@router.get("/download-preview/{file_id}")
async def download_preview(file_id: int, current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        db_file = await session.get(File, file_id)
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")

        file_path = db_file.preview_url
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on server")

        return FileResponse(path=file_path, filename=db_file.filename, media_type='application/octet-stream')


@router.delete("/delete-file/{file_id}")
async def delete_file(file_id: int, current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        db_file = await session.get(File, file_id)
        if not db_file:
            raise HTTPException(status_code=404, detail="File not found")

        await session.delete(db_file)
        await session.commit()

        return {"status": "ok", "msg": "File deleted successfully!"}

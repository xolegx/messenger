import os
from fastapi import APIRouter, UploadFile, Depends, HTTPException
from fastapi.responses import FileResponse
from typing import List
from sqlalchemy.future import select
from app.database import async_session_maker
from app.users.models import User
from app.users.dependencies import get_current_user
from app.files.schemas import FileRead
from app.files.models import File


router = APIRouter(prefix='/files', tags=['File'])

UPLOAD_DIRECTORY = "./uploaded_files"

if not os.path.exists(UPLOAD_DIRECTORY):
    os.makedirs(UPLOAD_DIRECTORY)


@router.post("/upload-file/")
async def upload_file(file: UploadFile,
                      message_id: int,
                      recipient_id: int,
                      current_user: User = Depends(get_current_user)):
    file_path = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())
    file_size = os.path.getsize(file_path)
    async with async_session_maker() as session:
        db_file = File(filename=file.filename,
                       file_url=file_path,
                       file_size=file_size,
                       message_id=message_id,
                       sender=current_user.name,
                       recipient_id=recipient_id)
        session.add(db_file)
        await session.commit()
        await session.refresh(db_file)

        return 'File uploaded successfully!'


@router.get("/", response_model=List[FileRead])
async def get_files(current_user: User = Depends(get_current_user)):
    async with async_session_maker() as session:
        result = await session.execute(select(File).filter(File.recipient_id == current_user.id))
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

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.exceptions import TokenExpiredException, TokenNoFoundException
from app.users.router import router as users_router
from app.chat.router import router as chat_router
from app.friends.router import router as friends_router
from app.files.router import router as files_router
from app.middlewares import FileSizeLimitMiddleware

app = FastAPI()
app.mount('/static', StaticFiles(directory='app/static'), name='static')
MAX_UPLOAD_SIZE = 100 * 1024 * 1024

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешить запросы с любых источников. Можете ограничить список доменов
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST, PUT, DELETE и т.д.)
    allow_headers=["*"],  # Разрешить все заголовки
)

app.add_middleware(FileSizeLimitMiddleware, max_upload_size=MAX_UPLOAD_SIZE)

app.include_router(users_router)
app.include_router(chat_router)
app.include_router(friends_router)
app.include_router(files_router)


@app.get("/")
async def redirect_to_auth():
    return RedirectResponse(url="/auth")


@app.exception_handler(TokenExpiredException)
async def token_expired_exception_handler(request: Request, exc: HTTPException):
    # Возвращаем редирект на страницу /auth
    return RedirectResponse(url="/auth")


# Обработчик для TokenNoFound
@app.exception_handler(TokenNoFoundException)
async def token_no_found_exception_handler(request: Request, exc: HTTPException):
    # Возвращаем редирект на страницу /auth
    return RedirectResponse(url="/auth")



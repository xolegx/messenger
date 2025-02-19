from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class FileSizeLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_upload_size: int):
        super().__init__(app)
        self.max_upload_size = max_upload_size

    async def dispatch(self, request, call_next):
        content_length = request.headers.get('Content-Length')
        if content_length:
            content_length = int(content_length)
            if content_length > self.max_upload_size:
                return JSONResponse(
                    content={"detail": f"File size exceeds the limit of {self.max_upload_size} bytes."},
                    status_code=413,  # Payload Too Large
                )
        return await call_next(request)

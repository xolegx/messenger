from fastapi import FastAPI
from fastapi.responses import FileResponse

app = FastAPI()


@app.get("/")
def root():
    return FileResponse("app/index.html")


# альтернативный вариант
@app.get("/file", response_class=FileResponse)
def root_html():
    return "app/index.html"


@app.post("/calculate")
def calculate(num1: int = 5, num2: int = 10):
    return {"result": num1 + num2}
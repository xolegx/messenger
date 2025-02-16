FROM python:3.11.3

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы зависимостей
COPY requirements.txt ./

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем все остальные файлы приложения
COPY ./app ./app
COPY .env ./
COPY alembic.ini ./
COPY db.sqlite3 ./

# Устанавливаем переменные окружения
ENV PYTHONUNBUFFERED=1

# Команда для запуска приложения
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.users.models import User
from app.database import async_session_maker
from app.users.dependencies import get_current_user


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
async def override_get_current_user():
    async with async_session_maker() as session:
        user = User(id=1, username="testuser", email="test@example.com")
        session.add(user)
        await session.commit()
        yield user
        await session.delete(user)


@pytest.mark.asyncio
async def test_get_chat_page(client, override_get_current_user):
    app.dependency_overrides[get_current_user] = lambda: override_get_current_user

    response = client.get("/chat/")

    assert response.status_code == 200
    assert "CosmoChat" in response.text
    assert "user" in response.text

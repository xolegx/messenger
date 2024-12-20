from pydantic import BaseModel, EmailStr, Field


class SUserRegister(BaseModel):
    email: EmailStr = Field(..., description="����������� �����")
    password: str = Field(..., min_length=5, max_length=50, description="������, �� 5 �� 50 ������")
    password_check: str = Field(..., min_length=5, max_length=50, description="������, �� 5 �� 50 ������")
    name: str = Field(..., min_length=3, max_length=50, description="���, �� 3 �� 50 ��������")


class SUserAuth(BaseModel):
    email: EmailStr = Field(..., description="����������� �����")
    password: str = Field(..., min_length=5, max_length=50, description="������, �� 5 �� 50 ������")
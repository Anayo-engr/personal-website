from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ContactInquiryCreate(BaseModel):
    surname: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    othernames: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    email: EmailStr

    phone: str | None = Field(
        default=None,
        min_length=8,
        max_length=16,
        pattern=r"^\+[1-9]\d{7,14}$",
    )

    project_type: str = Field(
        ...,
        min_length=1,
        max_length=100,
    )

    location: str = Field(
        ...,
        min_length=1,
        max_length=255,
    )

    budget: str | None = Field(
        default=None,
        max_length=100,
    )

    timeline: str | None = Field(
        default=None,
        max_length=100,
    )

    comments: str | None = Field(
        default=None,
        max_length=5000,
    )


class ContactInquiryResponse(ContactInquiryCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: str
    created_at: datetime


class AdminLoginRequest(BaseModel):
    username: str
    password: str


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


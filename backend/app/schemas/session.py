from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionCreate(BaseModel):
    name: Optional[str] = "New Chat"


class SessionUpdate(BaseModel):
    name: str


class SessionResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    updated_at: datetime
    message_count: int = 0

    model_config = {"from_attributes": True}

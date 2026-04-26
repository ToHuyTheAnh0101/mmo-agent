from pydantic import BaseModel
from datetime import datetime


class ChatRequest(BaseModel):
    message: str


class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    model_config = {"from_attributes": True}

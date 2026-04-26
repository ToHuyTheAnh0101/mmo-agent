from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SettingsUpdate(BaseModel):
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    model_name: Optional[str] = None


class SettingsResponse(BaseModel):
    has_api_key: bool
    base_url: str
    model_name: str
    updated_at: Optional[datetime] = None

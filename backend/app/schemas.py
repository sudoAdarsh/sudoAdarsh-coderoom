from sqlmodel import SQLModel
from datetime import datetime

class RoomCreate(SQLModel):
    host_client_id: str

class RoomRead(SQLModel):
    id: str
    created_at: datetime
    
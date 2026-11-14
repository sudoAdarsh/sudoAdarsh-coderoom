from datetime import datetime, timezone
from sqlmodel import SQLModel, Field

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

class Room(SQLModel, table=True):
    id: str = Field(primary_key=True)
    host_client_id: str
    created_at: datetime = Field(default_factory=utcnow)
    closed_at: datetime | None = None
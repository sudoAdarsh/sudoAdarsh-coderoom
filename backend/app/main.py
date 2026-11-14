from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError

from app.db import engine, get_session
from app.models import Room
from app.schemas import RoomCreate, RoomRead

import secrets
import string
from datetime import datetime

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173", 
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALPHABET = string.ascii_lowercase + string.digits

def generate_room_id(length: int = 6) -> str:
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


@app.post("/api/rooms", response_model=RoomRead)
def create_room(body: RoomCreate, session: Session = Depends(get_session)):
    for n in range(5):
        room = Room(
            id=generate_room_id(),
            host_client_id=body.host_client_id,
        )
        try:
            session.add(room)
            session.commit()
            session.refresh(room)
            return room
        except IntegrityError as exc:
            session.rollback()
            if "UNIQUE" in str(exc.orig).upper():
                continue
            else:
                raise
            
    raise HTTPException(
        status_code=500,
        detail="Could not allocate a unique room ID. Please try again."
    )


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "coderoom-api"
    }


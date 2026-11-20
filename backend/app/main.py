import json
import secrets
import string
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.db import get_session
from app.models import Room
from app.schemas import RoomCreate, RoomRead

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
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
        status_code=500, detail="Could not allocate a unique room ID. Please try again."
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "coderoom-api"}


async def send(ws: WebSocket, type_, payload):
    await ws.send_text(
        json.dumps(
            {
                "type": type_,
                "payload": payload,
            }
        )
    )


ROOMS: dict[str, set[WebSocket]] = {}


@app.websocket("/ws/{room_id}")
async def ws_room(websocket: WebSocket, room_id: str):
    await websocket.accept()
    ROOMS.setdefault(room_id, set()).add(websocket)
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await send(websocket, "error", {"message": "invalid json"})
                continue

            type_ = msg.get("type")
            payload = msg.get("payload")

            if type_ == "echo":
                try:
                    await send(
                        websocket,
                        "echo",
                        {
                            "text": payload["text"],
                        },
                    )
                except TypeError:
                    await send(
                        websocket, "error", {"message": "echo requires payload.text"}
                    )
            elif type_ == "ping":
                await send(
                    websocket,
                    "pong",
                    {
                        "at": "pong",
                    },
                )
            elif type_ == "code_update":
                for peer in list(ROOMS.get(room_id, set())):
                    if peer is websocket:
                        continue
                    try:
                        await send(
                            peer, "code_update", {"text": payload.get("text", "")}
                        )
                    except Exception:
                        pass
            else:
                await send(websocket, "error", {"message": "unknown type"})
    except WebSocketDisconnect:
        print(f"client left {room_id}")
        pass
    finally:
        peers = ROOMS.get(room_id)
        if peers is not None:
            peers.discard(websocket)
            if not peers:
                ROOMS.pop(room_id, None)

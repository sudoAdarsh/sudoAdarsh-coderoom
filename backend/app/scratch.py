# from sqlmodel import Session
# from app.db import engine
# from app.models import Room

# def main():
#     room_id = "test01"
#     room = Room(
#         id=room_id,
#         host_client_id="host-abc",
#     )

#     with Session(engine) as session:
#         session.add(room)
#         print("Added")
#         session.commit()
#         print("Commited")
#         session.refresh(room)
#         print("Created room.")
#         print(room)

#         saved_room = session.get(Room, room_id)
#         print("\nFetched data form database.")
#         print(saved_room)


# if __name__ == "__main__":
#     main()


import secrets
import string

alpha = string.ascii_lowercase + string.digits

print("".join(secrets.choice(alpha) for _ in range(6)))
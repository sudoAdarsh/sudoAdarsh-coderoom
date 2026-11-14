from sqlmodel import SQLModel
from app.db import engine
from app import models

def main():
    SQLModel.metadata.create_all(engine)
    print("tables created")

if __name__ == "__main__":
    main()
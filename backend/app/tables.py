from app.db import engine
from app import models
from sqlmodel import SQLModel


def main():
    SQLModel.metadata.create_all(engine)
    print("Tables created.")

if __name__ == "__main__":
    main()
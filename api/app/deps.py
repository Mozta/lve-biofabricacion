"""Dependencias compartidas de FastAPI."""
from fastapi import Request

from .db import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_link(request: Request):
    """El enlace serial se crea una vez en el startup y vive en app.state."""
    return request.app.state.link

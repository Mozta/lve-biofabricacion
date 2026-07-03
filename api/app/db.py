"""Configuración de la base de datos (SQLite vía SQLAlchemy).

El esquema es idéntico al que se usaría en Postgres, así que migrar más adelante
solo requiere cambiar DATABASE_URL — ver docs y el plan de la interfaz.
"""
import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# La DB vive junto al backend (api/lve.db) salvo que se sobrescriba con LVE_DB.
_DEFAULT_DB = os.path.join(os.path.dirname(os.path.dirname(__file__)), "lve.db")
DB_PATH = os.environ.get("LVE_DB", _DEFAULT_DB)
DATABASE_URL = f"sqlite:///{DB_PATH}"

# check_same_thread=False: FastAPI atiende cada request en un hilo del threadpool.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


def init_db() -> None:
    """Crea las tablas si no existen. Se llama en el startup de la app."""
    from . import models  # noqa: F401  (registra los modelos en Base.metadata)

    Base.metadata.create_all(bind=engine)

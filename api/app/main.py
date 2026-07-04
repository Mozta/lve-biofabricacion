"""App FastAPI — puente entre la interfaz web y el firmware del LVE.

Arranque:
  cd api
  python -m venv .venv && source .venv/bin/activate
  pip install -r requirements.txt
  uvicorn app.main:app --reload            # usa mock si no hay LVE_PORT
  LVE_PORT=/dev/tty.usbmodemXXXX uvicorn app.main:app --reload   # con hardware
  LVE_MOCK=1 uvicorn app.main:app --reload # fuerza el mock aunque haya puerto
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from .db import engine, init_db
from .routers import config, control, tests
from .serial_link import create_link


def _migrate(eng):
    """Agrega columnas nuevas a DB existente; no-op si ya existen. Rellena defaults físicos."""
    alter_stmts = [
        "ALTER TABLE calibration ADD COLUMN syringe_volume_ml REAL",
        "ALTER TABLE calibration ADD COLUMN thread_pitch_mm REAL",
    ]
    with eng.begin() as conn:
        for s in alter_stmts:
            try:
                conn.execute(text(s))
            except Exception:
                pass
        # Rellena defaults en filas existentes que quedaron con NULL
        conn.execute(text(
            "UPDATE calibration SET steps_per_mm = 160.0 WHERE steps_per_mm IS NULL"
        ))
        conn.execute(text(
            "UPDATE calibration SET syringe_id_mm = 29.0 WHERE syringe_id_mm IS NULL"
        ))
        # Actualiza el diámetro medido a 29mm en registros con el valor estimado anterior
        conn.execute(text(
            "UPDATE calibration SET syringe_id_mm = 29.0 WHERE syringe_id_mm = 26.7"
        ))
        conn.execute(text(
            "UPDATE calibration SET syringe_volume_ml = 60.0 WHERE syringe_volume_ml IS NULL"
        ))
        conn.execute(text(
            "UPDATE calibration SET thread_pitch_mm = 1.25 WHERE thread_pitch_mm IS NULL"
        ))


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    _migrate(engine)
    app.state.link = create_link()  # real o mock según LVE_MOCK / LVE_PORT
    yield
    app.state.link.close()


app = FastAPI(title="LVE Control API", version="0.1.0", lifespan=lifespan)

app.include_router(control.router)
app.include_router(tests.router)
app.include_router(config.router)


@app.get("/")
def root():
    return {"service": "LVE Control API", "docs": "/docs"}

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

from .db import init_db
from .routers import config, control, tests
from .serial_link import create_link


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
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

"""Endpoints de control del motor (jog manual + stop de emergencia)."""
from fastapi import APIRouter, Depends

from ..deps import get_link
from ..schemas import MoveIn, PositionOut, SpeedIn, StatusOut, StopOut

router = APIRouter(tags=["control"])

# SEQ_LEN=4 micro-pasos por paso en el firmware, con delay speed_ms en cada uno.
_SEQ_LEN = 4
_DEFAULT_SPEED_MS = 5


def _move_timeout(steps: int, speed_ms: int | None) -> float:
    """Cota superior de cuánto puede tardar un movimiento, con margen."""
    secs = steps * _SEQ_LEN * (speed_ms or _DEFAULT_SPEED_MS) / 1000.0
    return secs * 2 + 10


@router.get("/status", response_model=StatusOut)
def status(link=Depends(get_link)):
    return link.status()


@router.post("/control/extrude", response_model=PositionOut)
def extrude(body: MoveIn, link=Depends(get_link)):
    if body.speed_ms is not None:
        link.send_command(f"v{body.speed_ms}", timeout=5)
    res = link.send_command(f"e{body.steps}", timeout=_move_timeout(body.steps, body.speed_ms))
    return {"position": res["position"]}


@router.post("/control/retract", response_model=PositionOut)
def retract(body: MoveIn, link=Depends(get_link)):
    if body.speed_ms is not None:
        link.send_command(f"v{body.speed_ms}", timeout=5)
    res = link.send_command(f"r{body.steps}", timeout=_move_timeout(body.steps, body.speed_ms))
    return {"position": res["position"]}


@router.post("/control/stop", response_model=StopOut)
def stop(link=Depends(get_link)):
    return link.stop()


@router.post("/control/speed")
def speed(body: SpeedIn, link=Depends(get_link)):
    link.send_command(f"v{body.speed_ms}", timeout=5)
    return {"speed_ms": body.speed_ms}

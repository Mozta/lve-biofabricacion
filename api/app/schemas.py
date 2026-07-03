"""Esquemas Pydantic para request/response."""
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

_FROM_ATTRS = {"from_attributes": True}


# ---- Control ----
class MoveIn(BaseModel):
    steps: int = Field(gt=0)
    speed_ms: Optional[int] = Field(default=None, gt=0)


class SpeedIn(BaseModel):
    speed_ms: int = Field(gt=0)


class StatusOut(BaseModel):
    serial_connected: bool
    esp_ready: bool
    position: int


class PositionOut(BaseModel):
    position: int


class StopOut(BaseModel):
    stopped: bool
    position: int


# ---- Tests ----
class TestCreate(BaseModel):
    n_reps: int = Field(gt=0)
    steps_per_rep: int = Field(gt=0)
    speed_ms: Optional[int] = Field(default=None, gt=0)
    expected_mass_g: Optional[float] = Field(default=None, gt=0)
    notes: Optional[str] = None


class RepetitionCreate(BaseModel):
    rep_number: int = Field(gt=0)
    mass_g: float = Field(ge=0)


class RepetitionOut(BaseModel):
    id: int
    rep_number: int
    mass_g: float
    timestamp: datetime
    model_config = _FROM_ATTRS


class StatsOut(BaseModel):
    n: int
    mean: Optional[float] = None
    stdev: Optional[float] = None
    cv: Optional[float] = None
    error_pct: Optional[float] = None


class TestOut(BaseModel):
    id: int
    created_at: datetime
    n_reps: int
    steps_per_rep: int
    speed_ms: Optional[int] = None
    expected_mass_g: Optional[float] = None
    notes: Optional[str] = None
    repetitions: list[RepetitionOut] = []
    stats: StatsOut
    model_config = _FROM_ATTRS


# ---- Config / Calibración ----
class CalibrationOut(BaseModel):
    id: int
    steps_per_mm: Optional[float] = None
    syringe_id_mm: Optional[float] = None
    esp32_port: Optional[str] = None
    speed_ms: Optional[int] = None
    updated_at: Optional[datetime] = None
    model_config = _FROM_ATTRS


class CalibrationUpdate(BaseModel):
    steps_per_mm: Optional[float] = None
    syringe_id_mm: Optional[float] = None
    esp32_port: Optional[str] = None
    speed_ms: Optional[int] = None

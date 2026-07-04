"""Endpoints de configuración/calibración (fila única en la tabla calibration)."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db

router = APIRouter(prefix="/config", tags=["config"])


def _get_or_create(db: Session) -> models.Calibration:
    cal = db.query(models.Calibration).first()
    if not cal:
        cal = models.Calibration(
            speed_ms=5,
            steps_per_mm=160.0,
            syringe_id_mm=29.0,
            syringe_volume_ml=60.0,
            thread_pitch_mm=1.25,
        )
        db.add(cal)
        db.commit()
        db.refresh(cal)
    return cal


@router.get("/calibration", response_model=schemas.CalibrationOut)
def get_calibration(db: Session = Depends(get_db)):
    return _get_or_create(db)


@router.put("/calibration", response_model=schemas.CalibrationOut)
def update_calibration(body: schemas.CalibrationUpdate, db: Session = Depends(get_db)):
    cal = _get_or_create(db)
    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(cal, key, value)
    db.commit()
    db.refresh(cal)
    return cal

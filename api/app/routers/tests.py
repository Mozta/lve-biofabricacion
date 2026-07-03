"""Endpoints de corridas de prueba y captura de masa por repetición."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db
from ..stats import compute_stats

router = APIRouter(prefix="/tests", tags=["tests"])


def _serialize(test: models.Test) -> dict:
    masses = [r.mass_g for r in test.repetitions]
    return {
        "id": test.id,
        "created_at": test.created_at,
        "n_reps": test.n_reps,
        "steps_per_rep": test.steps_per_rep,
        "speed_ms": test.speed_ms,
        "expected_mass_g": test.expected_mass_g,
        "notes": test.notes,
        "repetitions": test.repetitions,
        "stats": compute_stats(masses, test.expected_mass_g),
    }


@router.post("", response_model=schemas.TestOut)
def create_test(body: schemas.TestCreate, db: Session = Depends(get_db)):
    test = models.Test(**body.model_dump())
    db.add(test)
    db.commit()
    db.refresh(test)
    return _serialize(test)


@router.get("", response_model=list[schemas.TestOut])
def list_tests(db: Session = Depends(get_db)):
    tests = db.query(models.Test).order_by(models.Test.created_at.desc()).all()
    return [_serialize(t) for t in tests]


@router.get("/{test_id}", response_model=schemas.TestOut)
def get_test(test_id: int, db: Session = Depends(get_db)):
    test = db.get(models.Test, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Corrida no encontrada")
    return _serialize(test)


@router.post("/{test_id}/repetitions", response_model=schemas.RepetitionOut)
def add_repetition(test_id: int, body: schemas.RepetitionCreate, db: Session = Depends(get_db)):
    test = db.get(models.Test, test_id)
    if not test:
        raise HTTPException(status_code=404, detail="Corrida no encontrada")
    rep = models.Repetition(test_id=test_id, rep_number=body.rep_number, mass_g=body.mass_g)
    db.add(rep)
    db.commit()
    db.refresh(rep)
    return rep

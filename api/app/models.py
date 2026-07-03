"""Modelos ORM. Esquema completo desde Fase 1 (aunque algunas pantallas sean Fase 2)."""
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from .db import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Calibration(Base):
    """Fila única con los parámetros de calibración/conexión del sistema."""

    __tablename__ = "calibration"

    id = Column(Integer, primary_key=True)
    steps_per_mm = Column(Float, nullable=True)     # pendiente de calibrar (ver docs/03)
    syringe_id_mm = Column(Float, nullable=True)    # diámetro interno del barril de la jeringa
    esp32_port = Column(String, nullable=True)      # puerto serial del ESP32-C3
    speed_ms = Column(Integer, default=5)           # delay entre micro-pasos por defecto
    updated_at = Column(DateTime, default=_now, onupdate=_now)


class Test(Base):
    """Una corrida de prueba de extrusión (N repeticiones con captura manual de masa)."""

    __tablename__ = "tests"

    id = Column(Integer, primary_key=True)
    created_at = Column(DateTime, default=_now)
    n_reps = Column(Integer, nullable=False)
    steps_per_rep = Column(Integer, nullable=False)
    speed_ms = Column(Integer, nullable=True)
    expected_mass_g = Column(Float, nullable=True)  # opcional, para calcular %error
    notes = Column(Text, nullable=True)

    repetitions = relationship(
        "Repetition",
        back_populates="test",
        cascade="all, delete-orphan",
        order_by="Repetition.rep_number",
    )


class Repetition(Base):
    """Masa medida en una repetición individual de una corrida."""

    __tablename__ = "repetitions"

    id = Column(Integer, primary_key=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    rep_number = Column(Integer, nullable=False)
    mass_g = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=_now)

    test = relationship("Test", back_populates="repetitions")

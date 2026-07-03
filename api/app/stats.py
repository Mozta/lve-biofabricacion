"""Estadísticas de consistencia de una corrida, calculadas al vuelo (no se persisten)."""
import statistics
from typing import Optional


def compute_stats(masses: list[float], expected: Optional[float] = None) -> dict:
    """media, desviación estándar muestral (n-1), %CV y %error respecto a la masa esperada."""
    n = len(masses)
    if n == 0:
        return {"n": 0, "mean": None, "stdev": None, "cv": None, "error_pct": None}

    mean = statistics.fmean(masses)
    stdev = statistics.stdev(masses) if n > 1 else 0.0
    cv = (stdev / mean * 100) if mean else None
    error_pct = (abs(mean - expected) / expected * 100) if expected else None

    return {"n": n, "mean": mean, "stdev": stdev, "cv": cv, "error_pct": error_pct}

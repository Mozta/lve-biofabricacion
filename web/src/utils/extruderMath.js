/** mL → pasos del motor. */
export function mlToSteps(volumeMl, syringeIdMm, stepsPerMm) {
  const area = Math.PI * (syringeIdMm / 2) ** 2; // mm²
  return Math.round((volumeMl * 1000 / area) * stepsPerMm);
}

/** Pasos → mL (para visualización de nivel). */
export function stepsToMl(steps, syringeIdMm, stepsPerMm) {
  const area = Math.PI * (syringeIdMm / 2) ** 2;
  return (steps / stepsPerMm) * area / 1000;
}

/** Pasos/mm a partir de parámetros mecánicos. M8 + NEMA17: 200/1.25 = 160. */
export function computeStepsPerMm(stepsPerRev = 200, pitchMm = 1.25) {
  return stepsPerRev / pitchMm;
}

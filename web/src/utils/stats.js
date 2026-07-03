// Mismas fórmulas que api/app/stats.py, calculadas en el cliente para feedback inmediato.
export function computeStats(masses, expected) {
  const n = masses.length;
  if (n === 0) return { n: 0, mean: null, stdev: null, cv: null, error_pct: null };

  const mean = masses.reduce((a, b) => a + b, 0) / n;
  const stdev =
    n > 1 ? Math.sqrt(masses.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
  const cv = mean ? (stdev / mean) * 100 : null;
  const error_pct = expected ? (Math.abs(mean - expected) / expected) * 100 : null;

  return { n, mean, stdev, cv, error_pct };
}

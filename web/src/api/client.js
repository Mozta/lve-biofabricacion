// Cliente HTTP hacia el backend FastAPI. Las rutas /api/* las reenvía el proxy de Vite.
const BASE = '/api';

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  status: () => req('GET', '/status'),

  extrude: (steps, speedMs) =>
    req('POST', '/control/extrude', { steps, ...(speedMs ? { speed_ms: speedMs } : {}) }),
  retract: (steps, speedMs) =>
    req('POST', '/control/retract', { steps, ...(speedMs ? { speed_ms: speedMs } : {}) }),
  stop: () => req('POST', '/control/stop'),
  setSpeed: (speedMs) => req('POST', '/control/speed', { speed_ms: speedMs }),

  createTest: (payload) => req('POST', '/tests', payload),
  addRepetition: (testId, repNumber, massG) =>
    req('POST', `/tests/${testId}/repetitions`, { rep_number: repNumber, mass_g: massG }),
  listTests: () => req('GET', '/tests'),
  getTest: (id) => req('GET', `/tests/${id}`),

  getCalibration: () => req('GET', '/config/calibration'),
  updateCalibration: (payload) => req('PUT', '/config/calibration', payload),
};

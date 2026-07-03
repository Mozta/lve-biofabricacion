# API — puente FastAPI del LVE

Traduce llamadas HTTP de la interfaz web a comandos serial del firmware
(`e`/`r`/`v`/`s`/`p`) y persiste las corridas de prueba en SQLite (`lve.db`).

## Correr

```bash
cd api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Sin hardware (enlace simulado): valida toda la UI end-to-end
uvicorn app.main:app --reload

# Con el ESP32-C3 conectado
LVE_PORT=/dev/tty.usbmodem1101 uvicorn app.main:app --reload
```

Docs interactivas en http://localhost:8000/docs

## Variables de entorno

| Variable   | Efecto |
|------------|--------|
| `LVE_PORT` | Puerto serial del ESP32-C3. Si falta, se usa el mock. |
| `LVE_MOCK` | `1` fuerza el enlace simulado aunque haya puerto. |
| `LVE_DB`   | Ruta alternativa del SQLite (por defecto `api/lve.db`). |

## Endpoints (Fase 1)

```
GET  /status                          estado de conexión + posición
POST /control/extrude  {steps, speed_ms?}
POST /control/retract  {steps, speed_ms?}
POST /control/stop                    stop de emergencia (preempta el movimiento)
POST /control/speed    {speed_ms}
POST /tests                           crea corrida
POST /tests/{id}/repetitions {rep_number, mass_g}
GET  /tests                           lista con stats calculadas
GET  /tests/{id}                      detalle + repeticiones + stats
GET/PUT /config/calibration
```

El `stop` escribe `s` al puerto sin tomar el lock de comandos, para preemptar una
extrusión en curso (el firmware chequea Serial dentro de su bucle de stepping).
Ver el docstring de `app/serial_link.py` para el detalle de concurrencia.

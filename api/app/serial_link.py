"""Puente serial hacia el firmware del LVE (XIAO ESP32-C3).

Protocolo del firmware (ver firmware/lve_control/lve_control.ino):
  - comandos: e<pasos>, r<pasos>, v<ms>, s (stop), p (posición)
  - respuestas: "POS <n>" tras cada movimiento/consulta, seguido de "Listo."

Diseño de concurrencia
-----------------------
Cada endpoint sync de FastAPI corre en un hilo del threadpool. Un `send_command`
de extrusión larga bloquea su hilo leyendo hasta "Listo.", pero el endpoint de
STOP corre en OTRO hilo y escribe 's' directamente al puerto SIN tomar el lock:
así preempta el movimiento en curso (el firmware chequea Serial dentro de step()).
pyserial permite un `write` concurrente con un `readline` en curso porque TX y RX
son búferes independientes. El lock solo serializa los movimientos entre sí.
"""
import os
import re
import threading
import time
from typing import Optional

try:
    import serial  # pyserial
except ImportError:  # pragma: no cover
    serial = None

BAUD = 115200
POS_RE = re.compile(r"POS\s+(-?\d+)")


class SerialLink:
    """Enlace real con el ESP32-C3 por puerto serial."""

    def __init__(self, port: str, baud: int = BAUD):
        self.port_name = port
        self.baud = baud
        self.position = 0
        self.connected = False
        self.esp_ready = False
        self._lock = threading.Lock()  # serializa movimientos (NO el stop)
        self._ser = None
        self._open()

    def _open(self) -> None:
        if serial is None:
            raise RuntimeError("pyserial no está instalado")
        self._ser = serial.Serial(self.port_name, self.baud, timeout=1.0)
        time.sleep(2.0)  # el ESP32 se resetea al abrir el puerto; esperar el boot
        self.connected = True
        self._drain_until_ready()

    def _drain_until_ready(self) -> None:
        """Consume el banner de boot y captura el 'POS 0' inicial."""
        deadline = time.time() + 3.0
        while time.time() < deadline:
            line = self._ser.readline().decode(errors="ignore").strip()
            if line:
                self._parse_line(line)
            elif self._ser.in_waiting == 0:
                break
        self.esp_ready = True

    def _parse_line(self, line: str) -> None:
        m = POS_RE.search(line)
        if m:
            self.position = int(m.group(1))

    def send_command(self, cmd: str, timeout: float = 10.0) -> dict:
        """Envía un comando y lee la respuesta hasta 'Listo.' o timeout."""
        with self._lock:
            self._ser.write((cmd + "\n").encode())
            raw = []
            deadline = time.time() + timeout
            while time.time() < deadline:
                line = self._ser.readline().decode(errors="ignore").strip()
                if not line:
                    continue
                raw.append(line)
                self._parse_line(line)
                if line.lower().startswith("listo"):
                    break
            return {"position": self.position, "raw": raw}

    def stop(self) -> dict:
        # A propósito NO toma el lock: debe preemptar un send_command en vuelo.
        if self._ser and self.connected:
            self._ser.write(b"s\n")
        return {"stopped": True, "position": self.position}

    def status(self) -> dict:
        return {
            "serial_connected": self.connected,
            "esp_ready": self.esp_ready,
            "position": self.position,
        }

    def close(self) -> None:
        try:
            if self._ser:
                self._ser.close()
        except Exception:
            pass
        self.connected = False


class MockSerialLink:
    """Enlace simulado (LVE_MOCK=1 o si no hay puerto). Permite probar la UI sin hardware."""

    def __init__(self):
        self.position = 0
        self.connected = True
        self.esp_ready = True
        self._lock = threading.Lock()
        self._stop = threading.Event()
        self._speed_ms = 5

    def send_command(self, cmd: str, timeout: float = 10.0) -> dict:
        cmd = cmd.strip()
        if not cmd:
            return {"position": self.position, "raw": []}
        c = cmd[0].lower()
        arg = cmd[1:]
        with self._lock:
            self._stop.clear()
            if c == "e":
                self._simulate_move(+1, int(arg or 0))
            elif c == "r":
                self._simulate_move(-1, int(arg or 0))
            elif c == "v":
                self._speed_ms = int(arg or 5)
            # 'p' y 's' no requieren simular movimiento aquí
            return {"position": self.position, "raw": [f"POS {self.position}", "Listo."]}

    def _simulate_move(self, direction: int, steps: int) -> None:
        """Simula el tiempo real de forma interrumpible, capado a ~3s para pruebas ágiles."""
        if steps <= 0:
            return
        total = min(steps * (self._speed_ms * 4 / 1000.0), 3.0)
        tick = 0.02
        ticks = max(1, int(total / tick))
        done = 0
        for i in range(ticks):
            if self._stop.is_set():
                self.position += direction * (round(steps * (i + 1) / ticks) - done)
                return
            time.sleep(tick)
            target = round(steps * (i + 1) / ticks)
            self.position += direction * (target - done)
            done = target
        self.position += direction * (steps - done)  # asegura posición final exacta

    def stop(self) -> dict:
        self._stop.set()
        return {"stopped": True, "position": self.position}

    def status(self) -> dict:
        return {"serial_connected": True, "esp_ready": True, "position": self.position}

    def close(self) -> None:
        pass


def create_link(port: Optional[str] = None):
    """Fábrica: elige enlace real o mock según entorno.

    - LVE_MOCK=1            -> siempre mock
    - LVE_PORT / port dado  -> intenta real; si falla, cae a mock
    - sin puerto            -> mock (para levantar la UI sin hardware)
    """
    if os.environ.get("LVE_MOCK", "").lower() in ("1", "true", "yes"):
        print("[serial] LVE_MOCK activo -> MockSerialLink")
        return MockSerialLink()

    port = port or os.environ.get("LVE_PORT")
    if not port:
        print("[serial] Sin LVE_PORT configurado -> MockSerialLink")
        return MockSerialLink()

    try:
        link = SerialLink(port)
        print(f"[serial] Conectado a {port}")
        return link
    except Exception as e:
        print(f"[serial] No se pudo abrir {port}: {e} -> MockSerialLink")
        return MockSerialLink()

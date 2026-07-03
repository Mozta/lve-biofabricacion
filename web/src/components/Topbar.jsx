import { useStatus } from '../hooks/useStatus.js';

export default function Topbar() {
  const { data, isError } = useStatus();
  const connected = !isError && data?.serial_connected;
  const label = isError
    ? 'Backend no disponible'
    : connected
      ? data.esp_ready
        ? 'ESP32-C3 conectado'
        : 'ESP32-C3 no listo'
      : 'Sin conexión';

  return (
    <header className="topbar">
      <div className="brand">
        LVE<span> · control de extrusión</span>
      </div>
      <div className="conn">
        <span className={`dot ${connected ? 'ok' : 'off'}`} />
        <span>{label}</span>
        <span className="pos">
          pos <strong>{data?.position ?? '—'}</strong>
        </span>
      </div>
    </header>
  );
}

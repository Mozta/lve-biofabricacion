import { Terminal, Database, Usb, TestTube } from 'lucide-react';
import { useStatus } from '../../hooks/useStatus';

const ENV_VARS = [
  {
    name: 'LVE_PORT',
    example: '/dev/tty.usbmodem1101',
    description: 'Puerto serial del ESP32-C3. Si no se define, el backend usa el mock.',
    icon: Usb,
  },
  {
    name: 'LVE_DB',
    example: 'api/lve.db',
    description: 'Ruta al archivo SQLite. Por defecto se crea junto al backend.',
    icon: Database,
  },
  {
    name: 'LVE_MOCK',
    example: '1',
    description: 'Fuerza el modo mock aunque LVE_PORT esté definido. Útil para desarrollo UI.',
    icon: TestTube,
  },
];

export default function Config() {
  const { data: status, isError } = useStatus();
  const connected = status?.serial_connected && status?.esp_ready;

  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Config</h1>
        <p className="text-muted text-sm mt-1">Variables de entorno del backend</p>
      </div>

      {/* Estado en vivo */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border mb-5 ${
        connected ? 'bg-extrude/5 border-extrude/20' : 'bg-white/5 border-border'
      }`}>
        <span className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-extrude shadow-[0_0_6px_#10b981]' : 'bg-zinc-600'}`} />
        <div>
          <p className={`text-sm font-medium ${connected ? 'text-extrude' : 'text-muted'}`}>
            {isError ? 'Backend no responde' : connected ? 'Hardware conectado' : 'Modo mock activo'}
          </p>
          {status && (
            <p className="text-xs text-muted mt-0.5">
              Posición: {status.position} pasos · serial: {status.serial_connected ? 'sí' : 'no'} · esp_ready: {status.esp_ready ? 'sí' : 'no'}
            </p>
          )}
        </div>
      </div>

      {/* Variables de entorno */}
      <div className="bg-panel border border-border rounded-2xl divide-y divide-border">
        {ENV_VARS.map(({ name, example, description, icon: Icon }) => (
          <div key={name} className="flex items-start gap-4 p-4">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Icon size={14} className="text-accent" />
            </div>
            <div>
              <code className="text-accent text-sm font-mono">{name}</code>
              <p className="text-muted text-xs mt-0.5">{description}</p>
              <p className="text-zinc-500 text-xs mt-1 font-mono">ej: {example}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Cómo arrancar */}
      <div className="bg-panel border border-border rounded-2xl p-5 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={14} className="text-muted" />
          <h2 className="text-xs font-medium text-muted uppercase tracking-widest">Comandos de arranque</h2>
        </div>
        <div className="flex flex-col gap-2 text-xs font-mono">
          <code className="bg-panel2 rounded-lg px-3 py-2 text-zinc-300">
            uvicorn app.main:app --reload
            <span className="text-muted ml-2"># mock automático</span>
          </code>
          <code className="bg-panel2 rounded-lg px-3 py-2 text-zinc-300">
            LVE_PORT=/dev/tty.usbmodem… uvicorn app.main:app --reload
            <span className="text-muted ml-2"># hardware real</span>
          </code>
          <code className="bg-panel2 rounded-lg px-3 py-2 text-zinc-300">
            LVE_MOCK=1 uvicorn app.main:app --reload
            <span className="text-muted ml-2"># forzar mock</span>
          </code>
        </div>
      </div>
    </div>
  );
}

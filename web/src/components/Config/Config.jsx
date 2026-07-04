import { Terminal, Database, Usb, TestTube } from 'lucide-react';
import { useStatus } from '../../hooks/useStatus';

const ENV_VARS = [
  { name: 'LVE_PORT',  example: '/dev/tty.usbmodem1101', icon: Usb,      description: 'Puerto serial del ESP32-C3. Si no se define, el backend usa el mock.' },
  { name: 'LVE_DB',   example: 'api/lve.db',            icon: Database, description: 'Ruta al archivo SQLite. Por defecto se crea junto al backend.' },
  { name: 'LVE_MOCK', example: '1',                      icon: TestTube, description: 'Fuerza el modo mock aunque LVE_PORT esté definido. Útil para desarrollo UI.' },
];

export default function Config() {
  const { data: status, isError } = useStatus();
  const connected = status?.serial_connected && status?.esp_ready;

  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-muted text-xs uppercase tracking-widest font-medium mb-1">Variables de entorno</p>
        <h1 className="text-2xl font-bold text-stone-100">Config</h1>
      </div>

      {/* Estado en vivo */}
      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border mb-5 ${
        connected ? 'bg-extrude/6 border-extrude/20' : 'bg-panel2 border-border'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${connected ? 'bg-extrude shadow-[0_0_5px_#27916a]' : 'bg-stone-600'}`} />
        <div>
          <p className={`text-sm font-medium ${connected ? 'text-extrude' : 'text-muted'}`}>
            {isError ? 'Backend no responde' : connected ? 'Hardware conectado' : 'Modo mock activo'}
          </p>
          {status && (
            <p className="text-xs text-muted mt-0.5 font-mono">
              pos: {status.position} · serial: {status.serial_connected ? 'sí' : 'no'} · esp_ready: {status.esp_ready ? 'sí' : 'no'}
            </p>
          )}
        </div>
      </div>

      {/* Variables de entorno */}
      <div className="bg-panel backdrop-blur-md border border-border rounded-xl divide-y divide-border mb-4">
        {ENV_VARS.map(({ name, example, description, icon: Icon }) => (
          <div key={name} className="flex items-start gap-4 p-4">
            <div className="mt-0.5 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Icon size={14} className="text-accent" />
            </div>
            <div>
              <code className="text-accent text-sm font-mono font-semibold">{name}</code>
              <p className="text-stone-400 text-xs mt-0.5">{description}</p>
              <p className="text-muted text-xs mt-1 font-mono">ej: {example}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comandos de arranque */}
      <div className="bg-panel backdrop-blur-md border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Terminal size={13} className="text-muted" />
          <h2 className="text-xs font-medium text-muted uppercase tracking-widest">Comandos de arranque</h2>
        </div>
        <div className="flex flex-col gap-2 text-xs font-mono">
          <code className="bg-panel2 border border-border rounded-lg px-3 py-2 text-stone-300">
            uvicorn app.main:app --reload
            <span className="text-muted ml-2"># mock automático</span>
          </code>
          <code className="bg-panel2 border border-border rounded-lg px-3 py-2 text-stone-300">
            LVE_PORT=/dev/tty.usbmodem… uvicorn app.main:app --reload
            <span className="text-muted ml-2"># hardware real</span>
          </code>
          <code className="bg-panel2 border border-border rounded-lg px-3 py-2 text-stone-300">
            LVE_MOCK=1 uvicorn app.main:app --reload
            <span className="text-muted ml-2"># forzar mock</span>
          </code>
        </div>
      </div>
    </div>
  );
}

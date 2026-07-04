import { motion } from 'framer-motion';
import { useStatus } from '../../hooks/useStatus';

export function Topbar() {
  const { data: status, isError } = useStatus();
  const connected = status?.serial_connected && status?.esp_ready;
  const connLabel = isError ? 'Sin conexión' : connected ? 'Conectado' : 'Mock';
  const position = status?.position ?? '—';

  return (
    <header className="h-14 shrink-0 border-b border-border bg-panel backdrop-blur-md flex items-center justify-between px-6 z-50">
      {/* Brand */}
      <div className="flex items-center gap-3">
        {/* Marca biomolecular */}
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="4" fill="#1d6b52" />
          <circle cx="11" cy="3"  r="2" fill="#27916a" opacity="0.7" />
          <circle cx="11" cy="19" r="2" fill="#27916a" opacity="0.7" />
          <circle cx="3"  cy="11" r="2" fill="#27916a" opacity="0.5" />
          <circle cx="19" cy="11" r="2" fill="#27916a" opacity="0.5" />
          <line x1="11" y1="5" x2="11" y2="7" stroke="#1d6b52" strokeWidth="1.5"/>
          <line x1="11" y1="15" x2="11" y2="17" stroke="#1d6b52" strokeWidth="1.5"/>
          <line x1="5" y1="11" x2="7" y2="11" stroke="#1d6b52" strokeWidth="1.5"/>
          <line x1="15" y1="11" x2="17" y2="11" stroke="#1d6b52" strokeWidth="1.5"/>
        </svg>
        <div className="flex items-baseline gap-2">
          <span className="text-stone-100 font-bold text-base tracking-tight">LVE</span>
          <span className="text-muted text-xs hidden sm:inline uppercase tracking-widest font-medium">
            · biofabricación
          </span>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-4">
        <span className="text-muted text-xs tabular-nums font-mono hidden sm:inline">
          pos {position}
        </span>
        <div className="flex items-center gap-2 bg-panel2 border border-border rounded-full px-3 py-1.5">
          <motion.span
            className={`inline-block w-1.5 h-1.5 rounded-full ${
              connected ? 'bg-extrude shadow-[0_0_6px_#27916a]' : 'bg-stone-600'
            }`}
            animate={connected ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
          <span className={`text-xs font-medium ${connected ? 'text-extrude' : 'text-muted'}`}>
            {connLabel}
          </span>
        </div>
      </div>
    </header>
  );
}

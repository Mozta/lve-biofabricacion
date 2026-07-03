import { motion } from 'framer-motion';
import { useStatus } from '../../hooks/useStatus';

export function Topnav({ views, active, onSelect }) {
  const { data: status, isError } = useStatus();
  const connected = status?.serial_connected && status?.esp_ready;
  const connLabel = isError ? 'Sin conexión' : connected ? 'Conectado' : 'Mock';
  const position = status?.position ?? '—';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-panel/80 backdrop-blur-md">
      {/* Fila superior: brand + estado */}
      <div className="flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold text-lg tracking-tight">LVE</span>
          <span className="text-zinc-500 text-sm">· control de extrusión</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted text-xs tabular-nums">pos {position}</span>
          <div className="flex items-center gap-1.5">
            <motion.span
              className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-extrude shadow-[0_0_6px_#10b981]' : 'bg-zinc-600'}`}
              animate={connected ? { scale: [1, 1.4, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            />
            <span className={`text-xs ${connected ? 'text-extrude' : 'text-muted'}`}>
              {connLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Fila de tabs */}
      <nav className="tabs-scroll flex overflow-x-auto border-t border-border">
        {Object.entries(views).map(([key, { label, icon: Icon }]) => {
          const isActive = active === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(key)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors duration-150
                ${isActive
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-transparent text-muted hover:text-zinc-300 hover:bg-white/5'
                }
              `}
            >
              <Icon size={14} />
              {label}
            </motion.button>
          );
        })}
      </nav>
    </header>
  );
}

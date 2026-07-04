import { motion } from 'framer-motion';

export function Sidebar({ views, active, onSelect }) {
  return (
    <aside className="w-48 shrink-0 bg-panel border-r border-border flex flex-col py-4 overflow-y-auto">
      <nav className="flex flex-col gap-0.5 px-3">
        {Object.entries(views).map(([key, { label, icon: Icon }]) => {
          const isActive = active === key;
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelect(key)}
              className={`
                group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 text-left w-full
                ${isActive
                  ? 'bg-accent/15 text-accent border border-accent/25'
                  : 'text-muted border border-transparent hover:bg-white/4 hover:text-stone-200'
                }
              `}
            >
              <Icon
                size={15}
                className={`shrink-0 ${isActive ? 'text-accent' : 'text-muted group-hover:text-stone-400'}`}
              />
              {label}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer decorativo */}
      <div className="mt-auto px-5 pb-2">
        <p className="text-muted/40 text-[10px] uppercase tracking-widest font-medium">
          Fase 1
        </p>
      </div>
    </aside>
  );
}

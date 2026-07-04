import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

export function Sidebar({ views, active, onSelect, theme, onToggleTheme }) {
  const isLight = theme === 'light';

  return (
    <aside className="w-48 shrink-0 flex flex-col py-4 overflow-y-auto
      bg-panel backdrop-blur-md border-r border-border">
      <nav className="flex flex-col gap-0.5 px-3 flex-1">
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
                  ? 'bg-accent/15 text-accent border border-accent/25 backdrop-blur-sm'
                  : 'text-muted border border-transparent hover:bg-white/5 hover:text-stone-200'
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

      {/* ── Toggle dark/light ── */}
      <div className="px-3 pb-1 pt-3 border-t border-border mt-2">
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={onToggleTheme}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg
            text-xs font-medium text-muted border border-border
            hover:bg-white/5 hover:text-stone-200 transition-all duration-150"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            {isLight
              ? <Moon size={14} className="text-accent" />
              : <Sun size={14} className="text-retract" />
            }
          </motion.div>
          {isLight ? 'Dark mode' : 'Light mode'}
        </motion.button>
        <p className="text-muted/30 text-[10px] uppercase tracking-widest font-medium mt-3 px-1">
          Fase 1
        </p>
      </div>
    </aside>
  );
}

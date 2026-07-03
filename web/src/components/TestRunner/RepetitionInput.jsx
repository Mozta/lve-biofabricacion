import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CornerDownLeft } from 'lucide-react';

export default function RepetitionInput({ rep, total, value, onChange, onSubmit, disabled }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, [rep]);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-accent/5 border border-accent/25 rounded-xl px-4 py-3">
      <span className="text-sm text-muted whitespace-nowrap">
        Rep <strong className="text-zinc-100">{rep}/{total}</strong> — masa (g):
      </span>
      <input
        ref={ref}
        type="number"
        step="0.001"
        min="0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
        placeholder="p.ej. 1.024"
        className="
          flex-1 bg-panel2 border border-border rounded-xl px-3 py-2
          text-zinc-100 text-sm tabular-nums
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
          transition placeholder:text-muted/50
        "
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        disabled={disabled || value === ''}
        onClick={onSubmit}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-extrude text-bg text-sm font-semibold hover:bg-emerald-400 transition disabled:opacity-40"
      >
        <CornerDownLeft size={14} /> Enter
      </motion.button>
    </div>
  );
}

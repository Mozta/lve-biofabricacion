import { motion } from 'framer-motion';

const fieldClass = `
  w-full bg-panel2 border border-border rounded-xl px-3 py-2.5
  text-zinc-100 text-sm
  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
  transition placeholder:text-muted/50
`;

export default function TestForm({ form, setForm, onStart, disabled }) {
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="bg-panel border border-border rounded-2xl p-5">
      <h2 className="text-base font-semibold text-zinc-100 mb-4">Nueva prueba de extrusión</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Repeticiones
          <input type="number" min="1" className={fieldClass} value={form.n_reps} onChange={upd('n_reps')} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Pasos por repetición
          <input type="number" min="1" className={fieldClass} value={form.steps_per_rep} onChange={upd('steps_per_rep')} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Velocidad (ms/micro-paso)
          <input type="number" min="1" className={fieldClass} value={form.speed_ms} onChange={upd('speed_ms')} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Pausa entre reps (ms)
          <input type="number" min="0" className={fieldClass} value={form.pause_ms} onChange={upd('pause_ms')} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted">
          Masa esperada (g, opcional)
          <input type="number" step="0.001" min="0" className={fieldClass}
            value={form.expected_mass_g} onChange={upd('expected_mass_g')}
            placeholder="para calcular %error" />
        </label>
        <label className="flex flex-col gap-1.5 text-sm text-muted sm:col-span-2">
          Notas (opcional)
          <input type="text" className={fieldClass}
            value={form.notes} onChange={upd('notes')}
            placeholder="aguja 18G, biomaterial X, 8V/1A…" />
        </label>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={disabled}
        onClick={onStart}
        className="w-full py-3 rounded-xl bg-extrude text-bg font-semibold text-sm hover:bg-emerald-400 transition disabled:opacity-50"
      >
        Iniciar prueba
      </motion.button>
    </div>
  );
}

import { motion } from 'framer-motion';

const fieldClass = `
  w-full bg-panel2 border border-border rounded-xl px-3 py-2.5
  text-stone-100 text-sm
  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/25
  transition placeholder:text-muted/50
`;

export default function TestForm({ form, setForm, onStart, disabled }) {
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="bg-panel backdrop-blur-md border border-border rounded-xl p-5">
      <h2 className="text-sm font-semibold text-stone-100 mb-4">Nueva prueba de extrusión</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {[
          { label: 'Repeticiones',               key: 'n_reps',        type: 'number', min: 1 },
          { label: 'Pasos por repetición',       key: 'steps_per_rep', type: 'number', min: 1 },
          { label: 'Velocidad (ms/micro-paso)',  key: 'speed_ms',      type: 'number', min: 1 },
          { label: 'Pausa entre reps (ms)',      key: 'pause_ms',      type: 'number', min: 0 },
        ].map(({ label, key, type, min }) => (
          <label key={key} className="flex flex-col gap-1.5 text-xs font-medium text-muted uppercase tracking-wide">
            {label}
            <input type={type} min={min} className={fieldClass}
              value={form[key]} onChange={upd(key)} />
          </label>
        ))}
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted uppercase tracking-wide">
          Masa esperada (g, opcional)
          <input type="number" step="0.001" min="0" className={fieldClass}
            value={form.expected_mass_g} onChange={upd('expected_mass_g')}
            placeholder="para calcular %error" />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-medium text-muted uppercase tracking-wide sm:col-span-2">
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
        className="w-full py-3 rounded-xl bg-extrude text-white font-semibold text-sm
          hover:bg-accent transition disabled:opacity-40"
      >
        Iniciar prueba
      </motion.button>
    </div>
  );
}

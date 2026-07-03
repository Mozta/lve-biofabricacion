export default function TestForm({ form, setForm, onStart, disabled }) {
  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="card test-form">
      <h2>Nueva prueba de extrusión</h2>
      <div className="grid">
        <label>
          Repeticiones
          <input type="number" min="1" value={form.n_reps} onChange={upd('n_reps')} />
        </label>
        <label>
          Pasos por repetición
          <input type="number" min="1" value={form.steps_per_rep} onChange={upd('steps_per_rep')} />
        </label>
        <label>
          Velocidad (ms/micro-paso)
          <input type="number" min="1" value={form.speed_ms} onChange={upd('speed_ms')} />
        </label>
        <label>
          Pausa entre reps (ms)
          <input type="number" min="0" value={form.pause_ms} onChange={upd('pause_ms')} />
        </label>
        <label>
          Masa esperada (g, opcional)
          <input
            type="number"
            step="0.001"
            min="0"
            value={form.expected_mass_g}
            onChange={upd('expected_mass_g')}
            placeholder="para calcular %error"
          />
        </label>
        <label className="wide">
          Notas (opcional)
          <input
            type="text"
            value={form.notes}
            onChange={upd('notes')}
            placeholder="aguja 18G, biomaterial X, 8V/1A…"
          />
        </label>
      </div>
      <button className="btn extrude big" disabled={disabled} onClick={onStart}>
        Iniciar prueba
      </button>
    </div>
  );
}

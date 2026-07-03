import { useEffect, useRef } from 'react';

// Captura de masa inline (no modal) con autofocus y Enter para confirmar/avanzar,
// para no perder el ritmo de laboratorio.
export default function RepetitionInput({ rep, total, value, onChange, onSubmit, disabled }) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.focus();
  }, [rep]);

  return (
    <div className="rep-input">
      <span className="rep-label">
        Repetición {rep}/{total} — masa medida (g):
      </span>
      <input
        ref={ref}
        type="number"
        step="0.001"
        min="0"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSubmit();
        }}
        placeholder="p. ej. 1.024"
      />
      <button className="btn extrude" disabled={disabled || value === ''} onClick={onSubmit}>
        Enter ↵
      </button>
    </div>
  );
}

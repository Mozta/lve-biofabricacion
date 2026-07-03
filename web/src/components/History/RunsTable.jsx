import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

const fmt = (v, d = 3) => (v != null ? v.toFixed(d) : '—');
const pct = (v) => (v != null ? `${v.toFixed(1)}%` : '—');

export default function RunsTable() {
  const { data: tests, isLoading, isError } = useQuery({
    queryKey: ['tests'],
    queryFn: api.listTests,
  });

  return (
    <div className="view">
      <h1>Historial</h1>
      {isLoading && <p className="muted">Cargando…</p>}
      {isError && <p className="cb-error">No se pudo cargar el historial.</p>}
      {tests && tests.length === 0 && <p className="muted">Aún no hay corridas.</p>}

      {tests && tests.length > 0 && (
        <table className="results wide">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Reps</th>
              <th>Pasos/rep</th>
              <th>Media (g)</th>
              <th>Stdev</th>
              <th>%CV</th>
              <th>%Error</th>
              <th>Notas</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{fmtDate(t.created_at)}</td>
                <td>{t.n_reps}</td>
                <td>{t.steps_per_rep}</td>
                <td>{fmt(t.stats?.mean)}</td>
                <td>{fmt(t.stats?.stdev)}</td>
                <td>{pct(t.stats?.cv)}</td>
                <td>{pct(t.stats?.error_pct)}</td>
                <td className="notes">{t.notes || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <p className="hint">Gráfica por repetición y export CSV: Fase 2.</p>
    </div>
  );
}

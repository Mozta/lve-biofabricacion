import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client.js';

function fmtDate(iso) {
  try { return new Date(iso).toLocaleString(); }
  catch { return iso; }
}

const fmt = (v, d = 3) => (v != null ? v.toFixed(d) : '—');
const pct = (v) => (v != null ? `${v.toFixed(1)}%` : '—');

export default function RunsTable() {
  const { data: tests, isLoading, isError } = useQuery({
    queryKey: ['tests'],
    queryFn: api.listTests,
  });

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Historial</h1>
        <p className="text-muted text-sm mt-1">Corridas de extrusión guardadas</p>
      </div>

      {isLoading && <p className="text-muted text-sm">Cargando…</p>}

      {isError && (
        <p className="text-stop text-sm bg-stop/10 border border-stop/30 rounded-xl px-4 py-3">
          No se pudo cargar el historial.
        </p>
      )}

      {tests && tests.length === 0 && (
        <p className="text-muted text-sm">Aún no hay corridas guardadas.</p>
      )}

      {tests && tests.length > 0 && (
        <div className="overflow-x-auto bg-panel border border-border rounded-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['#', 'Fecha', 'Reps', 'Pasos/rep', 'Media (g)', 'Stdev', '%CV', '%Error', 'Notas'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} className="border-b border-border/50 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-muted tabular-nums">{t.id}</td>
                  <td className="px-4 py-3 text-zinc-300 whitespace-nowrap text-xs">{fmtDate(t.created_at)}</td>
                  <td className="px-4 py-3 tabular-nums">{t.n_reps}</td>
                  <td className="px-4 py-3 tabular-nums">{t.steps_per_rep}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{fmt(t.stats?.mean)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{fmt(t.stats?.stdev)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{pct(t.stats?.cv)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums">{pct(t.stats?.error_pct)}</td>
                  <td className="px-4 py-3 text-muted text-xs max-w-xs truncate">{t.notes || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-muted text-xs mt-5">Gráfica por repetición y export CSV: Fase 2.</p>
    </div>
  );
}

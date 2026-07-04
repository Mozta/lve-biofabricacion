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
        <p className="text-muted text-xs uppercase tracking-widest font-medium mb-1">Corridas guardadas</p>
        <h1 className="text-2xl font-bold text-stone-100">Historial</h1>
      </div>

      {isLoading && <p className="text-muted text-sm">Cargando…</p>}

      {isError && (
        <p className="text-stop text-sm bg-stop/8 border border-stop/20 rounded-xl px-4 py-3">
          No se pudo cargar el historial.
        </p>
      )}

      {tests && tests.length === 0 && (
        <p className="text-muted text-sm">Aún no hay corridas guardadas.</p>
      )}

      {tests && tests.length > 0 && (
        <div className="overflow-x-auto bg-panel backdrop-blur-md border border-border rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-panel2">
                {['#', 'Fecha', 'Reps', 'Pasos/rep', 'Media (g)', 'Stdev', '%CV', '%Error', 'Notas'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-muted uppercase tracking-wide font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id} className="border-b border-white/4 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-muted tabular-nums font-mono">{t.id}</td>
                  <td className="px-4 py-3 text-stone-400 whitespace-nowrap text-xs font-mono">{fmtDate(t.created_at)}</td>
                  <td className="px-4 py-3 text-stone-200 tabular-nums">{t.n_reps}</td>
                  <td className="px-4 py-3 text-stone-200 tabular-nums font-mono">{t.steps_per_rep}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-stone-100">{fmt(t.stats?.mean)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-stone-300">{fmt(t.stats?.stdev)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-stone-300">{pct(t.stats?.cv)}</td>
                  <td className="px-4 py-3 font-mono tabular-nums text-stone-300">{pct(t.stats?.error_pct)}</td>
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

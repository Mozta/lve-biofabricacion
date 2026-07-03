export default function LiveResultsTable({ results }) {
  if (results.length === 0) return null;
  const mean = results.reduce((a, r) => a + r.mass_g, 0) / results.length;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 pr-4 text-xs text-muted uppercase tracking-wide font-medium">#</th>
            <th className="text-left py-2 pr-4 text-xs text-muted uppercase tracking-wide font-medium">Masa (g)</th>
            <th className="text-left py-2 text-xs text-muted uppercase tracking-wide font-medium">Desv. vs media parcial</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => {
            const dev = r.mass_g - mean;
            return (
              <tr key={r.rep_number} className="border-b border-border/50">
                <td className="py-2 pr-4 text-muted tabular-nums">{r.rep_number}</td>
                <td className="py-2 pr-4 text-zinc-100 tabular-nums font-mono">{r.mass_g.toFixed(3)}</td>
                <td className={`py-2 tabular-nums font-mono ${dev >= 0 ? 'text-extrude' : 'text-retract'}`}>
                  {dev >= 0 ? '+' : ''}{dev.toFixed(3)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

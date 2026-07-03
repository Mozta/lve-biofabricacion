export default function LiveResultsTable({ results }) {
  if (results.length === 0) return null;
  const mean = results.reduce((a, r) => a + r.mass_g, 0) / results.length;

  return (
    <table className="results">
      <thead>
        <tr>
          <th>#</th>
          <th>Masa (g)</th>
          <th>Desv. vs media parcial</th>
        </tr>
      </thead>
      <tbody>
        {results.map((r) => {
          const dev = r.mass_g - mean;
          return (
            <tr key={r.rep_number}>
              <td>{r.rep_number}</td>
              <td>{r.mass_g.toFixed(3)}</td>
              <td className={dev >= 0 ? 'pos' : 'neg'}>
                {dev >= 0 ? '+' : ''}
                {dev.toFixed(3)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

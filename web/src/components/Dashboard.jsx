import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client.js';
import { useStatus } from '../hooks/useStatus.js';

export default function Dashboard({ onNavigate }) {
  const { data: status } = useStatus();
  const { data: tests } = useQuery({ queryKey: ['tests'], queryFn: api.listTests });
  const last = tests?.[0];

  return (
    <div className="view">
      <h1>Panel</h1>
      <div className="cards">
        <div className="card">
          <div className="card-title">Conexión</div>
          <div className="big">{status?.serial_connected ? 'OK' : '—'}</div>
          <div className="muted">posición actual: {status?.position ?? '—'}</div>
        </div>

        <div className="card">
          <div className="card-title">Última corrida</div>
          {last ? (
            <>
              <div className="big">
                {last.stats?.mean != null ? `${last.stats.mean.toFixed(3)} g` : '—'}
              </div>
              <div className="muted">
                {last.n_reps} reps
                {last.stats?.cv != null ? ` · CV ${last.stats.cv.toFixed(1)}%` : ''}
                {last.stats?.error_pct != null ? ` · error ${last.stats.error_pct.toFixed(1)}%` : ''}
              </div>
            </>
          ) : (
            <div className="muted">
              Aún no hay corridas.{' '}
              <button className="link" onClick={() => onNavigate('pruebas')}>
                Iniciar una prueba →
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="hint">
        El control manual (jog) está siempre disponible en la barra inferior, en cualquier vista.
      </p>
    </div>
  );
}

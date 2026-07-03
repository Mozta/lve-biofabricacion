import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';
import { computeStats } from '../../utils/stats.js';
import TestForm from './TestForm.jsx';
import RepetitionInput from './RepetitionInput.jsx';
import LiveResultsTable from './LiveResultsTable.jsx';

const DEFAULT_FORM = {
  n_reps: 5,
  steps_per_rep: 200,
  speed_ms: 5,
  pause_ms: 0,
  expected_mass_g: '',
  notes: '',
};

// Estados: idle -> (extruding <-> awaiting-mass [/ pausing]) -> done
export default function TestRunner() {
  const qc = useQueryClient();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [phase, setPhase] = useState('idle');
  const [testId, setTestId] = useState(null);
  const [currentRep, setCurrentRep] = useState(0);
  const [results, setResults] = useState([]);
  const [massInput, setMassInput] = useState('');
  const [error, setError] = useState(null);

  const nReps = Number(form.n_reps);
  const expected = form.expected_mass_g === '' ? null : Number(form.expected_mass_g);
  const running = phase !== 'idle' && phase !== 'done';
  const stats = computeStats(results.map((r) => r.mass_g), expected);

  async function extrudeRep(rep) {
    setPhase('extruding');
    setError(null);
    try {
      await api.extrude(Number(form.steps_per_rep), Number(form.speed_ms) || undefined);
      qc.invalidateQueries({ queryKey: ['status'] });
    } catch (e) {
      setError(`Extrusión rep ${rep}: ${e.message}`);
    }
    setPhase('awaiting-mass');
  }

  async function start() {
    setError(null);
    try {
      const t = await api.createTest({
        n_reps: nReps,
        steps_per_rep: Number(form.steps_per_rep),
        speed_ms: Number(form.speed_ms) || null,
        expected_mass_g: expected,
        notes: form.notes || null,
      });
      setTestId(t.id);
      setResults([]);
      setMassInput('');
      setCurrentRep(1);
      await extrudeRep(1);
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  }

  async function submitMass() {
    if (massInput === '') return;
    const mass = Number(massInput);
    try {
      await api.addRepetition(testId, currentRep, mass);
    } catch (e) {
      setError(e.message);
      return;
    }
    setResults((prev) => [...prev, { rep_number: currentRep, mass_g: mass }]);
    setMassInput('');

    if (currentRep < nReps) {
      const pause = Number(form.pause_ms) || 0;
      if (pause > 0) {
        setPhase('pausing');
        await new Promise((r) => setTimeout(r, pause));
      }
      const next = currentRep + 1;
      setCurrentRep(next);
      await extrudeRep(next);
    } else {
      setPhase('done');
      qc.invalidateQueries({ queryKey: ['tests'] });
    }
  }

  function reset() {
    setPhase('idle');
    setTestId(null);
    setCurrentRep(0);
    setResults([]);
    setMassInput('');
    setError(null);
  }

  return (
    <div className="view">
      <h1>Pruebas</h1>

      {phase === 'idle' && (
        <TestForm form={form} setForm={setForm} onStart={start} disabled={running} />
      )}

      {running && (
        <div className="card runner">
          <div className="runner-head">
            <span className="badge">Corrida #{testId}</span>
            <span>
              Rep {Math.min(currentRep, nReps)}/{nReps}
            </span>
            <span className={`phase ${phase}`}>
              {phase === 'extruding' && 'Extruyendo…'}
              {phase === 'awaiting-mass' && 'Esperando masa'}
              {phase === 'pausing' && 'Pausa entre reps…'}
            </span>
          </div>

          {phase === 'awaiting-mass' && (
            <RepetitionInput
              rep={currentRep}
              total={nReps}
              value={massInput}
              onChange={setMassInput}
              onSubmit={submitMass}
            />
          )}

          <LiveResultsTable results={results} />

          {stats.n > 0 && (
            <div className="partial-stats muted">
              media parcial {stats.mean.toFixed(3)} g · stdev {stats.stdev.toFixed(3)}
            </div>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="card summary">
          <h2>Resumen — corrida #{testId}</h2>
          <div className="stat-grid">
            <div>
              <span className="muted">Media</span>
              <strong>{stats.mean.toFixed(3)} g</strong>
            </div>
            <div>
              <span className="muted">Desv. estándar</span>
              <strong>{stats.stdev.toFixed(3)} g</strong>
            </div>
            <div>
              <span className="muted">%CV</span>
              <strong>{stats.cv != null ? `${stats.cv.toFixed(2)}%` : '—'}</strong>
            </div>
            <div>
              <span className="muted">%Error</span>
              <strong>{stats.error_pct != null ? `${stats.error_pct.toFixed(2)}%` : '—'}</strong>
            </div>
          </div>
          <LiveResultsTable results={results} />
          <p className="muted">Guardada en la base de datos. Revísala en Historial.</p>
          <button className="btn extrude" onClick={reset}>
            Nueva prueba
          </button>
        </div>
      )}

      {error && (
        <div className="cb-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

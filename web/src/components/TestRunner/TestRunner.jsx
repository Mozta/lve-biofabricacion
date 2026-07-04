import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
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

const PHASE_LABEL = {
  extruding:       { text: 'Extruyendo…',       color: 'bg-accent/10 text-accent' },
  'awaiting-mass': { text: 'Esperando masa',     color: 'bg-extrude/10 text-extrude' },
  pausing:         { text: 'Pausa entre reps…',  color: 'bg-retract/10 text-retract' },
};

export default function TestRunner() {
  const qc = useQueryClient();
  const [form, setForm]             = useState(DEFAULT_FORM);
  const [phase, setPhase]           = useState('idle');
  const [testId, setTestId]         = useState(null);
  const [currentRep, setCurrentRep] = useState(0);
  const [results, setResults]       = useState([]);
  const [massInput, setMassInput]   = useState('');
  const [error, setError]           = useState(null);

  const nReps    = Number(form.n_reps);
  const expected = form.expected_mass_g === '' ? null : Number(form.expected_mass_g);
  const running  = phase !== 'idle' && phase !== 'done';
  const stats    = computeStats(results.map((r) => r.mass_g), expected);

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

  const phaseInfo = PHASE_LABEL[phase];

  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="text-muted text-xs uppercase tracking-widest font-medium mb-1">Captura de masa</p>
        <h1 className="text-2xl font-bold text-stone-100">Pruebas</h1>
      </div>

      {phase === 'idle' && (
        <TestForm form={form} setForm={setForm} onStart={start} disabled={running} />
      )}

      {running && (
        <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="bg-accent/12 text-accent text-xs font-semibold px-3 py-1 rounded-full">
              Corrida #{testId}
            </span>
            <span className="text-sm text-stone-300">
              Rep <strong className="text-stone-100">{Math.min(currentRep, nReps)}</strong>/{nReps}
            </span>
            {phaseInfo && (
              <span className={`text-xs font-medium px-3 py-1 rounded-full ${phaseInfo.color}`}>
                {phaseInfo.text}
              </span>
            )}
          </div>

          {phase === 'awaiting-mass' && (
            <RepetitionInput
              rep={currentRep} total={nReps}
              value={massInput} onChange={setMassInput} onSubmit={submitMass}
            />
          )}

          <LiveResultsTable results={results} />

          {stats.n > 0 && (
            <p className="text-muted text-xs font-mono">
              Media parcial <strong className="text-stone-300">{stats.mean.toFixed(3)} g</strong>
              {' · '}stdev <strong className="text-stone-300">{stats.stdev.toFixed(3)}</strong>
            </p>
          )}
        </div>
      )}

      {phase === 'done' && (
        <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-5">
          <h2 className="text-base font-semibold text-stone-100">Resumen — corrida #{testId}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Media',          value: `${stats.mean.toFixed(3)} g` },
              { label: 'Desv. estándar', value: `${stats.stdev.toFixed(3)} g` },
              { label: '%CV',            value: stats.cv != null ? `${stats.cv.toFixed(2)}%` : '—' },
              { label: '%Error',         value: stats.error_pct != null ? `${stats.error_pct.toFixed(2)}%` : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-panel2 border border-border rounded-xl p-3">
                <p className="text-muted text-xs">{label}</p>
                <p className="text-stone-100 font-bold text-lg tabular-nums mt-1 font-mono">{value}</p>
              </div>
            ))}
          </div>
          <LiveResultsTable results={results} />
          <p className="text-muted text-sm">Guardada en la base de datos. Revísala en Historial.</p>
          <motion.button
            whileTap={{ scale: 0.97 }} onClick={reset}
            className="w-fit px-5 py-2.5 rounded-xl bg-extrude text-white font-semibold text-sm
              hover:bg-accent transition"
          >
            Nueva prueba
          </motion.button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-stop text-sm bg-stop/8 border border-stop/20
          rounded-xl px-4 py-3 mt-4">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

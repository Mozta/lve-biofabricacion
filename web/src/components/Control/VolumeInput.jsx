import { useState } from 'react';
import { motion } from 'framer-motion';
import { mlToSteps } from '../../utils/extruderMath';

const ML_PRESETS = [1, 5, 10, 20, 30];
const STEP_PRESETS = [100, 500, 1000];
const DEFAULTS = { syringeIdMm: 29, stepsPerMm: 160 };

const inputClass = `
  w-full bg-panel2 border border-border rounded-xl px-4 py-3
  text-2xl font-bold text-stone-100 tabular-nums font-mono
  focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
  transition
`;

export function VolumeInput({ calibration, onStepsChange, onSpeedChange, speed }) {
  const [mode, setMode]         = useState('ml');
  const [mlValue, setMlValue]   = useState('5');
  const [stepsValue, setStepsValue] = useState('200');

  const cal  = calibration ?? DEFAULTS;
  const idMm = cal.syringe_id_mm ?? DEFAULTS.syringeIdMm;
  const spmm = cal.steps_per_mm  ?? DEFAULTS.stepsPerMm;

  function handleMlChange(val) {
    setMlValue(val);
    onStepsChange(mlToSteps(parseFloat(val) || 0, idMm, spmm));
  }
  function handleStepsChange(val) {
    setStepsValue(val);
    onStepsChange(parseInt(val, 10) || 0);
  }
  function setMlPreset(ml) {
    setMlValue(String(ml));
    onStepsChange(mlToSteps(ml, idMm, spmm));
  }
  function setStepsPreset(s) {
    setStepsValue(String(s));
    onStepsChange(s);
  }

  const isMl = mode === 'ml';

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle modo */}
      <div className="flex rounded-lg bg-panel2 p-0.5 w-fit border border-border">
        {['ml', 'steps'].map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 uppercase tracking-wide ${
              mode === m ? 'bg-accent text-white' : 'text-muted hover:text-stone-300'
            }`}
          >
            {m === 'ml' ? 'mL' : 'Pasos'}
          </motion.button>
        ))}
      </div>

      {/* Input principal */}
      <div>
        <label className="text-xs font-medium text-muted uppercase tracking-widest mb-1.5 block">
          {isMl ? 'Volumen a extruir' : 'Pasos del motor'}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step={isMl ? '0.5' : '1'}
            value={isMl ? mlValue : stepsValue}
            onChange={(e) => isMl ? handleMlChange(e.target.value) : handleStepsChange(e.target.value)}
            className={inputClass}
          />
          <span className="text-muted text-sm font-medium w-10 shrink-0">{isMl ? 'mL' : 'pas'}</span>
        </div>
        {isMl && (
          <p className="text-xs text-muted mt-1.5 tabular-nums font-mono">
            ≈ {mlToSteps(parseFloat(mlValue) || 0, idMm, spmm).toLocaleString()} pasos
          </p>
        )}
      </div>

      {/* Presets */}
      <div>
        <label className="text-xs font-medium text-muted uppercase tracking-widest mb-1.5 block">Presets</label>
        <div className="flex flex-wrap gap-2">
          {(isMl ? ML_PRESETS : STEP_PRESETS).map((val) => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.93 }}
              onClick={() => isMl ? setMlPreset(val) : setStepsPreset(val)}
              className="px-3 py-1.5 rounded-lg border border-border bg-panel2 text-xs text-muted
                hover:border-accent/50 hover:text-extrude hover:bg-accent/8 transition-colors"
            >
              {isMl ? `${val} mL` : val}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Velocidad */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium text-muted uppercase tracking-widest">
            Velocidad <span className="normal-case font-normal">(ms/paso)</span>
          </label>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            speed <= 3  ? 'bg-extrude/12 text-extrude' :
            speed >= 15 ? 'bg-retract/12 text-retract' :
            'bg-white/5 text-muted'
          }`}>
            {speed <= 3 ? 'Rápido' : speed >= 15 ? 'Lento' : 'Normal'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="1" max="30" step="1"
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value, 10))}
            className="flex-1"
            style={{ '--range-pct': `${((speed - 1) / 29) * 100}%` }}
          />
          <span className="font-mono text-stone-100 text-sm w-6 text-right tabular-nums shrink-0">
            {speed}
          </span>
          <span className="text-muted text-xs shrink-0">ms</span>
        </div>
      </div>
    </div>
  );
}

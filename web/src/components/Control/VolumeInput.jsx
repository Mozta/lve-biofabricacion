import { useState } from 'react';
import { motion } from 'framer-motion';
import { mlToSteps } from '../../utils/extruderMath';

const ML_PRESETS = [1, 5, 10, 20, 30];
const STEP_PRESETS = [100, 500, 1000];

const DEFAULTS = { syringeIdMm: 26.7, stepsPerMm: 160 };

export function VolumeInput({ calibration, onStepsChange, onSpeedChange, speed, steps }) {
  const [mode, setMode] = useState('ml');
  const [mlValue, setMlValue] = useState('5');
  const [stepsValue, setStepsValue] = useState('200');

  const cal = calibration ?? DEFAULTS;

  function handleMlChange(val) {
    setMlValue(val);
    const s = mlToSteps(parseFloat(val) || 0, cal.syringe_id_mm ?? DEFAULTS.syringeIdMm, cal.steps_per_mm ?? DEFAULTS.stepsPerMm);
    onStepsChange(s);
  }

  function handleStepsChange(val) {
    setStepsValue(val);
    onStepsChange(parseInt(val, 10) || 0);
  }

  function setMlPreset(ml) {
    setMlValue(String(ml));
    const s = mlToSteps(ml, cal.syringe_id_mm ?? DEFAULTS.syringeIdMm, cal.steps_per_mm ?? DEFAULTS.stepsPerMm);
    onStepsChange(s);
  }

  function setStepsPreset(s) {
    setStepsValue(String(s));
    onStepsChange(s);
  }

  const isMl = mode === 'ml';

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle modo */}
      <div className="flex rounded-lg bg-panel2 p-1 w-fit border border-border">
        {['ml', 'steps'].map((m) => (
          <motion.button
            key={m}
            whileTap={{ scale: 0.96 }}
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
              mode === m ? 'bg-accent text-bg' : 'text-muted hover:text-zinc-300'
            }`}
          >
            {m === 'ml' ? 'mL' : 'Pasos'}
          </motion.button>
        ))}
      </div>

      {/* Input principal */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1.5 block">
          {isMl ? 'Volumen a extruir' : 'Pasos del motor'}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            step={isMl ? '0.5' : '1'}
            value={isMl ? mlValue : stepsValue}
            onChange={(e) => isMl ? handleMlChange(e.target.value) : handleStepsChange(e.target.value)}
            className="
              w-full bg-panel2 border border-border rounded-xl px-4 py-3
              text-2xl font-bold text-zinc-100 tabular-nums
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
              transition
            "
          />
          <span className="text-muted text-sm font-medium w-10 shrink-0">{isMl ? 'mL' : 'paso'}</span>
        </div>
        {isMl && (
          <p className="text-xs text-muted mt-1.5 tabular-nums">
            ≈ {mlToSteps(parseFloat(mlValue) || 0, cal.syringe_id_mm ?? DEFAULTS.syringeIdMm, cal.steps_per_mm ?? DEFAULTS.stepsPerMm).toLocaleString()} pasos
          </p>
        )}
      </div>

      {/* Presets */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1.5 block">Presets</label>
        <div className="flex flex-wrap gap-2">
          {(isMl ? ML_PRESETS : STEP_PRESETS).map((val) => (
            <motion.button
              key={val}
              whileTap={{ scale: 0.93 }}
              onClick={() => isMl ? setMlPreset(val) : setStepsPreset(val)}
              className="px-3 py-1.5 rounded-lg border border-border bg-panel2 text-sm text-zinc-300 hover:border-accent/50 hover:text-accent transition-colors"
            >
              {isMl ? `${val} mL` : val}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Velocidad */}
      <div>
        <label className="text-xs text-muted uppercase tracking-widest mb-1.5 block">
          Velocidad <span className="normal-case text-muted">(ms/micro-paso)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="50"
            step="1"
            value={speed}
            onChange={(e) => onSpeedChange(parseInt(e.target.value, 10) || 5)}
            className="
              w-28 bg-panel2 border border-border rounded-xl px-4 py-2
              text-lg font-bold text-zinc-100 tabular-nums
              focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
              transition
            "
          />
          <span className="text-muted text-sm">ms</span>
          <span className={`ml-2 text-xs px-2 py-1 rounded-full ${speed <= 3 ? 'bg-extrude/20 text-extrude' : speed >= 15 ? 'bg-retract/20 text-retract' : 'bg-white/5 text-muted'}`}>
            {speed <= 3 ? 'Rápido' : speed >= 15 ? 'Lento' : 'Normal'}
          </span>
        </div>
      </div>
    </div>
  );
}

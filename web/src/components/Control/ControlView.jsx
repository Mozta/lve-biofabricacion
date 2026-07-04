import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, Square, ChevronRight, AlertCircle,
  Wifi, WifiOff, Pencil, Check, X,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useStatus } from '../../hooks/useStatus';
import { useExtruderControl } from '../../hooks/useExtruderControl';
import { SyringeVisual } from './SyringeVisual';
import { VolumeInput } from './VolumeInput';
import { stepsToMl } from '../../utils/extruderMath';

const FALLBACK_CAL = { syringe_id_mm: 29, steps_per_mm: 160, syringe_volume_ml: 60 };

export function ControlView() {
  const { data: status } = useStatus();
  const { data: cal } = useQuery({ queryKey: ['calibration'], queryFn: api.getCalibration });
  const { busy, error, extrude, retract, stop } = useExtruderControl();

  const [steps, setSteps]     = useState(311);
  const [speed, setSpeed]     = useState(5);
  const [lastDir, setLastDir] = useState(null);

  const [volOverride, setVolOverride] = useState(null);
  const [editingVol, setEditingVol]   = useState(false);
  const [editDraft, setEditDraft]     = useState('');

  const connected = status?.serial_connected && status?.esp_ready;
  const position  = status?.position ?? 0;

  const syringeIdMm = cal?.syringe_id_mm     ?? FALLBACK_CAL.syringe_id_mm;
  const stepsPerMm  = cal?.steps_per_mm      ?? FALLBACK_CAL.steps_per_mm;
  const volumeMl    = cal?.syringe_volume_ml ?? FALLBACK_CAL.syringe_volume_ml;

  let remainingMl;
  if (volOverride) {
    const extrudedSince = stepsToMl(position - volOverride.atPosition, syringeIdMm, stepsPerMm);
    remainingMl = Math.max(0, volOverride.ml - extrudedSince);
  } else {
    remainingMl = Math.max(0, volumeMl - stepsToMl(Math.max(0, position), syringeIdMm, stepsPerMm));
  }

  function handleVolumeChange(newMl) {
    setVolOverride({ ml: newMl, atPosition: position });
  }

  function applyVolOverride() {
    const ml = parseFloat(editDraft);
    if (!isNaN(ml) && ml >= 0 && ml <= volumeMl) {
      setVolOverride({ ml, atPosition: position });
    }
    setEditingVol(false);
    setEditDraft('');
  }

  function cancelEdit() {
    setEditingVol(false);
    setEditDraft('');
  }

  async function handleExtrude() {
    if (!steps || steps <= 0) return;
    setLastDir('extrude');
    await extrude(steps, speed);
    setLastDir(null);
  }

  async function handleRetract() {
    if (!steps || steps <= 0) return;
    setLastDir('retract');
    await retract(steps, speed);
    setLastDir(null);
  }

  const isExtruding = busy && lastDir === 'extrude';

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <p className="text-muted text-xs uppercase tracking-widest font-medium mb-1">Extrusión manual</p>
        <h1 className="text-2xl font-bold text-stone-100">Control</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* ─── Columna izquierda: Jeringa ─── */}
        <div className="flex flex-col items-center gap-4 bg-panel border border-border rounded-xl p-6">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-medium text-muted uppercase tracking-widest">Jeringa</span>
            <button
              onClick={() => { setEditDraft(remainingMl.toFixed(1)); setEditingVol(true); }}
              className="flex items-center gap-1.5 text-xs text-muted hover:text-extrude transition-colors px-2 py-1 rounded-lg hover:bg-extrude/8"
            >
              <Pencil size={11} />
              Ajustar volumen
            </button>
          </div>

          <AnimatePresence>
            {editingVol && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full overflow-hidden"
              >
                <div className="flex items-center gap-2 bg-accent/8 border border-accent/20 rounded-lg px-3 py-2.5 mb-1">
                  <span className="text-xs text-muted whitespace-nowrap">Volumen actual:</span>
                  <input
                    type="number"
                    min="0"
                    max={volumeMl}
                    step="0.5"
                    autoFocus
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') applyVolOverride(); if (e.key === 'Escape') cancelEdit(); }}
                    className="flex-1 min-w-0 bg-panel2 border border-border rounded-lg px-2 py-1 text-sm text-stone-100 tabular-nums font-mono focus:outline-none focus:border-accent"
                  />
                  <span className="text-xs text-muted">mL</span>
                  <button onClick={applyVolOverride} className="p-1 rounded-lg bg-accent text-white hover:bg-extrude transition">
                    <Check size={13} />
                  </button>
                  <button onClick={cancelEdit} className="p-1 rounded-lg bg-white/5 text-muted hover:bg-white/10 transition">
                    <X size={13} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <SyringeVisual
            remainingMl={remainingMl}
            volumeMl={volumeMl}
            busy={busy}
            isExtruding={isExtruding}
            onVolumeChange={handleVolumeChange}
          />

          {volOverride && (
            <p className="text-xs text-accent/60 italic">
              Ajustado manualmente — desde {volOverride.ml} mL
            </p>
          )}

          <div className="w-full border-t border-border pt-3 flex items-center justify-between text-xs text-muted">
            <span>Posición acumulada</span>
            <span className="font-mono text-stone-400">{position.toLocaleString()} pasos</span>
          </div>
        </div>

        {/* ─── Columna derecha: Controles ─── */}
        <div className="flex flex-col gap-4">
          <div className="bg-panel border border-border rounded-xl p-5">
            <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-4">Parámetros</h2>
            <VolumeInput
              calibration={cal}
              steps={steps}
              speed={speed}
              onStepsChange={setSteps}
              onSpeedChange={setSpeed}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={busy}
              onClick={handleRetract}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border text-sm font-semibold
                bg-retract/8 border-retract/30 text-retract hover:bg-retract/15 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <RotateCcw size={15} />
              Retraer
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={stop}
              className="px-5 py-4 rounded-xl bg-stop text-white font-bold text-sm
                hover:bg-red-700 transition-colors shadow-lg shadow-stop/25"
            >
              <Square size={17} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={busy}
              onClick={handleExtrude}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border text-sm font-semibold
                bg-extrude/8 border-extrude/30 text-extrude hover:bg-extrude/15 transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Extruir
              <ChevronRight size={15} />
            </motion.button>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-stop text-sm bg-stop/8 border border-stop/20 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
            connected ? 'bg-extrude/6 border-extrude/20' : 'bg-panel2 border-border'
          }`}>
            {connected
              ? <Wifi size={14} className="text-extrude shrink-0" />
              : <WifiOff size={14} className="text-muted shrink-0" />
            }
            <div>
              <p className={`text-sm font-medium ${connected ? 'text-extrude' : 'text-muted'}`}>
                {connected ? 'ESP32-C3 listo' : 'Sin hardware — modo mock'}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {connected ? 'Puerto serial activo' : 'Respuestas simuladas por el backend'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

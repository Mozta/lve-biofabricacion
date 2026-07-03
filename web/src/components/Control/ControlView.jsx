import { useState } from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Square, ChevronRight, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useStatus } from '../../hooks/useStatus';
import { useExtruderControl } from '../../hooks/useExtruderControl';
import { SyringeVisual } from './SyringeVisual';
import { VolumeInput } from './VolumeInput';

export function ControlView() {
  const { data: status } = useStatus();
  const { data: cal } = useQuery({ queryKey: ['calibration'], queryFn: api.getCalibration });
  const { busy, error, extrude, retract, stop } = useExtruderControl();

  const [steps, setSteps] = useState(285); // ~1 mL con parámetros por defecto
  const [speed, setSpeed] = useState(5);
  const [lastDir, setLastDir] = useState(null); // 'extrude' | 'retract'

  const connected = status?.serial_connected && status?.esp_ready;
  const position = status?.position ?? 0;

  async function handleExtrude() {
    if (!steps || steps <= 0) return;
    setLastDir('extrude');
    await extrude(steps, speed);
  }

  async function handleRetract() {
    if (!steps || steps <= 0) return;
    setLastDir('retract');
    await retract(steps, speed);
  }

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Control</h1>
        <p className="text-muted text-sm mt-1">Extrusión manual de biomaterial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Columna izquierda — visualización */}
        <div className="flex flex-col items-center gap-4 bg-panel border border-border rounded-2xl p-6">
          <h2 className="text-sm font-medium text-muted uppercase tracking-widest self-start">
            Jeringa
          </h2>
          <SyringeVisual
            position={position}
            busy={busy}
            extruding={lastDir === 'extrude'}
            syringeIdMm={cal?.syringe_id_mm ?? 26.7}
            stepsPerMm={cal?.steps_per_mm ?? 160}
            volumeMl={cal?.syringe_volume_ml ?? 60}
          />
          <div className="w-full border-t border-border pt-3 flex items-center justify-between text-xs text-muted">
            <span>Posición acumulada</span>
            <span className="font-mono text-zinc-300">{position.toLocaleString()} pasos</span>
          </div>
        </div>

        {/* Columna derecha — controles */}
        <div className="flex flex-col gap-5">
          {/* Panel de entrada */}
          <div className="bg-panel border border-border rounded-2xl p-5">
            <h2 className="text-sm font-medium text-muted uppercase tracking-widest mb-4">
              Parámetros
            </h2>
            <VolumeInput
              calibration={cal}
              steps={steps}
              speed={speed}
              onStepsChange={setSteps}
              onSpeedChange={setSpeed}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={busy}
              onClick={handleRetract}
              className="
                flex-1 flex items-center justify-center gap-2
                py-4 rounded-2xl border text-sm font-semibold
                bg-retract/10 border-retract/40 text-retract
                hover:bg-retract/20 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              <RotateCcw size={16} />
              Retraer
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={stop}
              className="
                px-5 py-4 rounded-2xl
                bg-stop text-white font-bold text-sm
                hover:bg-red-500 transition-colors
                shadow-[0_0_20px_rgba(239,68,68,0.25)]
              "
            >
              <Square size={18} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              disabled={busy}
              onClick={handleExtrude}
              className="
                flex-1 flex items-center justify-center gap-2
                py-4 rounded-2xl border text-sm font-semibold
                bg-extrude/10 border-extrude/40 text-extrude
                hover:bg-extrude/20 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Extruir
              <ChevronRight size={16} />
            </motion.button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-stop text-sm bg-stop/10 border border-stop/30 rounded-xl px-4 py-3">
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Estado de conexión */}
          <div className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${
            connected ? 'bg-extrude/5 border-extrude/20' : 'bg-white/5 border-border'
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

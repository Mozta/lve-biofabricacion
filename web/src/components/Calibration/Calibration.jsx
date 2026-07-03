import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { api } from '../../api/client.js';
import { computeStepsPerMm } from '../../utils/extruderMath.js';

export default function Calibration() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['calibration'], queryFn: api.getCalibration });
  const [form, setForm] = useState({
    steps_per_mm: '',
    syringe_id_mm: '',
    esp32_port: '',
    speed_ms: '',
    syringe_volume_ml: '',
    thread_pitch_mm: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        steps_per_mm: data.steps_per_mm ?? '',
        syringe_id_mm: data.syringe_id_mm ?? '',
        esp32_port: data.esp32_port ?? '',
        speed_ms: data.speed_ms ?? '',
        syringe_volume_ml: data.syringe_volume_ml ?? '',
        thread_pitch_mm: data.thread_pitch_mm ?? '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: api.updateCalibration,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calibration'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function save() {
    mutation.mutate({
      steps_per_mm: form.steps_per_mm === '' ? null : Number(form.steps_per_mm),
      syringe_id_mm: form.syringe_id_mm === '' ? null : Number(form.syringe_id_mm),
      esp32_port: form.esp32_port || null,
      speed_ms: form.speed_ms === '' ? null : Number(form.speed_ms),
      syringe_volume_ml: form.syringe_volume_ml === '' ? null : Number(form.syringe_volume_ml),
      thread_pitch_mm: form.thread_pitch_mm === '' ? null : Number(form.thread_pitch_mm),
    });
  }

  const computedStepsPerMm = form.thread_pitch_mm
    ? computeStepsPerMm(200, Number(form.thread_pitch_mm)).toFixed(1)
    : null;

  const fieldClass = `
    w-full bg-panel2 border border-border rounded-xl px-3 py-2.5
    text-zinc-100 text-sm
    focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30
    transition placeholder:text-muted/50
  `;

  const labelClass = "flex flex-col gap-1.5 text-sm text-muted";

  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Calibración</h1>
        <p className="text-muted text-sm mt-1">Parámetros físicos del sistema LVE</p>
      </div>

      {/* Parámetros de jeringa */}
      <div className="bg-panel border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-4">Jeringa</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={labelClass}>
            Volumen total (mL)
            <input type="number" step="1" className={fieldClass}
              value={form.syringe_volume_ml} onChange={upd('syringe_volume_ml')}
              placeholder="60" />
          </label>
          <label className={labelClass}>
            Diámetro interno del barril (mm)
            <input type="number" step="0.1" className={fieldClass}
              value={form.syringe_id_mm} onChange={upd('syringe_id_mm')}
              placeholder="26.7" />
          </label>
        </div>
      </div>

      {/* Parámetros del motor / transmisión */}
      <div className="bg-panel border border-border rounded-2xl p-5 mb-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-4">Motor y transmisión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className={labelClass}>
            Paso de rosca (mm/rev)
            <input type="number" step="0.01" className={fieldClass}
              value={form.thread_pitch_mm} onChange={upd('thread_pitch_mm')}
              placeholder="1.25 (M8 estándar)" />
            {computedStepsPerMm && (
              <span className="text-xs text-accent">
                → Pasos/mm calculados: <strong>{computedStepsPerMm}</strong>
                <span className="text-muted"> (200 ÷ {form.thread_pitch_mm})</span>
              </span>
            )}
          </label>
          <label className={labelClass}>
            Pasos por mm (override manual)
            <input type="number" step="0.01" className={fieldClass}
              value={form.steps_per_mm} onChange={upd('steps_per_mm')}
              placeholder="160.0" />
            <span className="text-xs text-muted">Deja vacío para usar el valor calculado del paso de rosca</span>
          </label>
          <label className={labelClass}>
            Velocidad por defecto (ms/micro-paso)
            <input type="number" className={fieldClass}
              value={form.speed_ms} onChange={upd('speed_ms')}
              placeholder="5" />
          </label>
        </div>
      </div>

      {/* Conexión */}
      <div className="bg-panel border border-border rounded-2xl p-5 mb-6">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-4">Conexión</h2>
        <label className={labelClass}>
          Puerto ESP32-C3
          <input type="text" className={fieldClass}
            value={form.esp32_port} onChange={upd('esp32_port')}
            placeholder="/dev/tty.usbmodem…" />
          <span className="text-xs text-muted">Informativo — el backend usa la variable de entorno <code className="text-accent/80">LVE_PORT</code> al arrancar.</span>
        </label>
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.96 }}
          disabled={mutation.isPending}
          onClick={save}
          className="px-6 py-2.5 rounded-xl bg-accent text-bg font-semibold text-sm hover:bg-cyan-400 transition disabled:opacity-50"
        >
          {mutation.isPending ? 'Guardando…' : 'Guardar'}
        </motion.button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1.5 text-extrude text-sm"
          >
            <Check size={14} /> Guardado
          </motion.span>
        )}
      </div>

      <p className="text-muted text-xs mt-5">
        Los valores reales se miden con calibrador — ver <code className="text-accent/80">docs/03-calibracion.md</code>.
      </p>
    </div>
  );
}

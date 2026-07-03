import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client.js';

export default function Calibration() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['calibration'], queryFn: api.getCalibration });
  const [form, setForm] = useState({
    steps_per_mm: '',
    syringe_id_mm: '',
    esp32_port: '',
    speed_ms: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        steps_per_mm: data.steps_per_mm ?? '',
        syringe_id_mm: data.syringe_id_mm ?? '',
        esp32_port: data.esp32_port ?? '',
        speed_ms: data.speed_ms ?? '',
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: api.updateCalibration,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['calibration'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function save() {
    mutation.mutate({
      steps_per_mm: form.steps_per_mm === '' ? null : Number(form.steps_per_mm),
      syringe_id_mm: form.syringe_id_mm === '' ? null : Number(form.syringe_id_mm),
      esp32_port: form.esp32_port || null,
      speed_ms: form.speed_ms === '' ? null : Number(form.speed_ms),
    });
  }

  return (
    <div className="view">
      <h1>Calibración</h1>
      <div className="card">
        <div className="grid">
          <label>
            Pasos por mm del émbolo
            <input
              type="number"
              step="0.01"
              value={form.steps_per_mm}
              onChange={upd('steps_per_mm')}
              placeholder="ej. 828.8"
            />
          </label>
          <label>
            Diámetro interno jeringa (mm)
            <input
              type="number"
              step="0.1"
              value={form.syringe_id_mm}
              onChange={upd('syringe_id_mm')}
              placeholder="ej. 26.5"
            />
          </label>
          <label>
            Puerto ESP32-C3
            <input
              type="text"
              value={form.esp32_port}
              onChange={upd('esp32_port')}
              placeholder="/dev/tty.usbmodem…"
            />
          </label>
          <label>
            Velocidad por defecto (ms)
            <input type="number" value={form.speed_ms} onChange={upd('speed_ms')} />
          </label>
        </div>
        <button className="btn extrude" onClick={save} disabled={mutation.isPending}>
          Guardar
        </button>
        {saved && <span className="ok-msg">Guardado ✓</span>}
      </div>
      <p className="hint">
        Los valores reales se miden con calibrador — ver docs/03-calibracion.md. El puerto de aquí es
        informativo; el backend usa la variable de entorno LVE_PORT al arrancar.
      </p>
    </div>
  );
}

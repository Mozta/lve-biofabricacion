import { useState } from 'react';
import { useExtruderControl } from '../../hooks/useExtruderControl.js';

const PRESETS = [100, 500, 1000];

export default function ControlBar() {
  const { busy, error, extrude, retract, stop, setSpeed } = useExtruderControl();
  const [steps, setSteps] = useState(200);
  const [speed, setSpeedMs] = useState(5);

  return (
    <footer className="control-bar">
      <div className="cb-group">
        <label>Pasos</label>
        <input
          type="number"
          min="1"
          value={steps}
          onChange={(e) => setSteps(Number(e.target.value))}
        />
        <div className="presets">
          {PRESETS.map((p) => (
            <button
              key={p}
              className={steps === p ? 'preset active' : 'preset'}
              onClick={() => setSteps(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="cb-group">
        <label>Velocidad (ms)</label>
        <input
          type="number"
          min="1"
          value={speed}
          onChange={(e) => setSpeedMs(Number(e.target.value))}
          onBlur={() => setSpeed(speed)}
        />
      </div>

      <div className="cb-actions">
        <button className="btn retract" disabled={busy} onClick={() => retract(steps, speed)}>
          ◀ Retraer
        </button>
        <button className="btn stop" onClick={stop} title="Detener el movimiento en curso">
          ■ STOP
        </button>
        <button className="btn extrude" disabled={busy} onClick={() => extrude(steps, speed)}>
          Extruir ▶
        </button>
      </div>

      {error && (
        <div className="cb-error" role="alert">
          {error}
        </div>
      )}
    </footer>
  );
}

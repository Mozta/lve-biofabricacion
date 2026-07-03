import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client.js';

// Control de jog manual. `stop` NO se bloquea con `busy` a propósito:
// debe poder dispararse mientras un extrude/retract está en vuelo.
export function useExtruderControl() {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(
    async (fn) => {
      setError(null);
      setBusy(true);
      try {
        const res = await fn();
        qc.invalidateQueries({ queryKey: ['status'] });
        return res;
      } catch (e) {
        setError(e.message);
        throw e;
      } finally {
        setBusy(false);
      }
    },
    [qc],
  );

  return {
    busy,
    error,
    extrude: (steps, speed) => run(() => api.extrude(steps, speed)),
    retract: (steps, speed) => run(() => api.retract(steps, speed)),
    stop: () =>
      api.stop().then((r) => {
        qc.invalidateQueries({ queryKey: ['status'] });
        return r;
      }),
    setSpeed: (speed) => api.setSpeed(speed).catch((e) => setError(e.message)),
  };
}

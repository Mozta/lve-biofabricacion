import { useSpring, motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { stepsToMl } from '../../utils/extruderMath';

const BARREL_X = 20;
const BARREL_Y = 30;
const BARREL_W = 80;
const BARREL_H = 220;
const PLUNGER_H = 14;

export function SyringeVisual({ position = 0, busy = false, extruding = false, syringeIdMm = 26.7, stepsPerMm = 160, volumeMl = 60 }) {
  // extrudedMl aumenta con position positiva; el nivel restante disminuye
  const extrudedMl = stepsToMl(Math.max(0, position), syringeIdMm, stepsPerMm);
  const remainingMl = Math.max(0, volumeMl - extrudedMl);
  const fillPct = Math.min(1, Math.max(0, remainingMl / volumeMl));

  // fillPct=1 → barril lleno (émbolo arriba), fillPct=0 → vacío (émbolo abajo)
  const fillTop = BARREL_Y + (1 - fillPct) * BARREL_H;
  const fillHeight = fillPct * BARREL_H;

  const springFillTop = useSpring(fillTop, { stiffness: 80, damping: 20 });
  const springFillH = useSpring(fillHeight, { stiffness: 80, damping: 20 });

  useEffect(() => {
    springFillTop.set(fillTop);
    springFillH.set(fillHeight);
  }, [fillTop, fillHeight]);

  const plungerY = fillTop - PLUNGER_H;
  const springPlungerY = useSpring(plungerY, { stiffness: 80, damping: 20 });
  useEffect(() => { springPlungerY.set(plungerY); }, [plungerY]);

  const volumeLabel = remainingMl.toFixed(1);
  const gradMarks = Array.from({ length: 6 }, (_, i) => i * 10); // 0,10,20,30,40,50

  return (
    <div className="flex flex-col items-center gap-3 select-none">
      <svg viewBox="0 0 120 320" width="120" height="320" className="overflow-visible">
        <defs>
          <clipPath id="barrel-clip">
            <rect x={BARREL_X} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={6} />
          </clipPath>
        </defs>

        {/* Tip / aguja */}
        <path
          d={`M ${BARREL_X + BARREL_W / 2 - 6} ${BARREL_Y + BARREL_H} L ${BARREL_X + BARREL_W / 2 + 6} ${BARREL_Y + BARREL_H} L ${BARREL_X + BARREL_W / 2} ${BARREL_Y + BARREL_H + 28}`}
          fill="none"
          stroke="rgb(255 255 255 / 0.25)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Relleno de material */}
        <motion.rect
          x={BARREL_X}
          style={{ y: springFillTop, height: springFillH }}
          width={BARREL_W}
          fill="rgba(16,185,129,0.2)"
          clipPath="url(#barrel-clip)"
        />

        {/* Contorno del barril */}
        <rect
          x={BARREL_X} y={BARREL_Y}
          width={BARREL_W} height={BARREL_H}
          rx={6}
          fill="none"
          stroke="rgb(255 255 255 / 0.18)"
          strokeWidth="1.5"
        />

        {/* Marcas de graduación */}
        {gradMarks.map((ml) => {
          const pct = ml / volumeMl;
          const markY = BARREL_Y + (1 - pct) * BARREL_H;
          return (
            <g key={ml}>
              <line
                x1={BARREL_X + BARREL_W - 12} y1={markY}
                x2={BARREL_X + BARREL_W} y2={markY}
                stroke="rgb(255 255 255 / 0.2)" strokeWidth="1"
              />
              <text
                x={BARREL_X + BARREL_W - 15} y={markY + 4}
                fontSize="7" fill="rgb(255 255 255 / 0.3)"
                textAnchor="end"
              >
                {ml}
              </text>
            </g>
          );
        })}

        {/* Émbolo */}
        <motion.rect
          x={BARREL_X + 2}
          style={{ y: springPlungerY }}
          width={BARREL_W - 4}
          height={PLUNGER_H}
          rx={4}
          fill="#374151"
          stroke="rgb(255 255 255 / 0.25)"
          strokeWidth="1"
        />
        {/* Línea de agarre del émbolo */}
        <motion.line
          x1={BARREL_X + BARREL_W / 2 - 10} x2={BARREL_X + BARREL_W / 2 + 10}
          style={{ y: springPlungerY.get() + PLUNGER_H / 2 }}
          stroke="rgb(255 255 255 / 0.3)" strokeWidth="1.5" strokeLinecap="round"
        />

        {/* Barra trasera del émbolo (arriba del barril) */}
        <motion.rect
          x={BARREL_X + BARREL_W / 2 - 3}
          y={0}
          style={{ height: springPlungerY }}
          width={6}
          rx={2}
          fill="#1f2937"
          stroke="rgb(255 255 255 / 0.12)"
          strokeWidth="1"
        />

        {/* Cabeza del émbolo (manija) */}
        <motion.rect
          x={BARREL_X + BARREL_W / 2 - 16}
          y={0}
          width={32}
          height={10}
          rx={3}
          fill="#1f2937"
          stroke="rgb(255 255 255 / 0.2)"
          strokeWidth="1"
        />

        {/* Label capacidad */}
        <text x={BARREL_X + BARREL_W - 2} y={BARREL_Y - 8} fontSize="8" fill="rgb(255 255 255 / 0.4)" textAnchor="end">
          {volumeMl} mL
        </text>

        {/* Dots de flujo al extruir */}
        <AnimatePresence>
          {busy && extruding && [0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={BARREL_X + BARREL_W / 2}
              cy={BARREL_Y + BARREL_H + 10}
              r={2.5}
              fill="#10b981"
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: [0, 10, 22], opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>
      </svg>

      {/* Info debajo del SVG */}
      <div className="text-center">
        <p className="text-accent text-xl font-bold tabular-nums">{volumeLabel} <span className="text-sm font-normal text-muted">mL</span></p>
        <p className="text-muted text-xs mt-0.5">{((fillPct) * 100).toFixed(0)}% restante</p>
      </div>
    </div>
  );
}

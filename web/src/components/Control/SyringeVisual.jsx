import { useSpring, motion, AnimatePresence, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const BARREL_X = 22;
const BARREL_Y = 40;
const BARREL_W = 76;
const BARREL_H = 220;
const PLUNGER_H = 12;
const CX = BARREL_X + BARREL_W / 2;
const VIEWBOX_H = 330;

export function SyringeVisual({
  remainingMl,
  volumeMl = 60,
  busy = false,
  isExtruding = false,
  onVolumeChange,
}) {
  const fillPct  = Math.min(1, Math.max(0, remainingMl / volumeMl));
  const fillTop  = BARREL_Y + (1 - fillPct) * BARREL_H;
  const fillH    = fillPct * BARREL_H;
  const plungerY = fillTop - PLUNGER_H;

  const sFillTop  = useSpring(fillTop,  { stiffness: 60, damping: 18 });
  const sFillH    = useSpring(fillH,    { stiffness: 60, damping: 18 });
  const sPlungerY = useSpring(plungerY, { stiffness: 60, damping: 18 });

  useEffect(() => { sFillTop.set(fillTop); },   [fillTop]);
  useEffect(() => { sFillH.set(fillH); },       [fillH]);
  useEffect(() => { sPlungerY.set(plungerY); }, [plungerY]);

  const rodH   = useTransform(sPlungerY, y => Math.max(0, y));

  // Grip handle lines — tres líneas centradas en el émbolo
  const gripY1 = useTransform(sPlungerY, y => y + 3);
  const gripY2 = useTransform(sPlungerY, y => y + 6);
  const gripY3 = useTransform(sPlungerY, y => y + 9);
  // Hit area ligeramente más ancho que el disco
  const sHitY  = useTransform(sPlungerY, y => y - 4);

  const svgRef      = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const canDrag = !!onVolumeChange;
  const isActive = isDragging || isHovering;

  function getMlFromClientY(clientY) {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect   = svg.getBoundingClientRect();
    const scaleY = VIEWBOX_H / rect.height;
    const svgY   = (clientY - rect.top) * scaleY;
    // Pointer en el centro del disco → top del disco = svgY - PLUNGER_H/2
    const topY   = svgY - PLUNGER_H / 2;
    const minY   = BARREL_Y - PLUNGER_H;           // jeringa llena
    const maxY   = BARREL_Y + BARREL_H - PLUNGER_H; // jeringa vacía
    const clampedY = Math.max(minY, Math.min(maxY, topY));
    const newFillPct = 1 - (clampedY + PLUNGER_H - BARREL_Y) / BARREL_H;
    return Math.max(0, Math.min(volumeMl, newFillPct * volumeMl));
  }

  function handlePointerDown(e) {
    if (!canDrag) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    if (!isDragging || !canDrag) return;
    const newMl = getMlFromClientY(e.clientY);
    if (newMl === null) return;
    // Actualizar springs directamente para respuesta visual inmediata
    const fp  = newMl / volumeMl;
    const ft  = BARREL_Y + (1 - fp) * BARREL_H;
    const fh  = fp * BARREL_H;
    const py  = ft - PLUNGER_H;
    sFillTop.set(ft);
    sFillH.set(fh);
    sPlungerY.set(py);
    // Notificar al padre (actualiza el estado de volumen)
    onVolumeChange(newMl);
  }

  function handlePointerUp() {
    setIsDragging(false);
    setIsHovering(false);
  }

  const gradCount = Math.floor(volumeMl / 10);
  const gradMarks = Array.from({ length: gradCount }, (_, i) => (i + 1) * 10);

  const plungerFill   = isActive ? '#1f3a2a' : '#1a2e22';
  const plungerStroke = isActive ? '#27916a' : '#1d4535';
  const gripColor     = isActive ? '#27916a' : '#1d4535';

  return (
    <div className="flex flex-col items-center gap-2 select-none">
      <svg
        ref={svgRef}
        viewBox="0 0 120 330"
        width="120"
        height="330"
        className="overflow-visible"
      >
        <defs>
          <clipPath id="barrel-clip">
            <rect x={BARREL_X} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={6} />
          </clipPath>
          <linearGradient id="liquid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#27916a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0d4432" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="barrel-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.04)" />
            <stop offset="25%"  stopColor="rgba(255,255,255,0.01)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
          </linearGradient>
        </defs>

        {/* ── Barril ── */}
        <rect
          x={BARREL_X} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={6}
          fill="#0a1510" stroke="#1a3528" strokeWidth="1.5"
        />

        {/* Líquido */}
        <motion.rect
          x={BARREL_X} width={BARREL_W}
          style={{ y: sFillTop, height: sFillH }}
          fill="url(#liquid-grad)"
          clipPath="url(#barrel-clip)"
        />

        {/* Ola superficial */}
        <AnimatePresence>
          {fillPct > 0.01 && (
            <motion.ellipse
              key="wave"
              cx={CX} rx={BARREL_W / 2 - 3}
              style={{ cy: sFillTop }}
              fill="rgba(39,145,106,0.35)"
              animate={{ ry: [2, 5, 2] }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            />
          )}
        </AnimatePresence>

        {/* Reflejo vidrio */}
        <rect
          x={BARREL_X} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={6}
          fill="url(#barrel-glass)" clipPath="url(#barrel-clip)"
        />

        {/* Contorno */}
        <rect
          x={BARREL_X} y={BARREL_Y} width={BARREL_W} height={BARREL_H} rx={6}
          fill="none" stroke="#2a4a3a" strokeWidth="1.5"
        />

        {/* ── Graduaciones ── */}
        {gradMarks.map((ml) => {
          const pct   = ml / volumeMl;
          const markY = BARREL_Y + (1 - pct) * BARREL_H;
          const isMajor = ml % 20 === 0;
          return (
            <g key={ml}>
              <line
                x1={BARREL_X + BARREL_W - (isMajor ? 13 : 8)} y1={markY}
                x2={BARREL_X + BARREL_W}                       y2={markY}
                stroke="#2a5040" strokeWidth={isMajor ? 1.2 : 0.7}
              />
              {isMajor && (
                <text
                  x={BARREL_X + BARREL_W - 16} y={markY + 3.5}
                  fontSize="7" fill="#3a6a52" textAnchor="end"
                >
                  {ml}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Émbolo — barra y manija ── */}
        <motion.rect
          x={CX - 4} y={0} style={{ height: rodH }}
          width={8} rx={2}
          fill="#1a2820" stroke="#2a4035" strokeWidth="1"
        />
        <rect
          x={CX - 18} y={0} width={36} height={10} rx={3}
          fill="#1e2e25" stroke="#2a4035" strokeWidth="1"
        />

        {/* ── Disco del émbolo (draggable) ── */}
        <motion.rect
          x={BARREL_X + 2}
          style={{ y: sPlungerY, cursor: canDrag ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          width={BARREL_W - 4} height={PLUNGER_H} rx={3}
          fill={plungerFill}
          stroke={plungerStroke}
          strokeWidth={isActive ? 1.5 : 1}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerEnter={() => canDrag && setIsHovering(true)}
          onPointerLeave={() => { if (!isDragging) setIsHovering(false); }}
        />

        {/* Líneas de agarre (≡) */}
        <motion.line
          x1={CX - 8} x2={CX + 8} y1={gripY1} y2={gripY1}
          stroke={gripColor} strokeWidth="1" strokeLinecap="round"
        />
        <motion.line
          x1={CX - 8} x2={CX + 8} y1={gripY2} y2={gripY2}
          stroke={gripColor} strokeWidth="1" strokeLinecap="round"
        />
        <motion.line
          x1={CX - 8} x2={CX + 8} y1={gripY3} y2={gripY3}
          stroke={gripColor} strokeWidth="1" strokeLinecap="round"
        />

        {/* Área de hit más ancha para facilitar el agarre */}
        {canDrag && (
          <motion.rect
            x={BARREL_X - 4}
            style={{ y: sHitY, cursor: isDragging ? 'grabbing' : 'grab' }}
            width={BARREL_W + 8} height={PLUNGER_H + 8}
            fill="transparent"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerEnter={() => setIsHovering(true)}
            onPointerLeave={() => { if (!isDragging) setIsHovering(false); }}
          />
        )}

        {/* ── Aguja ── */}
        <path
          d={`M ${CX - 5} ${BARREL_Y + BARREL_H}
              L ${CX + 5} ${BARREL_Y + BARREL_H}
              L ${CX}     ${BARREL_Y + BARREL_H + 30}`}
          fill="none" stroke="#2a4a3a" strokeWidth="1.5" strokeLinejoin="round"
        />

        {/* Label capacidad */}
        <text
          x={BARREL_X + BARREL_W + 3} y={BARREL_Y + 6}
          fontSize="7.5" fill="#3a6a52" textAnchor="start"
        >
          {volumeMl} mL
        </text>

        {/* Tooltip hint cuando se hace hover */}
        {canDrag && isHovering && !isDragging && (
          <text
            x={BARREL_X - 2} y={BARREL_Y - 6}
            fontSize="6.5" fill="#27916a" textAnchor="start"
          >
            arrastra
          </text>
        )}

        {/* ── Flujo de extrusión ── */}
        <AnimatePresence>
          {busy && isExtruding && (
            <motion.g
              key="flow"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.circle
                  key={i}
                  cx={CX} cy={BARREL_Y + BARREL_H + 14}
                  r={i === 0 ? 3.5 : i === 1 ? 2.5 : 1.8}
                  fill="#27916a" fillOpacity={0.8}
                  animate={{
                    cy:      [BARREL_Y + BARREL_H + 14, BARREL_Y + BARREL_H + 26, BARREL_Y + BARREL_H + 38],
                    opacity: [0.8, 0.5, 0],
                    r:       [i === 0 ? 3.5 : i === 1 ? 2.5 : 1.8, 2, 0.8],
                  }}
                  transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.36, ease: 'easeIn' }}
                />
              ))}
            </motion.g>
          )}
        </AnimatePresence>
      </svg>

      {/* Info */}
      <div className="text-center">
        <p className="text-extrude text-2xl font-bold tabular-nums leading-none font-mono">
          {remainingMl.toFixed(1)}
          <span className="text-sm font-normal text-muted ml-1">mL</span>
        </p>
        <p className="text-muted text-xs mt-1">{(fillPct * 100).toFixed(0)}% restante</p>
        {canDrag && (
          <p className="text-muted/50 text-[10px] mt-0.5 uppercase tracking-widest">
            arrastra el émbolo
          </p>
        )}
      </div>
    </div>
  );
}

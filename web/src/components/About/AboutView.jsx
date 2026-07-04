import { GitBranch, ExternalLink, FlaskConical, Cpu, Layers } from 'lucide-react';

const AUTHORS = [
  {
    name: 'Dra. María José Rivas Arreola',
    institution: 'IBERO Puebla — Depto. de Ciencias e Ingenierías',
    role: 'Diseño original del printer para biomateriales, Fab Academy',
    initials: 'MR',
    color: 'bg-accent/10 border-accent/25',
  },
  {
    name: 'Mtro. Rafael Pérez Aguirre',
    institution: 'IBERO Puebla — Depto. de Ciencias e Ingenierías',
    role: 'Validación de extrusión, desarrollo del sistema de control',
    initials: 'RP',
    color: 'bg-extrude/8 border-extrude/20',
  },
];

const STACK = [
  { icon: Cpu,         label: 'Seeed XIAO ESP32-C3 + DRV8833 + NEMA17' },
  { icon: Layers,      label: 'FastAPI · SQLite · React · Tailwind · Framer Motion' },
  { icon: FlaskConical,label: 'Jeringa 60 mL · Varilla roscada M8 · Fuente C.C. 8V/1A' },
];

export default function AboutView() {
  return (
    <div className="p-5 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-accent/12 border border-accent/20 flex items-center justify-center">
            <FlaskConical size={20} className="text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-100">LVE · Large Volume Extruder</h1>
            <p className="text-muted text-sm">Sistema de validación de extrudibilidad para biofabricación</p>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="bg-panel border border-border rounded-xl p-5 mb-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-3">Sobre el proyecto</h2>
        <p className="text-stone-300 text-sm leading-relaxed">
          El LVE es un extrusor de gran volumen simplificado diseñado para validar la extrudibilidad
          de biomateriales antes de construir una bioimpresora 3D completa. Basado en{' '}
          <span className="text-stone-100 font-medium">Pusch, Hinton &amp; Feinberg, HardwareX 2018</span>,
          con una simplificación clave: el par de engranajes de espina de pez (impreso, alta tolerancia)
          fue reemplazado por un motor NEMA17 comercial, reduciendo las piezas impresas de 8 a 3 y
          el tiempo de construcción de semanas a días.
        </p>
        <p className="text-stone-300 text-sm leading-relaxed mt-3">
          La interfaz web (FastAPI + React) traduce comandos HTTP al protocolo serial del firmware
          del ESP32-C3, persiste corridas de extrusión en SQLite y calcula estadísticas de
          consistencia (media, stdev, %CV, %error) para evaluar biomateriales candidatos.
        </p>
      </div>

      {/* Stack técnico */}
      <div className="bg-panel border border-border rounded-xl p-5 mb-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-3">Stack técnico</h2>
        <div className="flex flex-col gap-3">
          {STACK.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-panel2 border border-border flex items-center justify-center shrink-0">
                <Icon size={13} className="text-muted" />
              </div>
              <span className="text-sm text-stone-300">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Repositorio */}
      <div className="bg-panel border border-border rounded-xl p-5 mb-4">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-3">Repositorio</h2>
        <a
          href="https://github.com/Mozta/lve-biofabricacion"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-accent hover:text-extrude font-medium transition-colors"
        >
          <GitBranch size={15} />
          github.com/Mozta/lve-biofabricacion
          <ExternalLink size={12} className="text-muted" />
        </a>
        <p className="text-xs text-muted mt-2">
          Firmware (Arduino/ESP32), esquemas de cableado, BOM, documentación y código del puente FastAPI + React.
        </p>
      </div>

      {/* Autores */}
      <div className="bg-panel border border-border rounded-xl p-5">
        <h2 className="text-xs font-medium text-muted uppercase tracking-widest mb-4">Autores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {AUTHORS.map(({ name, role, institution, initials, color }) => (
            <div key={name} className={`flex flex-col gap-3 rounded-xl p-4 border ${color}`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center font-bold text-sm shrink-0">
                  {initials}
                </div>
                <p className="text-sm font-semibold text-stone-100 leading-snug">{name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-xs text-muted">{institution}</p>
                <p className="text-xs text-stone-400 italic">{role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted/40 text-xs text-center mt-6 uppercase tracking-widest">
        LVE Control · Fase 1 · {new Date().getFullYear()}
      </p>
    </div>
  );
}

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gauge, FlaskConical, Clock, SlidersHorizontal, Info } from 'lucide-react';
import { Topnav } from './components/Layout/Topnav.jsx';
import { ControlView } from './components/Control/ControlView.jsx';
import TestRunner from './components/TestRunner/TestRunner.jsx';
import RunsTable from './components/History/RunsTable.jsx';
import Calibration from './components/Calibration/Calibration.jsx';
import Config from './components/Config/Config.jsx';

const VIEWS = {
  control:     { label: 'Control',      icon: Gauge,             component: ControlView },
  pruebas:     { label: 'Pruebas',      icon: FlaskConical,      component: TestRunner },
  historial:   { label: 'Historial',    icon: Clock,             component: RunsTable },
  calibracion: { label: 'Calibración',  icon: SlidersHorizontal, component: Calibration },
  config:      { label: 'Config',       icon: Info,              component: Config },
};

export default function App() {
  const [view, setView] = useState('control');
  const View = VIEWS[view].component;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Topnav views={VIEWS} active={view} onSelect={setView} />
      <main className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
          >
            <View onNavigate={setView} />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

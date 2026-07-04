import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Gauge, FlaskConical, Clock, SlidersHorizontal, Settings, BookOpen } from 'lucide-react';
import { Topbar } from './components/Layout/Topbar.jsx';
import { Sidebar } from './components/Layout/Sidebar.jsx';
import { ControlView } from './components/Control/ControlView.jsx';
import TestRunner from './components/TestRunner/TestRunner.jsx';
import RunsTable from './components/History/RunsTable.jsx';
import Calibration from './components/Calibration/Calibration.jsx';
import Config from './components/Config/Config.jsx';
import AboutView from './components/About/AboutView.jsx';

const VIEWS = {
  control:     { label: 'Control',      icon: Gauge,             component: ControlView },
  pruebas:     { label: 'Pruebas',      icon: FlaskConical,      component: TestRunner },
  historial:   { label: 'Historial',    icon: Clock,             component: RunsTable },
  calibracion: { label: 'Calibración',  icon: SlidersHorizontal, component: Calibration },
  config:      { label: 'Config',       icon: Settings,          component: Config },
  about:       { label: 'Acerca de',    icon: BookOpen,          component: AboutView },
};

export default function App() {
  const [view, setView] = useState('control');
  const [theme, setTheme] = useState(
    () => localStorage.getItem('lve-theme') ?? 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('lve-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const View = VIEWS[view].component;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          views={VIEWS}
          active={view}
          onSelect={setView}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
            >
              <View onNavigate={setView} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

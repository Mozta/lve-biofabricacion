import { useState } from 'react';
import Topbar from './components/Topbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import ControlBar from './components/ControlBar/ControlBar.jsx';
import Dashboard from './components/Dashboard.jsx';
import TestRunner from './components/TestRunner/TestRunner.jsx';
import RunsTable from './components/History/RunsTable.jsx';
import Calibration from './components/Calibration/Calibration.jsx';
import Config from './components/Config/Config.jsx';

const VIEWS = {
  panel: { label: 'Panel', component: Dashboard },
  pruebas: { label: 'Pruebas', component: TestRunner },
  historial: { label: 'Historial', component: RunsTable },
  calibracion: { label: 'Calibración', component: Calibration },
  config: { label: 'Configuración', component: Config },
};

export default function App() {
  const [view, setView] = useState('panel');
  const View = VIEWS[view].component;

  return (
    <div className="app">
      <Topbar />
      <div className="body">
        <Sidebar views={VIEWS} active={view} onSelect={setView} />
        <main className="content">
          <View onNavigate={setView} />
        </main>
      </div>
      {/* Jog persistente: visible en TODAS las vistas, nunca enterrado en Pruebas. */}
      <ControlBar />
    </div>
  );
}

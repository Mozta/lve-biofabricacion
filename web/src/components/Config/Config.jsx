export default function Config() {
  return (
    <div className="view">
      <h1>Configuración</h1>
      <div className="card">
        <p className="muted">
          El puerto serial y la base de datos se configuran por variables de entorno del backend
          (<code>LVE_PORT</code>, <code>LVE_DB</code>, <code>LVE_MOCK</code>) — ver{' '}
          <code>api/README.md</code>.
        </p>
        <p className="muted">Panel de configuración completo dentro de la app: Fase 2.</p>
      </div>
    </div>
  );
}

export default function Sidebar({ views, active, onSelect }) {
  return (
    <nav className="sidebar">
      {Object.entries(views).map(([id, { label }]) => (
        <button
          key={id}
          className={`nav-item ${active === id ? 'active' : ''}`}
          onClick={() => onSelect(id)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

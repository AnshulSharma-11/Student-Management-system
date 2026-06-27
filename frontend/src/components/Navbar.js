import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        🎓 StudentMS
        <span>Management System</span>
      </Link>
      <div className="navbar-links">
        <Link to="/"        className={pathname === '/'         ? 'active' : ''}>Dashboard</Link>
        <Link to="/students" className={pathname.startsWith('/students') ? 'active' : ''}>Students</Link>
      </div>
    </nav>
  );
}

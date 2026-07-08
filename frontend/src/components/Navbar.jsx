import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function dashboardPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  if (role === 'parent') return '/parent';
  return '/student';
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link className="navbar-brand" to="/">UG Scholar</Link>
        <button className="navbar-toggler" type="button" onClick={() => setMenuOpen(!menuOpen)}>
          <span className="navbar-toggler-icon" />
        </button>
        <div className={`navbar-collapse${menuOpen ? ' show' : ''}`}>
          <div className="navbar-nav me-auto">
            <NavLink className="nav-link" to="/courses" onClick={() => setMenuOpen(false)}>Courses</NavLink>
            <NavLink className="nav-link" to="/about" onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink className="nav-link" to="/pricing" onClick={() => setMenuOpen(false)}>Pricing</NavLink>
            {user && <NavLink className="nav-link" to={dashboardPath(user.role)} onClick={() => setMenuOpen(false)}>Dashboard</NavLink>}
          </div>
          <div className="navbar-nav">
            {user ? (
              <>
                <span className="navbar-text">{user.full_name}</span>
                <NavLink className="nav-link" to="/profile" onClick={() => setMenuOpen(false)}>Profile</NavLink>
                <button className="btn-light" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <NavLink className="nav-link" to="/login" onClick={() => setMenuOpen(false)}>Login</NavLink>
                <Link className="btn-light" to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

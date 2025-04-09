import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || location.pathname === '/login') {
    return null;
  }

  return (
    <nav className="main-navigation">
      <div className="nav-container">
        <Link to="/dashboard" className="nav-logo">HotelFlow</Link>
        
        <div className="nav-links">
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
            Dashboard
          </Link>
          
          <Link to="/habitaciones" className={location.pathname.includes('/habitaciones') ? 'active' : ''}>
            Habitaciones
          </Link>
          
          {/* Aquí puedes agregar más enlaces según sea necesario */}
          
          <div className="user-info">
            <span>{user.nombre} {user.apellido}</span>
            <span className="role-badge">{user.rol}</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
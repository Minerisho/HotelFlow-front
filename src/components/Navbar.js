import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { authService } from '../Services/api'; // Corregido: un solo ../ para salir de /components a /src
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
  }, [location]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  if (location.pathname === '/login' || !currentUser) {
    return null;
  }

  const displayName = currentUser.nombre ? `${currentUser.nombre} ${currentUser.apellido || ''}`.trim() : currentUser.username;
  const displayRole = currentUser.rol || 'Usuario'; //

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard">HotelFlow</Link>
        </div>

        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li className="navbar-item">
            <Link to="/habitaciones">Habitaciones</Link>
          </li>
          <li className="navbar-item">
            <Link to="/reservas">Reservas</Link>
          </li>
          <li className="navbar-item">
            <Link to="/clientes">Clientes</Link>
          </li>
          {/* Nuevos enlaces */}
          <li className="navbar-item">
            <Link to="/consumos">Consumos</Link>
          </li>
          <li className="navbar-item">
            <Link to="/pagos">Pagos</Link>
          </li>

          {/* Enlaces condicionales para ADMIN */}
          {displayRole === 'ADMIN' && (
            <>
              <li className="navbar-item">
                <Link to="/inventario">Inventario</Link>
              </li>
              <li className="navbar-item">
                <Link to="/usuarios">Usuarios</Link> {/* Asumiendo que crearás este módulo */}
              </li>
            </>
          )}
        </ul>

        <div className="navbar-user">
          <span className="user-info">
            <span className="user-name">{displayName}</span>
            <span className="user-role">({displayRole})</span>
          </span>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
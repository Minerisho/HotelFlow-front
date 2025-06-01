import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  
  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
    // Redirect to login page
    navigate('/login');
  };


  if (!user) {
    return null;
  }

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
        </ul>
        
        <div className="navbar-user">
          <span className="user-info">
            <span className="user-name">{user.nombre || user.username}</span>
            <span className="user-role">({user.tipoUsuario})</span>
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
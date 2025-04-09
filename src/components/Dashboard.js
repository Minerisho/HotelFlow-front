import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div className="loading">Cargando...</div>;

  return (
    <div className="dashboard-container">
      <h2>Bienvenido, {user.nombre} {user.apellido}</h2>
      
      <div className="dashboard-modules">
        <div className="module-card">
          <h3>Gestión de Habitaciones</h3>
          <p>Administra las habitaciones del hotel</p>
          <Link to="/habitaciones" className="module-link">Ver Habitaciones</Link>
        </div>
        
        {/* Puedes agregar más módulos según sea necesario */}
        <div className="module-card">
          <h3>Reservaciones</h3>
          <p>Gestiona las reservas de los clientes</p>
          <Link to="/reservas" className="module-link">Ver Reservaciones</Link>
        </div>
        
        <div className="module-card">
          <h3>Clientes</h3>
          <p>Administra los datos de clientes</p>
          <Link to="/clientes" className="module-link">Ver Clientes</Link>
        </div>
        
        <div className="module-card">
          <h3>Facturación</h3>
          <p>Gestiona las facturas y pagos</p>
          <Link to="/facturacion" className="module-link">Ver Facturación</Link>
        </div>
      </div>
      
      <div className="dashboard-actions">
        <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default Dashboard;
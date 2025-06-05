import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../Services/api'; // Ajusta la ruta
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    } else {
      // Si no hay usuario, podría ser una sesión inválida o expirada.
      // authService.logout() limpiará cualquier rastro y PrivateRoute debería redirigir.
      // Opcionalmente, forzar logout y redirección aquí:
      // authService.logout();
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (!user) {
    // Muestra un estado de carga o nulo mientras se verifica el usuario,
    // aunque PrivateRoute ya debería haber manejado la redirección si no está autenticado.
    return <div className="loading">Cargando...</div>;
  }

  // Campos del objeto User según PDF (1.1.2): id, username, nombre, apellido, cedula, rol 
  return (
    <div className="dashboard-container">
      <h2>Bienvenido, {user.nombre || user.username} {user.apellido || ''}</h2>
      <p className="role-display">Rol: {user.rol}</p>
      
      <div className="dashboard-modules">
        <div className="module-card">
          <h3>Gestión de Habitaciones</h3>
          <p>Administra las habitaciones del hotel: crear, ver, editar y eliminar.</p>
          <Link to="/habitaciones" className="module-link">Ir a Habitaciones</Link>
        </div>
        
        <div className="module-card">
          <h3>Gestión de Reservas</h3>
          <p>Crea nuevas reservas y gestiona las existentes.</p>
          <Link to="/reservas" className="module-link">Ir a Reservas</Link>
        </div>
        
        <div className="module-card">
          <h3>Gestión de Clientes</h3>
          <p>Registra nuevos clientes y administra sus datos.</p>
          <Link to="/clientes" className="module-link">Ir a Clientes</Link>
        </div>
        
        {/* Módulos adicionales (requieren creación de componentes y rutas) */}
        {user.rol === 'ADMIN' && ( // Mostrar solo si es ADMIN
          <>
            <div className="module-card">
              <h3>Gestión de Usuarios</h3>
              <p>Administra los usuarios del sistema (empleados).</p>
              <Link to="/usuarios" className="module-link">Ir a Usuarios</Link>
            </div>
            <div className="module-card">
              <h3>Gestión de Inventario</h3>
              <p>Controla los productos y stock del hotel.</p>
              <Link to="/inventario" className="module-link">Ir a Inventario</Link>
            </div>
          </>
        )}
        {/*
        <div className="module-card">
          <h3>Consumos</h3>
          <p>Registra y gestiona los consumos de los huéspedes.</p>
          <Link to="/consumos" className="module-link">Ir a Consumos</Link>
        </div>

        <div className="module-card">
          <h3>Facturación y Pagos</h3>
          <p>Gestiona las facturas y registra pagos.</p>
          <Link to="/pagos" className="module-link">Ir a Pagos</Link>
        </div>
        */}
      </div>
      
      <div className="dashboard-actions">
        <button onClick={handleLogout} className="btn-logout">Cerrar Sesión</button>
      </div>
    </div>
  );
};

export default Dashboard;
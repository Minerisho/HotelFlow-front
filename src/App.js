// src/App.js

import React from 'react';
// Importar useLocation y useNavigate para el botón de volver
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HabitacionList from './components/Habitaciones/HabitacionList';
import HabitacionForm from './components/Habitaciones/HabitacionForm';
import ReservaList from './components/Reservas/ReservaList';
import ReservaForm from './components/Reservas/ReservasForm';
import CheckoutList from './components/Clientes/CheckoutList';
import ClientesMenu from './components/Clientes/ClientesMenu';
import RegistroClientes from './components/Clientes/RegistroClientes';
import InventarioList from './components/Inventario/InventarioList';
import InventarioForm from './components/Inventario/InventarioForm';
import ConsumoList from './components/Consumos/ConsumoList';
import ConsumoForm from './components/Consumos/ConsumoForm';
import PagoList from './components/Pagos/PagoList';
import PagoForm from './components/Pagos/PagoForm';
// import UsuarioList from './components/Usuarios/UsuarioList';
// import UsuarioForm from './components/Usuarios/UsuarioForm';

import Navbar from './components/Navbar';
import { authService } from './Services/api';

import './App.css'; // Aquí están tus estilos

// Componente para el botón de "Volver al Dashboard"
const BackToDashboardButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // No mostrar en login ni en dashboard
  if (location.pathname === '/login' || location.pathname === '/dashboard') {
    return null;
  }

  // Estilos para el botón de volver. Ajusta según la altura de tu Navbar y preferencias.
  // Puedes moverlos a App.css si prefieres.
  const buttonStyle = {
    position: 'fixed', // 'fixed' para que esté relativo a la ventana
    top: 'calc(var(--navbar-height, 60px) + 20px)', // Ajusta 60px a la altura de tu Navbar + 20px de margen
    left: '20px',
    zIndex: 1050, // Para asegurar que esté por encima de otros elementos
    background: '#6c757d', // Un gris neutro
    color: 'white',
    border: 'none',
    borderRadius: '50%', // Para hacerlo circular
    width: '45px',  // Tamaño del botón
    height: '45px',
    fontSize: '24px', // Tamaño del símbolo '<'
    lineHeight: '45px', // Centrar verticalmente el símbolo
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  return (
    <button
      style={buttonStyle}
      onClick={() => navigate('/dashboard')}
      title="Volver al Dashboard"
    >
      &lt;
    </button>
  );
};


function PrivateRoute({ children }) {
  const isAuthenticated = authService.isAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  // PrivateRoute solo protege el contenido, Navbar y el botón de volver se manejan fuera si aplican a todas las vistas protegidas
  return children;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

// Nuevo componente para poder usar hooks de react-router-dom (useLocation, useNavigate)
// ya que App es el componente raíz del Router y no puede usarlos directamente para esta lógica.
const AppContent = () => {
  const location = useLocation(); // Necesario para decidir si mostrar Navbar
  const isAuthenticated = authService.isAuthenticated();

  return (
    <div className="App">
      {/* Mostrar Navbar solo si está autenticado y no es la página de login */}
      {isAuthenticated && location.pathname !== '/login' && <Navbar />}
      {/* Mostrar botón de volver solo si está autenticado */}
      {isAuthenticated && <BackToDashboardButton />}
      
      <div className="content-container"> {/* Este es tu contenedor principal para el contenido */}
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/habitaciones" element={<PrivateRoute><HabitacionList /></PrivateRoute>} />
          <Route path="/habitaciones/nueva" element={<PrivateRoute><HabitacionForm /></PrivateRoute>} />
          <Route path="/habitaciones/editar/:numeroHabitacion" element={<PrivateRoute><HabitacionForm /></PrivateRoute>} />
          <Route path="/reservas" element={<PrivateRoute><ReservaList /></PrivateRoute>} />
          <Route path="/reservas/nueva" element={<PrivateRoute><ReservaForm /></PrivateRoute>} />
          <Route path="/reservas/editar/:idReserva" element={<PrivateRoute><ReservaForm /></PrivateRoute>} />
          <Route path="/clientes" element={<PrivateRoute><ClientesMenu /></PrivateRoute>} />
          <Route path="/clientes/registro" element={<PrivateRoute><RegistroClientes /></PrivateRoute>} />
          <Route path="/clientes/checkout" element={<PrivateRoute><CheckoutList /></PrivateRoute>} />
          <Route path="/inventario" element={<PrivateRoute><InventarioList /></PrivateRoute>} />
          <Route path="/inventario/nuevo" element={<PrivateRoute><InventarioForm /></PrivateRoute>} />
          <Route path="/inventario/editar/:idProducto" element={<PrivateRoute><InventarioForm /></PrivateRoute>} />
          <Route path="/consumos" element={<PrivateRoute><ConsumoList /></PrivateRoute>} />
          <Route path="/consumos/nuevo" element={<PrivateRoute><ConsumoForm /></PrivateRoute>} />
          <Route path="/pagos" element={<PrivateRoute><PagoList /></PrivateRoute>} />
          <Route path="/pagos/nuevo" element={<PrivateRoute><PagoForm /></PrivateRoute>} />
          {/* <Route path="/usuarios" element={<PrivateRoute><UsuarioList /></PrivateRoute>} /> */}
          {/* <Route path="/usuarios/nuevo" element={<PrivateRoute><UsuarioForm /></PrivateRoute>} /> */}
          {/* <Route path="/usuarios/editar/:id" element={<PrivateRoute><UsuarioForm /></PrivateRoute>} /> */}

          <Route
            path="/"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to={authService.isAuthenticated() ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
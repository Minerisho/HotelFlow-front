import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HabitacionList from './components/Habitaciones/HabitacionList';
import HabitacionForm from './components/Habitaciones/HabitacionForm';
import ReservaList from './components/Reservas/ReservaList';
import ReservaForm from './components/Reservas/ReservasForm';
import CheckoutList from './components/Clientes/CheckoutList';
import ClientesMenu from './components/Clientes/ClientesMenu';
import RegistroClientes from './components/Clientes/RegistroClientes';
import Navbar from './components/Navbar'; // Import the Navbar component
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Add the Navbar component here */}
        <div className="content-container">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/habitaciones" element={
              <PrivateRoute>
                <HabitacionList />
              </PrivateRoute>
            } />
            <Route path="/habitaciones/nueva" element={
              <PrivateRoute>
                <HabitacionForm />
              </PrivateRoute>
            } />
            <Route path="/habitaciones/editar/:id" element={
              <PrivateRoute>
                <HabitacionForm />
              </PrivateRoute>
            } />
            <Route path="/reservas" element={
              <PrivateRoute>
                <ReservaList />
              </PrivateRoute>
            } />
            <Route path="/reservas/nueva" element={
              <PrivateRoute>
                <ReservaForm />
              </PrivateRoute>
            } />
            <Route path="/reservas/editar/:id" element={
              <PrivateRoute>
                <ReservaForm />
              </PrivateRoute>
            } />
            <Route path="/clientes" element={
              <PrivateRoute>
                <ClientesMenu />
              </PrivateRoute>
            } />
            <Route path="/clientes/registro" element={
              <PrivateRoute>
                <RegistroClientes />
              </PrivateRoute>
            } />
            <Route path="/clientes/checkout" element={
              <PrivateRoute>
                <CheckoutList />
              </PrivateRoute>
            } />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;
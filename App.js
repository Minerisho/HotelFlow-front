import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import HabitacionList from './components/Habitaciones/HabitacionList';
import HabitacionForm from './components/Habitaciones/HabitacionForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
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
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

function PrivateRoute({ children }) {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default App;
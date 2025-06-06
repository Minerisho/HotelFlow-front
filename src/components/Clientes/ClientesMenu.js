import React from 'react';
import { Link } from 'react-router-dom';
import './ClientesMenu.css';

const ClientesMenu = () => {
  return (
    <div className="clientes-menu-container">
      <h2 className="clientes-menu-title">Gestión de Clientes</h2>
      <div className="clientes-menu-button-container">
        <Link to="/clientes/registro" className="clientes-btn-link btn-azul">
          Registrar Cliente
        </Link>
        <Link to="/clientes/checkout" className="clientes-btn-link btn-amarillo">
          Hacer Check-out
        </Link>
        <Link to="/clientes/historial" className="clientes-btn-link btn-verde">
          Ver Historial
        </Link>
      </div>
    </div>
  );
};

export default ClientesMenu;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ClientesMenu.css';

const ClientesMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="clientes-menu">
      <h2>GestiÃ³n de Clientes</h2>
      <div className="menu-opciones">
        <button onClick={() => navigate('/clientes/registro-clientes')} className="btn-opcion">
          Registrar Cliente
        </button>
        <button onClick={() => navigate('/clientes/checkout')} className="btn-opcion">
          Hacer Check-out
        </button>
      </div>
    </div>
  );
};

export default ClientesMenu;
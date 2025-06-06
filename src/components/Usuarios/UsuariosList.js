import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UsuarioForm from './UsuarioForm';
import './UsuariosList.css'; // Asegúrate de importar tu CSS

const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);

  const fetchUsuarios = async () => {
    const response = await axios.get('http://localhost:8094/api/usuarios');
    setUsuarios(response.data);
  };

  const eliminarUsuario = async (id) => {
    const confirm = window.confirm('¿Estás seguro de eliminar este usuario?');
    if (!confirm) return;

    await axios.delete(`http://localhost:8094/api/usuarios/${id}`);
    fetchUsuarios();
  };

  const agregarUsuario = (nuevoUsuario) => {
    setUsuarios([...usuarios, nuevoUsuario]);
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return (
    <div className="usuarios-container">
      <h2 className="titulo">Gestión de Usuarios</h2>
      <UsuarioForm onUsuarioCreado={agregarUsuario} />

      <div className="tabla-container">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Username</th>
              <th>Nombre completo</th>
              <th>Cédula</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(u => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.nombre} {u.apellido}</td>
                <td>{u.cedula}</td>
                <td>{u.rol}</td>
                <td>
                  <button className="btn-eliminar" onClick={() => eliminarUsuario(u.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosList;

import React, { useState } from 'react';
import './UsuarioForm.css'; // Asegúrate de tener este archivo

const UsuarioForm = ({ onUsuarioCreado }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    apellido: '',
    cedula: '',
    rol: 'RECEPCIONISTA',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8094/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const nuevoUsuario = await response.json();
      onUsuarioCreado(nuevoUsuario);

      setFormData({
        username: '',
        password: '',
        nombre: '',
        apellido: '',
        cedula: '',
        rol: 'RECEPCIONISTA',
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
    }
  };

  return (
    <form className="formulario-usuario" onSubmit={handleSubmit}>
      <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
      <input name="password" value={formData.password} onChange={handleChange} placeholder="Password" type="password" required />
      <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Nombre" required />
      <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Apellido" required />
      <input name="cedula" value={formData.cedula} onChange={handleChange} placeholder="Cédula" required />
      <select name="rol" value={formData.rol} onChange={handleChange}>
        <option value="RECEPCIONISTA">Recepcionista</option>
        <option value="ADMIN">Administrador</option>
      </select>
      <button type="submit" className="btn-registrar">Registrar</button>
    </form>
  );
};

export default UsuarioForm;

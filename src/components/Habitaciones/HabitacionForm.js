import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Habitaciones.css';

const HabitacionForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    numeroHabitacion: '',
    tipo: 'SOLA', // SOLA, DOBLE, MATRIMONIAL
    climatizacion: 'AIRE_ACONDICIONADO', // AIRE_ACONDICIONADO, VENTILADOR
    estado: 'LIBRE', // LIBRE, OCUPADO, LIMPIEZA
    disponible: true,
    precio: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        numeroHabitacion: parseInt(form.numeroHabitacion),
        tipo: form.tipo,
        climatizacion: form.climatizacion,
        estado: form.estado,
        disponible: form.disponible,
        precio: parseFloat(form.precio)
      };

      await axios.post('http://localhost:8094/api/habitaciones', payload);
      setSuccess('Habitación creada correctamente');

      setTimeout(() => {
        navigate('/habitaciones');
      }, 2000);
    } catch (err) {
      console.error('Error al guardar la habitación:', err);
      setError('Error al guardar la habitación. Verifica los datos e inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="habitacion-form-container">
      <h2>Nueva Habitación</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="habitacion-form">
        <div className="form-group">
          <label htmlFor="numeroHabitacion">Número de Habitación</label>
          <input
            type="number"
            id="numeroHabitacion"
            name="numeroHabitacion"
            value={form.numeroHabitacion}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo de Habitación</label>
          <select name="tipo" value={form.tipo} onChange={handleChange} required>
            <option value="SOLA">Sola</option>
            <option value="DOBLE">Doble</option>
            <option value="MATRIMONIAL">Matrimonial</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="climatizacion">Climatización</label>
          <select name="climatizacion" value={form.climatizacion} onChange={handleChange} required>
            <option value="AIRE_ACONDICIONADO">Aire Acondicionado</option>
            <option value="VENTILADOR">Ventilador</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select name="estado" value={form.estado} onChange={handleChange} required>
            <option value="LIBRE">Libre</option>
            <option value="OCUPADO">Ocupado</option>
            <option value="LIMPIEZA">Limpieza</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              name="disponible"
              checked={form.disponible}
              onChange={handleChange}
            />
            Disponible
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" className="btn-cancelar" onClick={() => navigate('/habitaciones')}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitacionForm;

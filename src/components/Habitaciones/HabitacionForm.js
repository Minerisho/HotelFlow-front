import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Habitaciones.css';

const HabitacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [habitacion, setHabitacion] = useState({
    numero: '',
    tipo: 'INDIVIDUAL',
    capacidad: 1,
    tarifaBase: '',
    estado: 'DISPONIBLE',
    descripcion: ''
  });

  const isEditing = id !== undefined;

  useEffect(() => {
    if (isEditing) {
      fetchHabitacion();
    }
  }, [id]);

  const fetchHabitacion = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8094/api/habitaciones/${id}`);
      setHabitacion(response.data);
    } catch (err) {
      console.error('Error al cargar la habitación:', err);
      setError('Error al cargar los datos de la habitación.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHabitacion({
      ...habitacion,
      [name]: value
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setHabitacion({
      ...habitacion,
      [name]: name === 'tarifaBase' ? parseFloat(value) : parseInt(value, 10)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isEditing) {
        // Actualizar habitación existente
        await axios.put(`http://localhost:8094/api/habitaciones/${id}`, habitacion);
        setSuccess('Habitación actualizada correctamente');
      } else {
        // Crear nueva habitación
        await axios.post('http://localhost:8094/api/habitaciones', habitacion);
        setSuccess('Habitación creada correctamente');
        setHabitacion({
          numero: '',
          tipo: 'INDIVIDUAL',
          capacidad: 1,
          tarifaBase: 0,
          estado: 'DISPONIBLE',
          descripcion: ''
        });
      }
      
      // Redirigir después de un breve retraso para que el usuario vea el mensaje
      setTimeout(() => navigate('/habitaciones'), 2000);
    } catch (err) {
      console.error('Error al guardar la habitación:', err);
      if (err.response && err.response.data) {
        setError(`Error: ${err.response.data}`);
      } else {
        setError('Error al guardar la habitación. Por favor, inténtalo de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) return <div className="loading">Cargando datos de la habitación...</div>;

  return (
    <div className="habitacion-form-container">
      <h2>{isEditing ? 'Editar Habitación' : 'Nueva Habitación'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="habitacion-form">
        <div className="form-group">
          <label htmlFor="numero">Número de Habitación</label>
          <input
            type="text"
            id="numero"
            name="numero"
            value={habitacion.numero}
            onChange={handleChange}
            required
            placeholder="Ej. 101"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tipo">Tipo de Habitación</label>
          <select
            id="tipo"
            name="tipo"
            value={habitacion.tipo}
            onChange={handleChange}
            required
          >
            <option value="INDIVIDUAL">Individual</option>
            <option value="DOBLE">Doble</option>
            <option value="MATRIMONIAL">Matrimonial</option>
            <option value="SUITE">Suite</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="capacidad">Capacidad</label>
          <input
            type="number"
            id="capacidad"
            name="capacidad"
            value={habitacion.capacidad}
            onChange={handleNumberChange}
            required
            min="1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tarifaBase">Tarifa Base</label>
          <input
            type="number"
            id="tarifaBase"
            name="tarifaBase"
            value={habitacion.tarifaBase}
            onChange={handleNumberChange}
            required
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          <select
            id="estado"
            name="estado"
            value={habitacion.estado}
            onChange={handleChange}
            required
          >
            <option value="DISPONIBLE">Disponible</option>
            <option value="OCUPADA">Ocupada</option>
            <option value="EN_LIMPIEZA">En Limpieza</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={habitacion.descripcion || ''}
            onChange={handleChange}
            rows="4"
            placeholder="Descripción de la habitación"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-guardar" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
          <button 
            type="button" 
            className="btn-cancelar" 
            onClick={() => navigate('/habitaciones')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitacionForm;
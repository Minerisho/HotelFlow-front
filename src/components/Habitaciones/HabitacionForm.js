import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { habitacionService } from '../../Services/api'; // Ajusta la ruta si es necesario
import './Habitaciones.css';

const HabitacionForm = () => {
  const navigate = useNavigate();
  const { numeroHabitacion: paramNumeroHabitacion } = useParams();
  const isEditing = Boolean(paramNumeroHabitacion);

  const [form, setForm] = useState({
    numeroHabitacion: '',
    tipo: 'SOLA', // Valor por defecto según PDF 
    climatizacion: 'AIRE_ACONDICIONADO', // Valor por defecto según PDF 
    estado: 'LIBRE', // Valor por defecto según PDF 
    disponible: true,
    precio: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing && paramNumeroHabitacion) {
      setLoading(true);
      habitacionService.getByNumero(paramNumeroHabitacion)
        .then(data => { // Asumimos que el servicio devuelve el objeto data directamente
          setForm({
            numeroHabitacion: data.numeroHabitacion.toString(),
            tipo: data.tipo,
            climatizacion: data.climatizacion,
            estado: data.estado,
            disponible: data.disponible,
            precio: data.precio.toString(),
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Error al cargar datos de la habitación:', err);
          setError('No se pudieron cargar los datos de la habitación para editar.');
          setLoading(false);
        });
    }
  }, [isEditing, paramNumeroHabitacion]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        numeroHabitacion: parseInt(form.numeroHabitacion, 10),
        tipo: form.tipo,
        climatizacion: form.climatizacion,
        estado: form.estado,
        disponible: form.disponible,
        precio: parseFloat(form.precio)
      };

      if (isEditing) {
        await habitacionService.update(paramNumeroHabitacion, payload); // 
        setSuccess('Habitación actualizada correctamente');
      } else {
        await habitacionService.create(payload); // 
        setSuccess('Habitación creada correctamente');
      }

      setTimeout(() => {
        navigate('/habitaciones');
      }, 1500);

    } catch (err) {
      console.error('Error al guardar la habitación:', err);
      let errorMessage = 'Error al guardar la habitación. Verifique los datos e inténtelo de nuevo.';
      if (err.response) {
        // El PDF (1.3.1) menciona 409 Conflict (habitación ya existe)
        if (err.response.status === 409) {
          errorMessage = 'Error: El número de habitación ya existe.';
        } else if (err.response.data && (typeof err.response.data === 'string' || err.response.data.message)) {
          errorMessage = err.response.data.message || err.response.data;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="habitacion-form-container">
      <h2>{isEditing ? `Editar Habitación N° ${paramNumeroHabitacion}` : 'Nueva Habitación'}</h2>

      {loading && <p className="loading">Cargando...</p>}
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
            readOnly={isEditing} // El número de habitación no debería cambiar en edición
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipo">Tipo de Habitación</label>
          {/* Valores tipo: SOLA, DOBLE, MATRIMONIAL  */}
          <select id="tipo" name="tipo" value={form.tipo} onChange={handleChange} required>
            <option value="SOLA">Sola</option>
            <option value="DOBLE">Doble</option>
            <option value="MATRIMONIAL">Matrimonial</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="climatizacion">Climatización</label>
          {/* Val. climatizacion: AIRE_ACONDICIONADO, VENTILADOR  */}
          <select id="climatizacion" name="climatizacion" value={form.climatizacion} onChange={handleChange} required>
            <option value="AIRE_ACONDICIONADO">Aire Acondicionado</option>
            <option value="VENTILADOR">Ventilador</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="estado">Estado</label>
          {/* Val. estado: LIBRE, OCUPADO, LIMPIEZA  */}
          <select id="estado" name="estado" value={form.estado} onChange={handleChange} required>
            <option value="LIBRE">Libre</option>
            <option value="OCUPADO">Ocupado</option>
            <option value="LIMPIEZA">Limpieza</option>
            {/* MANTENIMIENTO no está en la lista para POST, pero sí en los filtros de la lista */}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            step="0.01"
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="disponible" className="checkbox-label">
            <input
              type="checkbox"
              id="disponible"
              name="disponible"
              checked={form.disponible}
              onChange={handleChange}
            />
            Disponible
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Habitación' : 'Crear Habitación')}
          </button>
          <button type="button" className="btn-cancelar" onClick={() => navigate('/habitaciones')} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default HabitacionForm;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { habitacionService } from '../../Services/api'; // Ajusta la ruta si es necesario
import './Habitaciones.css';

const HabitacionList = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState({
    estado: '', // LIBRE, OCUPADO, LIMPIEZA, MANTENIMIENTO (PDF usa LIBRE, OCUPADO, LIMPIEZA )
    tipo: '',   // SOLA, DOBLE, MATRIMONIAL (PDF usa SOLA, DOBLE, MATRIMONIAL )
    disponible: '', // true o false
    precioMin: '',
    precioMax: '',
  });

  useEffect(() => {
    fetchHabitacionesConFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Carga inicial

  const fetchHabitacionesConFiltros = async () => {
    setLoading(true);
    setError('');
    try {
      const paramsToApi = {};
      if (filtro.estado) paramsToApi.estado = filtro.estado;
      if (filtro.tipo) paramsToApi.tipo = filtro.tipo;
      if (filtro.disponible !== '') paramsToApi.disponible = filtro.disponible === 'true'; // Convertir a booleano
      if (filtro.precioMin) paramsToApi.precioMin = parseFloat(filtro.precioMin);
      if (filtro.precioMax) paramsToApi.precioMax = parseFloat(filtro.precioMax);

      // El PDF (1.3.2) indica que getAll puede recibir estos parámetros 
      const response = await habitacionService.getAll(paramsToApi);
      setHabitaciones(Array.isArray(response) ? response : []); // Asegurar que es un array
    } catch (err) {
      console.error('Error al cargar habitaciones:', err);
      setError('Error al cargar las habitaciones. Inténtalo de nuevo más tarde.');
      setHabitaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prevFiltro => ({
      ...prevFiltro,
      [name]: value
    }));
  };

  const aplicarFiltros = () => {
    fetchHabitacionesConFiltros();
  };

  const resetFiltros = () => {
    setFiltro({
      estado: '',
      tipo: '',
      disponible: '',
      precioMin: '',
      precioMax: '',
    });
    // Es importante llamar a fetchHabitacionesConFiltros con los filtros reseteados
    // para que se refleje inmediatamente en la UI.
    // Considera si quieres que al resetear se fetcheen todas o esperar a "aplicar filtros".
    // Por ahora, lo dejo para que se fetchee al resetear.
    fetchHabitacionesConFiltros();
  };

  const eliminarHabitacion = async (numeroHabitacion) => {
    // El PDF (1.3.8) especifica DELETE /api/habitaciones/{numeroHabitacion} 
    if (window.confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      try {
        await habitacionService.delete(numeroHabitacion);
        setHabitaciones(prevHabitaciones =>
          prevHabitaciones.filter(h => h.numeroHabitacion !== numeroHabitacion)
        );
      } catch (err) {
        console.error('Error al eliminar la habitación:', err);
        // El PDF (1.3.8) menciona error 409 Conflict (reservas activas) 
        setError(err.response?.data?.message || 'Error al eliminar la habitación. Verifique si tiene reservas activas.');
      }
    }
  };

  const handleEstadoChange = async (numeroHabitacion, nuevoEstado) => {
    // El PDF (1.3.6) especifica PATCH /api/habitaciones/{numeroHabitacion}/estado 
    // con payload {"estado": "NUEVO_ESTADO"} 
    try {
      const response = await habitacionService.updateEstado(numeroHabitacion, { estado: nuevoEstado });
      setHabitaciones(prevHabitaciones =>
        prevHabitaciones.map(h =>
          h.numeroHabitacion === numeroHabitacion ? { ...h, ...response } : h // Actualizar con la respuesta completa
        )
      );
    } catch (err) {
      console.error('Error al cambiar el estado:', err);
      setError('Error al cambiar el estado de la habitación.');
    }
  };

  const getEstadoClass = (estado) => {
    if (!estado) return '';
    switch (estado.toUpperCase()) {
      case 'LIBRE': return 'estado-disponible'; // 
      case 'OCUPADO': return 'estado-ocupada';  // 
      case 'LIMPIEZA': return 'estado-limpieza'; // 
      case 'MANTENIMIENTO': return 'estado-mantenimiento'; // Asumido, aunque no en POST, es un estado común
      default: return 'estado-desconocido';
    }
  };

  return (
    <div className="habitaciones-container">
      <h2>Gestión de Habitaciones</h2>

      <div className="actions-bar">
        <Link to="/habitaciones/nueva" className="btn-crear">Nueva Habitación</Link>
      </div>

      <div className="filtros-container">
        <h3>Filtros</h3>
        <div className="filtros-form">
          <div className="filtro-grupo">
            <label htmlFor="estadoFiltro">Estado:</label>
            <select id="estadoFiltro" name="estado" value={filtro.estado} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="LIBRE">Libre</option> {/*  */}
              <option value="OCUPADO">Ocupado</option> {/*  */}
              <option value="LIMPIEZA">Limpieza</option> {/*  */}
              {/* MANTENIMIENTO es un estado lógico, no listado en POST pero plausible para GET */}
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="tipoFiltro">Tipo:</label>
            <select id="tipoFiltro" name="tipo" value={filtro.tipo} onChange={handleFilterChange} >
              <option value="">Todos</option>
              <option value="SOLA">Sola</option> {/*  */}
              <option value="DOBLE">Doble</option> {/*  */}
              <option value="MATRIMONIAL">Matrimonial</option> {/*  */}
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="disponibleFiltro">Disponible:</label>
            <select id="disponibleFiltro" name="disponible" value={filtro.disponible} onChange={handleFilterChange} >
              <option value="">Todos</option>
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label htmlFor="precioMinFiltro">Precio Mín.:</label>
            <input type="number" id="precioMinFiltro" name="precioMin" value={filtro.precioMin} onChange={handleFilterChange} placeholder="Ej: 50000" />
          </div>

          <div className="filtro-grupo">
            <label htmlFor="precioMaxFiltro">Precio Máx.:</label>
            <input type="number" id="precioMaxFiltro" name="precioMax" value={filtro.precioMax} onChange={handleFilterChange} placeholder="Ej: 200000" />
          </div>

          <div className="filtro-acciones">
            <button onClick={aplicarFiltros} className="btn-aplicar">Aplicar Filtros</button>
            <button onClick={resetFiltros} className="btn-reset">Limpiar</button>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Cargando habitaciones...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && habitaciones.length === 0 && !error && (
        <div className="no-results">No hay habitaciones que coincidan con los criterios de búsqueda.</div>
      )}

      {!loading && habitaciones.length > 0 && (
        <div className="habitaciones-grid">
          {habitaciones.map(habitacion => (
            // HabitacionDTO: numeroHabitacion, tipo, climatizacion, estado, disponible, precio 
            <div key={habitacion.numeroHabitacion} className="habitacion-card">
              <div className="habitacion-header">
                <h3>Habitación {habitacion.numeroHabitacion}</h3>
                <span className={`estado-badge ${getEstadoClass(habitacion.estado)}`}>
                  {habitacion.estado ? habitacion.estado.replace('_', ' ') : 'N/A'}
                </span>
              </div>

              <div className="habitacion-info">
                <p><strong>Tipo:</strong> {habitacion.tipo || 'N/A'}</p>
                <p><strong>Climatización:</strong> {habitacion.climatizacion ? habitacion.climatizacion.replace('_', ' ') : 'N/A'}</p>
                <p><strong>Precio:</strong> ${typeof habitacion.precio === 'number' ? habitacion.precio.toFixed(2) : 'N/A'}</p>
                <p><strong>Disponible:</strong> {typeof habitacion.disponible === 'boolean' ? (habitacion.disponible ? 'Sí' : 'No') : 'N/A'}</p>
              </div>

              <div className="habitacion-acciones">
                <Link to={`/habitaciones/editar/${habitacion.numeroHabitacion}`} className="btn-editar">
                  Editar
                </Link>
                <button
                  onClick={() => eliminarHabitacion(habitacion.numeroHabitacion)}
                  className="btn-eliminar"
                >
                  Eliminar
                </button>
              </div>
              <div className="cambio-estado">
                <label htmlFor={`estado-select-${habitacion.numeroHabitacion}`}>Cambiar Estado:</label>
                <select
                  id={`estado-select-${habitacion.numeroHabitacion}`}
                  value={habitacion.estado}
                  onChange={(e) => handleEstadoChange(habitacion.numeroHabitacion, e.target.value)}
                >
                  <option value="LIBRE">Libre</option> {/*  */}
                  <option value="OCUPADO">Ocupado</option> {/*  */}
                  <option value="LIMPIEZA">Limpieza</option> {/*  */}
                  <option value="MANTENIMIENTO">Mantenimiento</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitacionList;
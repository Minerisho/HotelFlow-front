import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Habitaciones.css';


const HabitacionList = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState({
    estado: '',
    tipo: '',
    capacidad: '',
    tarifaMaxima: ''
  });

  useEffect(() => {
    fetchHabitaciones();
  }, []);

  const fetchHabitaciones = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8094/api/habitaciones');
      setHabitaciones(response.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar habitaciones:', err);
      setError('Error al cargar las habitaciones. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltro({
      ...filtro,
      [name]: value
    });
  };

  const aplicarFiltros = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:8094/api/habitaciones';
      
      // Añadir filtros si están presentes
      if (filtro.estado && filtro.tipo) {
        url = `${url}/filtrar?estado=${filtro.estado}&tipo=${filtro.tipo}`;
      } else if (filtro.estado) {
        url = `${url}/estado/${filtro.estado}`;
      } else if (filtro.tipo) {
        url = `${url}/tipo/${filtro.tipo}`;
      } else if (filtro.capacidad) {
        url = `${url}/capacidad/${filtro.capacidad}`;
      } else if (filtro.tarifaMaxima) {
        url = `${url}/tarifa/${filtro.tarifaMaxima}`;
      }
      
      const response = await axios.get(url);
      setHabitaciones(response.data);
    } catch (err) {
      console.error('Error al aplicar filtros:', err);
      setError('Error al filtrar habitaciones.');
    } finally {
      setLoading(false);
    }
  };

  const resetFiltros = () => {
    setFiltro({
      estado: '',
      tipo: '',
      capacidad: '',
      tarifaMaxima: ''
    });
    fetchHabitaciones();
  };

  const eliminarHabitacion = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta habitación?')) {
      try {
        await axios.delete(`http://localhost:8094/api/habitaciones/${id}`);
        setHabitaciones(habitaciones.filter(habitacion => habitacion.idHabitacion !== id));
      } catch (err) {
        console.error('Error al eliminar la habitación:', err);
        setError('Error al eliminar la habitación.');
      }
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.patch(`http://localhost:8094/api/habitaciones/${id}/estado`, { estado: nuevoEstado });
      // Actualizar el estado en la lista local
      setHabitaciones(habitaciones.map(habitacion =>
        habitacion.idHabitacion === id
          ? { ...habitacion, estado: nuevoEstado }
          : habitacion
      ));
    } catch (err) {
      console.error('Error al cambiar el estado:', err);
      setError('Error al cambiar el estado de la habitación.');
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado) {
      case 'DISPONIBLE': return 'estado-disponible';
      case 'OCUPADA': return 'estado-ocupada';
      case 'EN_LIMPIEZA': return 'estado-limpieza';
      case 'MANTENIMIENTO': return 'estado-mantenimiento';
      default: return '';
    }
  };

  if (loading && habitaciones.length === 0) return <div className="loading">Cargando habitaciones...</div>;

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
            <label>Estado:</label>
            <select 
              name="estado" 
              value={filtro.estado} 
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCUPADA">Ocupada</option>
              <option value="EN_LIMPIEZA">En Limpieza</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label>Tipo:</label>
            <select 
              name="tipo" 
              value={filtro.tipo} 
              onChange={handleFilterChange}
            >
              <option value="">Todos</option>
              <option value="INDIVIDUAL">Individual</option>
              <option value="DOBLE">Doble</option>
              <option value="MATRIMONIAL">Matrimonial</option>
              <option value="SUITE">Suite</option>
            </select>
          </div>
          
          <div className="filtro-grupo">
            <label>Capacidad mínima:</label>
            <input 
              type="number" 
              name="capacidad" 
              value={filtro.capacidad} 
              onChange={handleFilterChange} 
              min="1"
            />
          </div>
          
          <div className="filtro-grupo">
            <label>Tarifa máxima:</label>
            <input 
              type="number" 
              name="tarifaMaxima" 
              value={filtro.tarifaMaxima} 
              onChange={handleFilterChange} 
              min="0"
              step="0.01"
            />
          </div>
          
          <div className="filtro-acciones">
            <button onClick={aplicarFiltros} className="btn-aplicar">Aplicar Filtros</button>
            <button onClick={resetFiltros} className="btn-reset">Limpiar</button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {habitaciones.length === 0 ? (
        <div className="no-results">No hay habitaciones que coincidan con los criterios de búsqueda.</div>
      ) : (
        <div className="habitaciones-grid">
          {habitaciones.map(habitacion => (
            <div key={habitacion.idHabitacion} className="habitacion-card">
              <div className="habitacion-header">
                <h3>Habitación {habitacion.numero}</h3>
                <span className={`estado-badge ${getEstadoClass(habitacion.estado)}`}>
                  {habitacion.estado}
                </span>
              </div>
              
              <div className="habitacion-info">
                <p><strong>Tipo:</strong> {habitacion.tipo}</p>
                <p><strong>Capacidad:</strong> {habitacion.capacidad} personas</p>
                <p><strong>Tarifa:</strong> ${habitacion.tarifaBase}</p>
                {habitacion.descripcion && (
                  <p className="descripcion"><strong>Descripción:</strong> {habitacion.descripcion}</p>
                )}
              </div>
              
              <div className="habitacion-acciones">
                <Link to={`/habitaciones/editar/${habitacion.idHabitacion}`} className="btn-editar">
                  Editar
                </Link>
                <button 
                  onClick={() => eliminarHabitacion(habitacion.idHabitacion)} 
                  className="btn-eliminar"
                >
                  Eliminar
                </button>
              </div>
            
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitacionList;
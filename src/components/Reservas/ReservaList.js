import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Reservas.css';

const ReservaList = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState({
    estado: '',
    usuario: '',
    reserva: '',
    fecha_entrada: '',
    fecha_salida: '',
    fecha_creacion: ''
  });

  useEffect(() => {
    fetchReservas();
  }, []);

  const fetchReservas = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8094/api/reservas');
      setReservas(response.data);
      setError('');
    } catch (err) {
      console.error('Error al cargar Reservas:', err);
      setError('Error al cargar las Reservas. Inténtalo de nuevo más tarde.');
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

  const confirmarReserva = async (id) => {
    if (window.confirm("¿Está seguro se quiere confirmar esta reserva?")) {
      try {
        await axios.patch(`http://localhost:8094/api/reservas/${id}/confirmar`);
        // Actualizamos la reserva cuyo id coincide
        setReservas(reservas.map(reserva =>
          reserva.idReserva === id
            ? { ...reserva, estado: 'CONFIRMADA' }
            : reserva
        ));
      } catch (err) {
        console.error('Error al confirmar:', err);
        setError('Error al confirmar la reserva.');
      }
    }
  };

  const cancelarReserva = async (id) => {
    if (window.confirm("¿Está seguro se quiere cancelar esta reserva?")) {
      try {
        await axios.patch(`http://localhost:8094/api/reservas/${id}/cancelar`);
        // Actualizamos la reserva cuyo id coincide
        setReservas(reservas.map(reserva =>
          reserva.idReserva === id
            ? { ...reserva, estado: 'CANCELADA' }
            : reserva
        ));
      } catch (err) {
        console.error('Error al cancelar:', err);
        setError('Error al cancelar la reserva.');
      }
    }
  };

  const getEstadoClass = (estado) => {
    switch (estado.toUpperCase()) {
      case 'CONFIRMADA': return 'estado-confirmada';
      case 'PENDIENTE': return 'estado-pendiente';
      case 'CANCELADA':
      case 'CANCELADO': return 'estado-cancelado';
      default: return '';
    }
  };

  if (loading && reservas.length === 0) return <div className="loading">Cargando Reservas...</div>;

  return (
    <div className="Reservas-container">
      <h2>Gestión de Reservas</h2>
      
      <div className="actions-bar">
        <Link to="/reservas/crear" className="btn-crear">Nueva Reserva</Link>
      </div>
    
      {error && <div className="error-message">{error}</div>}
      
      {reservas.length === 0 ? (
        <div className="no-results">No hay Reservas.</div>
      ) : (
        <div className="Reservas-grid">
          {reservas.map(reserva => (
            <div key={reserva.idReserva} className="reserva-card">
              <div className="reserva-header">
                <h3>Reserva {reserva.numero}</h3>
                <span className={`estado-badge ${getEstadoClass(reserva.estado)}`}>
                  {reserva.estado}
                </span>
              </div>
              
              <div className="reserva-info">
                <p><strong>Nombre:</strong> {reserva.nombreUsuario}</p>
                <p><strong>Habitación:</strong> {reserva.numeroHabitacion}</p>
                <p><strong>Fecha de entrada:</strong> {reserva.fechaEntrada}</p>
                <p><strong>Fecha de salida:</strong> {reserva.fechaSalida}</p>
                <p><strong>Total Reserva:</strong> $ {reserva.totalReserva}</p>
              </div>
              
              <div className="reserva-acciones">
                <Link to={`/Reservas/editar/${reserva.idReserva}`} className="btn-editar">
                  Editar
                </Link>
                <button
                  onClick={() => confirmarReserva(reserva.idReserva)}
                  className="btn-confirmar"
                  disabled={reserva.estado.toUpperCase() !== "PENDIENTE"}
                  title={reserva.estado.toUpperCase() === "PENDIENTE" ? "Confirmar Reserva" : "Solo se puede confirmar una reserva pendiente"}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => cancelarReserva(reserva.idReserva)}
                  className="btn-cancelar-accion"
                  title="Cancelar Reserva"
                >
                  Cancelar
                </button>
              </div>
            
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservaList;

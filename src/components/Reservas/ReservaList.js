import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reservaService } from '../../Services/api'; // Ajusta la ruta si es necesario
import './Reservas.css';

const ReservaList = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState({
    idCliente: '',
    numeroHabitacion: '',
    fechaInicioCreacion: '', // PDF: fechaInicioCreacion
    fechaFinCreacion: '',   // PDF: fechaFinCreacion
    estado: '', // PDF: PAGADA, NO PAGADA, CANCELADA, ACTIVA
  });

  useEffect(() => {
    fetchReservasConFiltros();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReservasConFiltros = async () => {
    setLoading(true);
    setError('');
    try {
      const paramsToApi = {};
      if (filtro.idCliente) paramsToApi.idCliente = filtro.idCliente;
      if (filtro.numeroHabitacion) paramsToApi.numeroHabitacion = filtro.numeroHabitacion;
      if (filtro.fechaInicioCreacion) paramsToApi.fechaInicioCreacion = filtro.fechaInicioCreacion;
      if (filtro.fechaFinCreacion) paramsToApi.fechaFinCreacion = filtro.fechaFinCreacion;
      if (filtro.estado) paramsToApi.estado = filtro.estado;

      const response = await reservaService.getAll(paramsToApi); // 
      setReservas(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar Reservas:', err);
      setError('Error al cargar las Reservas. Inténtalo de nuevo más tarde.');
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltro(prevFiltro => ({ ...prevFiltro, [name]: value }));
  };

  const aplicarFiltros = () => {
    fetchReservasConFiltros();
  };

  const resetFiltros = () => {
    setFiltro({
      idCliente: '',
      numeroHabitacion: '',
      fechaInicioCreacion: '',
      fechaFinCreacion: '',
      estado: '',
    });
    fetchReservasConFiltros();
  };

  const cambiarEstadoReserva = async (idReserva, nuevoEstadoApi, tipoPago = null) => {
    // El PDF (1.5.6) indica PATCH con payload {"estado": "PAGADA", "tipoPago": "BANCOLOMBIA"} 
    // Estados válidos: PAGADA, NO PAGADA, CANCELADA, ACTIVA 
    if (window.confirm(`¿Está seguro que quiere cambiar el estado de la reserva a ${nuevoEstadoApi}?`)) {
      try {
        const payload = { estado: nuevoEstadoApi };
        // Solo añadir tipoPago si es relevante para el nuevo estado (ej. PAGADA) y se proporciona
        if (nuevoEstadoApi === 'PAGADA' && tipoPago) {
          payload.tipoPago = tipoPago;
        } else if (nuevoEstadoApi === 'PAGADA' && !tipoPago) {
          // Podrías pedir el tipo de pago aquí o usar un valor por defecto
          const metodoPago = prompt("Ingrese el método de pago (EFECTIVO, NEQUI, BANCOLOMBIA):", "EFECTIVO");
          if (!["EFECTIVO", "NEQUI", "BANCOLOMBIA"].includes(metodoPago?.toUpperCase())) {
            alert("Método de pago inválido.");
            return;
          }
          payload.tipoPago = metodoPago?.toUpperCase();
        }


        const updatedReserva = await reservaService.updateEstado(idReserva, payload); // 
        setReservas(prevReservas =>
          prevReservas.map(reserva =>
            reserva.idReserva === idReserva
              ? { ...reserva, ...updatedReserva } // Usar la reserva actualizada del backend
              : reserva
          )
        );
      } catch (err) {
        console.error(`Error al cambiar estado a ${nuevoEstadoApi}:`, err);
        setError(`Error al cambiar el estado de la reserva: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const cancelarReservaDirecto = async (idReserva) => {
    // El PDF (1.5.7) indica que DELETE /api/reservas/{idReserva} cambia estado a CANCELADA 
    if (window.confirm("¿Está seguro que quiere cancelar esta reserva? Esto cambiará su estado a CANCELADA.")) {
      try {
        await reservaService.delete(idReserva); // 
        // Actualizar localmente o recargar la lista
        setReservas(prevReservas =>
          prevReservas.map(reserva =>
            reserva.idReserva === idReserva
              ? { ...reserva, estadoReserva: 'CANCELADA' } // Actualiza el estado local
              : reserva
          ).filter(r => r.idReserva !== idReserva && r.estadoReserva !== 'CANCELADA') // Opcional: quitarla de la lista activa
        );
        // Opcionalmente, para ver el estado CANCELADA:
        // fetchReservasConFiltros(); // Para recargar y ver el estado actualizado
      } catch (err) {
        console.error('Error al cancelar la reserva:', err);
        setError('Error al cancelar la reserva.');
      }
    }
  };

  const getEstadoClass = (estado) => {
    if (!estado) return '';
    switch (estado.toUpperCase()) {
      case 'PAGADA':
      case 'ACTIVA': // API usa ACTIVA
        return 'estado-confirmada'; // Verde
      case 'NO_PAGADA': // API usa NO_PAGADA
      case 'PENDIENTE': // Frontend usaba PENDIENTE
        return 'estado-pendiente'; // Naranja
      case 'CANCELADA':
        return 'estado-cancelado'; // Rojo
      default:
        return 'estado-desconocido';
    }
  };
  // ReservaDTO fields: idReserva, idCliente, nombreCliente, numeroHabitacion, tipoHabitacion,
  // fechaLlegadaEstadia, fechaSalidaEstadia, estadoReserva, tipoPago, fechaReserva 
  return (
    <div className="Reservas-container">
      <h2>Gestión de Reservas</h2>

      <div className="actions-bar">
        <Link to="/reservas/nueva" className="btn-crear">Nueva Reserva</Link>
      </div>

      <div className="filtros-container">
        <h3>Filtros de Reservas</h3>
        <div className="filtros-form">
          <div className="filtro-grupo">
            <label htmlFor="estadoReservaFiltro">Estado:</label>
            <select name="estado" id="estadoReservaFiltro" value={filtro.estado} onChange={handleFilterChange}>
              <option value="">Todos</option>
              <option value="NO_PAGADA">No Pagada</option> {/* */}
              <option value="PAGADA">Pagada</option> {/* */}
              <option value="ACTIVA">Activa</option> {/* */}
              <option value="CANCELADA">Cancelada</option> {/* */}
            </select>
          </div>
          <div className="filtro-grupo">
            <label htmlFor="idClienteFiltro">ID Cliente:</label>
            <input type="number" id="idClienteFiltro" name="idCliente" value={filtro.idCliente} onChange={handleFilterChange} placeholder="ID Cliente" />
          </div>
          <div className="filtro-grupo">
            <label htmlFor="numeroHabitacionFiltro">Nº Habitación:</label>
            <input type="number" id="numeroHabitacionFiltro" name="numeroHabitacion" value={filtro.numeroHabitacion} onChange={handleFilterChange} placeholder="Nº Habitación" />
          </div>
          <div className="filtro-acciones">
            <button onClick={aplicarFiltros} className="btn-aplicar">Aplicar</button>
            <button onClick={resetFiltros} className="btn-reset">Limpiar</button>
          </div>
        </div>
      </div>

      {loading && <div className="loading">Cargando Reservas...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && reservas.length === 0 ? (
        <div className="no-results">No hay Reservas que coincidan con los filtros.</div>
      ) : (
        <div className="Reservas-grid">
          {reservas.map(reserva => (
            <div key={reserva.idReserva} className="reserva-card">
              <div className="reserva-header">
                <h3>Reserva #{reserva.idReserva}</h3>
                <span className={`estado-badge ${getEstadoClass(reserva.estadoReserva)}`}>
                  {reserva.estadoReserva ? reserva.estadoReserva.replace('_', ' ') : 'N/A'}
                </span>
              </div>

              <div className="reserva-info">
                <p><strong>Cliente:</strong> {reserva.nombreCliente || `ID: ${reserva.idCliente}`}</p>
                <p><strong>Habitación:</strong> {reserva.numeroHabitacion} ({reserva.tipoHabitacion || 'N/A'})</p>
                <p><strong>Llegada:</strong> {new Date(reserva.fechaLlegadaEstadia).toLocaleDateString()}</p>
                <p><strong>Salida:</strong> {new Date(reserva.fechaSalidaEstadia).toLocaleDateString()}</p>
                <p><strong>Tipo Pago:</strong> {reserva.tipoPago || 'N/A'}</p>
                <p><strong>Fecha Reserva:</strong> {new Date(reserva.fechaReserva).toLocaleDateString()}</p>
              </div>

              <div className="reserva-acciones">
                <Link to={`/reservas/editar/${reserva.idReserva}`} className="btn-editar">
                  Editar
                </Link>
                {reserva.estadoReserva === 'NO_PAGADA' && (
                  <button
                    onClick={() => cambiarEstadoReserva(reserva.idReserva, 'PAGADA')}
                    className="btn-confirmar" // Reutilizar estilo o crear uno nuevo
                  >
                    Marcar Pagada
                  </button>
                )}
                {reserva.estadoReserva !== 'CANCELADA' && reserva.estadoReserva !== 'PAGADA' && reserva.estadoReserva !== 'ACTIVA' && (
                   <button
                     onClick={() => cambiarEstadoReserva(reserva.idReserva, 'ACTIVA')}
                     className="btn-activar" // Necesitarás un estilo para este botón
                     title="Marcar como Activa"
                   >
                     Activar
                   </button>
                )}
                {reserva.estadoReserva !== 'CANCELADA' && (
                  <button
                    onClick={() => cancelarReservaDirecto(reserva.idReserva)}
                    className="btn-cancelar-accion"
                  >
                    Cancelar Reserva
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservaList;
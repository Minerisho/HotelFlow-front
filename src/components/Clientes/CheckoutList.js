import React, { useEffect, useState } from "react";
import { habitacionService } from '../../Services/api'; // Ajusta la ruta
import "./CheckoutList.css"; // Asegúrate que la ruta al CSS sea correcta

const CheckoutList = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    obtenerHabitacionesOcupadas();
  }, []);

  const obtenerHabitacionesOcupadas = async () => {
    setLoading(true);
    setError('');
    try {
      // Obtenemos todas y filtramos, o si el backend lo permite, filtramos por estado "OCUPADO"
      // El PDF (1.3.2) indica que GET /habitaciones acepta el filtro ?estado=OCUPADO
      const response = await habitacionService.getAll({ estado: "OCUPADO" });
      setHabitaciones(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error al obtener habitaciones ocupadas:", error);
      setError("Error al cargar las habitaciones ocupadas.");
      setHabitaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmarDesocupar = (habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setMostrarConfirmacion(true);
  };

  const cancelarDesocupar = () => {
    setHabitacionSeleccionada(null);
    setMostrarConfirmacion(false);
  };

  const desocuparHabitacion = async () => {
    if (!habitacionSeleccionada || !habitacionSeleccionada.numeroHabitacion) return;
    setLoading(true); // Indicar carga durante la operación
    try {
      // El PDF (1.3.6) indica PATCH /api/habitaciones/{numeroHabitacion}/estado
      // Payload: {"estado": "LIMPIEZA"} 
      await habitacionService.updateEstado(habitacionSeleccionada.numeroHabitacion, {
        estado: "LIMPIEZA",
      });
      alert(`La habitación ${habitacionSeleccionada.numeroHabitacion} fue marcada como en LIMPIEZA.`);
      setMostrarConfirmacion(false);
      setHabitacionSeleccionada(null);
      // Recargar la lista para reflejar el cambio, ya que la habitación desocupada no debería aparecer
      obtenerHabitacionesOcupadas();
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Hubo un error al intentar desocupar la habitación.");
      setError("Error al desocupar la habitación.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && habitaciones.length === 0) return <div className="loading">Cargando habitaciones ocupadas...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="checkout-list-container"> {/* Cambiado de checkout-list para evitar colisión con clase de App.css */}
      <h2>Habitaciones Ocupadas para Check-out</h2>

      {habitaciones.length === 0 && !loading ? (
        <p>No hay habitaciones ocupadas en este momento.</p>
      ) : (
        <div className="habitaciones-grid">
          {habitaciones.map((habitacion) => (
            // Usar campos de HabitacionDTO: numeroHabitacion, tipo, precio, estado 
            <div key={habitacion.numeroHabitacion} className="habitacion-card">
              <h3>Habitación {habitacion.numeroHabitacion}</h3>
              <p><strong>Tipo:</strong> {habitacion.tipo}</p>
              <p><strong>Precio:</strong> ${typeof habitacion.precio === 'number' ? habitacion.precio.toFixed(2) : 'N/A'}</p>
              <p><strong>Estado:</strong> {habitacion.estado}</p>
              <button className="desocupar-btn" onClick={() => confirmarDesocupar(habitacion)}>
                Realizar Check-out
              </button>
            </div>
          ))}
        </div>
      )}

      {mostrarConfirmacion && habitacionSeleccionada && (
        <div className="modal-confirmacion">
          <div className="modal-contenido">
            <h3>¿Confirmar Check-out?</h3>
            <p>Habitación {habitacionSeleccionada.numeroHabitacion}</p>
            <p>Tipo: {habitacionSeleccionada.tipo}</p>
            <p>Al confirmar, la habitación pasará al estado "LIMPIEZA".</p>
            <div className="modal-botones">
              <button className="confirmar-btn" onClick={desocuparHabitacion} disabled={loading}>
                {loading ? 'Procesando...' : 'Confirmar'}
              </button>
              <button className="cancelar-btn" onClick={cancelarDesocupar} disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutList;
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CheckoutList.css";

const CheckoutList = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    obtenerHabitaciones();
  }, []);

  const obtenerHabitaciones = async () => {
    try {
      const response = await axios.get("http://localhost:8094/api/habitaciones");
      setHabitaciones(response.data);
    } catch (error) {
      console.error("Error al obtener habitaciones:", error);
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
    try {
      await axios.patch(`http://localhost:8094/api/habitaciones/${habitacionSeleccionada.id}/estado`, {
        estado: "LIMPIEZA",
      });
      alert("La habitación fue marcada como en LIMPIEZA.");
      setMostrarConfirmacion(false);
      obtenerHabitaciones();
    } catch (error) {
      console.error("Error al cambiar el estado:", error);
      alert("Hubo un error al intentar desocupar la habitación.");
    }
  };

  const habitacionesOcupadas = habitaciones.filter(
    (h) => h.estado?.toUpperCase() === "OCUPADA"
  );

  return (
    <div className="checkout-list">
      <h2>Habitaciones Ocupadas</h2>

      {habitacionesOcupadas.length === 0 ? (
        <p>No hay habitaciones ocupadas en este momento.</p>
      ) : (
        <div className="habitaciones-grid">
          {habitacionesOcupadas.map((habitacion) => (
            <div key={habitacion.id} className="habitacion-card">
              <h3>Habitación {habitacion.numero}</h3>
              <p><strong>Tipo:</strong> {habitacion.tipo}</p>
              <p><strong>Precio:</strong> ${habitacion.precio}</p>
              <p><strong>Estado:</strong> {habitacion.estado}</p>
              <button className="desocupar-btn" onClick={() => confirmarDesocupar(habitacion)}>
                DESOCUPAR
              </button>
            </div>
          ))}
        </div>
      )}

      {mostrarConfirmacion && habitacionSeleccionada && (
        <div className="modal-confirmacion">
          <div className="modal-contenido">
            <h3>¿Confirmar Desocupación?</h3>
            <p>Habitación {habitacionSeleccionada.numero}</p>
            <p>Tipo: {habitacionSeleccionada.tipo}</p>
            <p>Precio: ${habitacionSeleccionada.precio}</p>
            <div className="modal-botones">
              <button className="confirmar-btn" onClick={desocuparHabitacion}>Confirmar</button>
              <button className="cancelar-btn" onClick={cancelarDesocupar}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutList;
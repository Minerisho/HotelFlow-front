import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ReservasForm.css";

const ReservasForm = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const [formData, setFormData] = useState({
    idHabitacion: "",
    idUsuario: "",
    fechaEntrada: "",
    fechaSalida: "",
    estado: "PENDIENTE" // Valor por defecto
  });

  // Cargar la lista de habitaciones disponibles
  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        const response = await axios.get("http://localhost:8094/api/habitaciones/estado/DISPONIBLE");
        setHabitaciones(response.data);
      } catch (error) {
        setMensaje("Error al obtener las habitaciones: " + error.message);
      }
    };

    // Obtener los usuarios con rol HUESPED usando el endpoint actualizado
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:8094/api/usuarios/list/huespedes");
        setUsuarios(response.data);
      } catch (error) {
        setMensaje("Error al obtener los usuarios: " + error.message);
      }
    };

    fetchHabitaciones();
    fetchUsuarios();
  }, []);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const crearReserva = async () => {
    try {
      // Se construye el objeto payload y se convierten los IDs a números (si es necesario)
      const payload = {
        idUsuario: parseInt(formData.idUsuario, 10),
        idHabitacion: parseInt(formData.idHabitacion, 10),
        fechaEntrada: formData.fechaEntrada,
        fechaSalida: formData.fechaSalida,
        estado: formData.estado // Enviar estado incluso si la API lo asigna por defecto
      };

      await axios.post("http://localhost:8094/api/reservas", payload);
      setMensaje("Reserva creada con éxito");

      // Reinicia el formulario, manteniendo el valor "PENDIENTE" en el campo de estado
      setFormData({
        idHabitacion: "",
        idUsuario: "",
        fechaEntrada: "",
        fechaSalida: "",
        estado: "PENDIENTE"
      });
    } catch (error) {
      setMensaje("Error al crear la reserva: " + error.message);
    }
  };

  return (
    <div className="reservas-form-container">
      <h2>Crear Reserva</h2>
      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="form-group">
        <label>Habitación Desocupada:</label>
        <select name="idHabitacion" value={formData.idHabitacion} onChange={manejarCambio}>
          <option value="">Seleccione una habitación</option>
          {habitaciones.map(habitacion => (
            <option key={habitacion.idHabitacion} value={habitacion.idHabitacion}>
              {habitacion.numero} - {habitacion.tipo}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Huésped:</label>
        <select name="idUsuario" value={formData.idUsuario} onChange={manejarCambio}>
          <option value="">Seleccione un huésped</option>
          {usuarios.map(usuario => (
            <option key={usuario.idUsuario} value={usuario.idUsuario}>
              {usuario.nombre} {usuario.apellido}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Fecha de Entrada:</label>
        <input
          type="datetime-local"
          name="fechaEntrada"
          value={formData.fechaEntrada}
          onChange={manejarCambio}
        />
      </div>

      <div className="form-group">
        <label>Fecha de Salida:</label>
        <input
          type="datetime-local"
          name="fechaSalida"
          value={formData.fechaSalida}
          onChange={manejarCambio}
        />
      </div>

      <div className="form-group">
        <label>Estado de la Reserva:</label>
        <select name="estado" value={formData.estado} onChange={manejarCambio}>
          <option value="PENDIENTE">PENDIENTE</option>
          <option value="CONFIRMADA">CONFIRMADA</option>
        </select>
      </div>

      <button className="btn-crear" onClick={crearReserva}>
        Crear
      </button>
    </div>
  );
};

export default ReservasForm;

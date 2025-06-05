import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { reservaService, habitacionService, clienteService } from '../../Services/api'; // Ajusta la ruta
import "./ReservasForm.css";

const ReservasForm = () => {
  const navigate = useNavigate();
  // const { idReserva: paramIdReserva } = useParams(); // Para edición, si se implementa
  // const isEditing = Boolean(paramIdReserva); // Para edición

  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false); // Para deshabilitar botón durante submit

  // Payload para POST /api/reservas según PDF (1.5.1)
  // { idCliente, numeroHabitacion, fechaLlegadaEstadia, fechaSalidaEstadia, tipoPago, fechaReserva }
  const [formData, setFormData] = useState({
    idCliente: "",
    numeroHabitacion: "",
    fechaLlegadaEstadia: "",
    fechaSalidaEstadia: "",
    tipoPago: "EFECTIVO", // Valor por defecto según PDF (1.5.1)
    fechaReserva: new Date().toISOString().split('T')[0], // Fecha actual por defecto
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // El PDF (1.3.2) indica que GET /habitaciones acepta ?estado=LIBRE
        const habResponse = await habitacionService.getAll({ estado: 'LIBRE' });
        setHabitacionesDisponibles(Array.isArray(habResponse) ? habResponse : []);

        // El PDF (1.4.2) indica GET /api/clientes para listar clientes
        const cliResponse = await clienteService.getAll();
        setClientes(Array.isArray(cliResponse) ? cliResponse : []);

      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setMensaje({ text: "Error al cargar datos para el formulario: " + (error.message || "Error desconocido"), type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Lógica para cargar datos de reserva si es modo edición (a implementar si es necesario)
  // useEffect(() => {
  //   if (isEditing && paramIdReserva) {
  //     // ... cargar datos de la reserva
  //   }
  // }, [isEditing, paramIdReserva]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ text: "", type: "" });

    if (!formData.idCliente || !formData.numeroHabitacion || !formData.fechaLlegadaEstadia || !formData.fechaSalidaEstadia || !formData.tipoPago || !formData.fechaReserva) {
      setMensaje({ text: "Por favor, complete todos los campos obligatorios.", type: "error" });
      setLoading(false);
      return;
    }
    if (new Date(formData.fechaSalidaEstadia) <= new Date(formData.fechaLlegadaEstadia)) {
      setMensaje({ text: "La fecha de salida debe ser posterior a la fecha de llegada.", type: "error" });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        idCliente: parseInt(formData.idCliente, 10),
        numeroHabitacion: parseInt(formData.numeroHabitacion, 10),
        fechaLlegadaEstadia: formData.fechaLlegadaEstadia,
        fechaSalidaEstadia: formData.fechaSalidaEstadia,
        tipoPago: formData.tipoPago,
        fechaReserva: formData.fechaReserva,
      };

      // if (isEditing) {
      //   await reservaService.update(paramIdReserva, payload);
      //   setMensaje({ text: "Reserva actualizada con éxito. Redirigiendo...", type: "success" });
      // } else {
      await reservaService.create(payload); //
      setMensaje({ text: "Reserva creada con éxito. Redirigiendo...", type: "success" });
      // }

      setTimeout(() => {
        navigate('/reservas');
      }, 2000);

    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      setMensaje({ text: `Error al procesar la reserva: ${error.response?.data?.message || error.message}`, type: "error" });
      setLoading(false);
    }
    // No poner setLoading(false) aquí si hay redirección, para evitar flash de botón habilitado.
  };

  return (
    <div className="reservas-form-container">
      {/* <h2>{isEditing ? 'Editar Reserva' : 'Crear Nueva Reserva'}</h2> */}
      <h2>Crear Nueva Reserva</h2>
      {mensaje.text && <p className={`mensaje ${mensaje.type}`}>{mensaje.text}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="numeroHabitacion">Habitación Disponible:</label>
          <select id="numeroHabitacion" name="numeroHabitacion" value={formData.numeroHabitacion} onChange={manejarCambio} required>
            <option value="">Seleccione una habitación</option>
            {/* HabitacionDTO: numeroHabitacion, tipo, precio  */}
            {habitacionesDisponibles.map(habitacion => (
              <option key={habitacion.numeroHabitacion} value={habitacion.numeroHabitacion}>
                Hab. {habitacion.numeroHabitacion} - {habitacion.tipo} (${habitacion.precio})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="idCliente">Cliente (Huésped):</label>
          <select id="idCliente" name="idCliente" value={formData.idCliente} onChange={manejarCambio} required>
            <option value="">Seleccione un cliente</option>
            {/* Entidad Cliente: idCliente, nombres, apellidos, cedula  */}
            {clientes.map(cliente => (
              <option key={cliente.idCliente} value={cliente.idCliente}>
                {cliente.nombres} {cliente.apellidos} (C.C: {cliente.cedula})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fechaLlegadaEstadia">Fecha y Hora de Llegada:</label>
          <input
            type="datetime-local" // El PDF espera YYYY-MM-DD
            id="fechaLlegadaEstadia"
            name="fechaLlegadaEstadia"
            value={formData.fechaLlegadaEstadia}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fechaSalidaEstadia">Fecha y Hora de Salida:</label>
          <input
            type="datetime-local" // El PDF espera YYYY-MM-DD
            id="fechaSalidaEstadia"
            name="fechaSalidaEstadia"
            value={formData.fechaSalidaEstadia}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipoPago">Método de Pago:</label>
          {/* Valores tipoPago: EFECTIVO, NEQUI, BANCOLOMBIA  */}
          <select id="tipoPago" name="tipoPago" value={formData.tipoPago} onChange={manejarCambio} required>
            <option value="EFECTIVO">Efectivo</option>
            <option value="NEQUI">Nequi</option>
            <option value="BANCOLOMBIA">Bancolombia</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fechaReserva">Fecha de Creación Reserva:</label>
          <input
            type="date" // El PDF espera YYYY-MM-DD 
            id="fechaReserva"
            name="fechaReserva"
            value={formData.fechaReserva}
            onChange={manejarCambio}
            required
          />
        </div>

        <button type="submit" className="btn-crear" disabled={loading}>
          {loading ? 'Procesando...' : (/*isEditing ? 'Actualizar Reserva' :*/ 'Crear Reserva')}
        </button>
      </form>
    </div>
  );
};

export default ReservasForm;
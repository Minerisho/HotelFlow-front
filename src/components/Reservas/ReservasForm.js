import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { reservaService, habitacionService, clienteService } from '../../Services/api';
import "./ReservasForm.css";

const ReservasForm = () => {
  const navigate = useNavigate();
  const { idReserva: paramIdReserva } = useParams();
  const isEditing = Boolean(paramIdReserva);

  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    idCliente: "",
    numeroHabitacion: "",
    fechaLlegadaEstadia: "",
    fechaSalidaEstadia: "",
    tipoPago: "EFECTIVO",
    fechaReserva: new Date().toISOString().split('T')[0],
  });

  // Cargar datos iniciales (habitaciones y clientes)
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingData(true);
      try {
        const habResponse = await habitacionService.getAll({ estado: 'LIBRE' });
        setHabitacionesDisponibles(Array.isArray(habResponse) ? habResponse : []);

        const cliResponse = await clienteService.getAll();
        setClientes(Array.isArray(cliResponse) ? cliResponse : []);

      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        setMensaje({ 
          text: "Error al cargar datos para el formulario: " + (error.message || "Error desconocido"), 
          type: "error" 
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchInitialData();
  }, []);

  // Cargar datos de la reserva si es modo edición
  useEffect(() => {
    const fetchReservaData = async () => {
      if (isEditing && paramIdReserva) {
        setLoadingData(true);
        try {
          console.log("Cargando reserva con ID:", paramIdReserva);
          const reserva = await reservaService.getById(paramIdReserva);
          console.log("Datos completos de reserva recibidos:", JSON.stringify(reserva, null, 2));
          
          if (!reserva) {
            throw new Error("No se encontraron datos de la reserva");
          }

          // **DIAGNÓSTICO MEJORADO** - Verificar diferentes estructuras posibles
          let idClienteValue = "";
          let numeroHabitacionValue = "";

          // Intentar diferentes formas de obtener el ID del cliente
          if (reserva.cliente && reserva.cliente.idCliente) {
            idClienteValue = reserva.cliente.idCliente.toString();
            console.log("Cliente encontrado en reserva.cliente.idCliente:", idClienteValue);
          } else if (reserva.idCliente) {
            idClienteValue = reserva.idCliente.toString();
            console.log("Cliente encontrado en reserva.idCliente:", idClienteValue);
          } else if (reserva.clienteId) {
            idClienteValue = reserva.clienteId.toString();
            console.log("Cliente encontrado en reserva.clienteId:", idClienteValue);
          } else {
            console.error("No se pudo encontrar ID de cliente en ninguna estructura:");
            console.error("reserva.cliente:", reserva.cliente);
            console.error("reserva.idCliente:", reserva.idCliente);
            console.error("reserva.clienteId:", reserva.clienteId);
            throw new Error("Datos del cliente no disponibles en la reserva");
          }

          // Intentar diferentes formas de obtener el número de habitación
          if (reserva.habitacion && reserva.habitacion.numeroHabitacion) {
            numeroHabitacionValue = reserva.habitacion.numeroHabitacion.toString();
            console.log("Habitación encontrada en reserva.habitacion.numeroHabitacion:", numeroHabitacionValue);
          } else if (reserva.numeroHabitacion) {
            numeroHabitacionValue = reserva.numeroHabitacion.toString();
            console.log("Habitación encontrada en reserva.numeroHabitacion:", numeroHabitacionValue);
          } else if (reserva.habitacionId) {
            numeroHabitacionValue = reserva.habitacionId.toString();
            console.log("Habitación encontrada en reserva.habitacionId:", numeroHabitacionValue);
          } else {
            console.error("No se pudo encontrar número de habitación en ninguna estructura:");
            console.error("reserva.habitacion:", reserva.habitacion);
            console.error("reserva.numeroHabitacion:", reserva.numeroHabitacion);
            console.error("reserva.habitacionId:", reserva.habitacionId);
            throw new Error("Datos de la habitación no disponibles en la reserva");
          }

          // Convertir las fechas al formato adecuado para los inputs
          let fechaLlegada, fechaSalida;
          try {
            fechaLlegada = reserva.fechaLlegadaEstadia ? 
              new Date(reserva.fechaLlegadaEstadia).toISOString().slice(0, 16) : "";
            fechaSalida = reserva.fechaSalidaEstadia ? 
              new Date(reserva.fechaSalidaEstadia).toISOString().slice(0, 16) : "";
          } catch (dateError) {
            console.error("Error al procesar fechas:", dateError);
            fechaLlegada = "";
            fechaSalida = "";
          }
          
          setFormData({
            idCliente: idClienteValue,
            numeroHabitacion: numeroHabitacionValue,
            fechaLlegadaEstadia: fechaLlegada,
            fechaSalidaEstadia: fechaSalida,
            tipoPago: reserva.tipoPago || "EFECTIVO",
            fechaReserva: reserva.fechaReserva || new Date().toISOString().split('T')[0],
          });

          // Agregar la habitación actual a las disponibles si no está incluida
          const habitacionData = reserva.habitacion || { 
            numeroHabitacion: numeroHabitacionValue, 
            tipo: 'N/A', 
            precio: 0 
          };
          
          if (numeroHabitacionValue) {
            setHabitacionesDisponibles(prev => {
              const exists = prev.some(hab => hab.numeroHabitacion.toString() === numeroHabitacionValue);
              if (!exists) {
                return [...prev, {
                  numeroHabitacion: parseInt(numeroHabitacionValue),
                  tipo: habitacionData.tipo || 'N/A',
                  precio: habitacionData.precio || 0
                }];
              }
              return prev;
            });
          }

          console.log("Formulario cargado exitosamente con datos:", {
            idCliente: idClienteValue,
            numeroHabitacion: numeroHabitacionValue
          });

        } catch (error) {
          console.error("Error completo al cargar reserva:", error);
          setMensaje({ 
            text: "Error al cargar datos de la reserva: " + (error.response?.data?.message || error.message), 
            type: "error" 
          });
          
          // Redirigir de vuelta a la lista si hay un error crítico
          setTimeout(() => {
            navigate('/reservas');
          }, 3000);
        } finally {
          setLoadingData(false);
        }
      }
    };

    fetchReservaData();
  }, [isEditing, paramIdReserva, navigate]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.idCliente || !formData.numeroHabitacion || !formData.fechaLlegadaEstadia || 
        !formData.fechaSalidaEstadia || !formData.tipoPago || !formData.fechaReserva) {
      setMensaje({ text: "Por favor, complete todos los campos obligatorios.", type: "error" });
      return false;
    }

    if (new Date(formData.fechaSalidaEstadia) <= new Date(formData.fechaLlegadaEstadia)) {
      setMensaje({ text: "La fecha de salida debe ser posterior a la fecha de llegada.", type: "error" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ text: "", type: "" });

    if (!validarFormulario()) {
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

      if (isEditing) {
        await reservaService.update(paramIdReserva, payload);
        setMensaje({ text: "Reserva actualizada con éxito. Redirigiendo...", type: "success" });
      } else {
        await reservaService.create(payload);
        setMensaje({ text: "Reserva creada con éxito. Redirigiendo...", type: "success" });
      }

      setTimeout(() => {
        navigate('/reservas');
      }, 2000);

    } catch (error) {
      console.error("Error al procesar la reserva:", error);
      setMensaje({ 
        text: `Error al ${isEditing ? 'actualizar' : 'crear'} la reserva: ${error.response?.data?.message || error.message}`, 
        type: "error" 
      });
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/reservas');
  };

  if (loadingData) {
    return (
      <div className="reservas-form-container">
        <div className="loading-message">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="reservas-form-container">
      <h2>{isEditing ? 'Editar Reserva' : 'Crear Nueva Reserva'}</h2>
      {mensaje.text && <p className={`mensaje ${mensaje.type}`}>{mensaje.text}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="numeroHabitacion">Habitación {isEditing ? '' : 'Disponible'}:</label>
          <select 
            id="numeroHabitacion" 
            name="numeroHabitacion" 
            value={formData.numeroHabitacion} 
            onChange={manejarCambio} 
            required
          >
            <option value="">Seleccione una habitación</option>
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
            type="datetime-local"
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
            type="datetime-local"
            id="fechaSalidaEstadia"
            name="fechaSalidaEstadia"
            value={formData.fechaSalidaEstadia}
            onChange={manejarCambio}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="tipoPago">Método de Pago:</label>
          <select id="tipoPago" name="tipoPago" value={formData.tipoPago} onChange={manejarCambio} required>
            <option value="EFECTIVO">Efectivo</option>
            <option value="NEQUI">Nequi</option>
            <option value="BANCOLOMBIA">Bancolombia</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fechaReserva">Fecha de Creación Reserva:</label>
          <input
            type="date"
            id="fechaReserva"
            name="fechaReserva"
            value={formData.fechaReserva}
            onChange={manejarCambio}
            required
            disabled={isEditing}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-crear" disabled={loading}>
            {loading ? 'Procesando...' : (isEditing ? 'Actualizar Reserva' : 'Crear Reserva')}
          </button>
          <button type="button" className="btn-cancelar" onClick={handleCancel} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservasForm;
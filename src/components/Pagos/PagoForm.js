import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pagoService, clienteService } from '../../Services/api';
import './Pagos.css';

const PagoForm = () => {
  const navigate = useNavigate();
  const initialFormState = {
    idCliente: '',
    numeroHabitacion: '', // Este campo puede ser complicado de validar sin conocer la reserva asociada
    monto: '',
    metodoPago: 'EFECTIVO', // Valores: EFECTIVO, NEQUI, BANCOLOMBIA 
    fechaPago: new Date().toISOString().split('T')[0],
  };
  const [form, setForm] = useState(initialFormState);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientesRes = await clienteService.getAll();
        setClientes(Array.isArray(clientesRes) ? clientesRes : []);
        // No se cargan habitaciones aquí, ya que el PDF no lo relaciona directamente con un DTO de habitación completo
        // sino un 'numeroHabitacion'.
      } catch (err) {
        setError('Error al cargar datos necesarios para el formulario de pago.');
        console.error("Error fetching data for pago form", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.idCliente || !form.numeroHabitacion || form.monto <= 0 || !form.metodoPago || !form.fechaPago) {
      setError('Todos los campos son obligatorios y el monto debe ser positivo.');
      setLoading(false);
      return;
    }

    try {
      // Payload para POST /api/pagos 
      const payload = {
        idCliente: parseInt(form.idCliente, 10),
        numeroHabitacion: parseInt(form.numeroHabitacion, 10), // Asegurar que sea número
        monto: parseFloat(form.monto),
        metodoPago: form.metodoPago,
        fechaPago: form.fechaPago,
      };

      await pagoService.create(payload);
      setSuccess('Pago registrado correctamente.');
      setTimeout(() => navigate('/pagos'), 1500);
    } catch (err) {
      console.error('Error al registrar el pago:', err);
      setError(err.response?.data?.message || 'Error al registrar el pago.');
      setLoading(false);
    }
  };
  
  if (loading && clientes.length === 0) {
    return <div className="loading">Cargando datos del formulario...</div>;
  }

  return (
    <div className="pago-form-container">
      <h2>Registrar Nuevo Pago</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="pago-form">
        <div className="form-group">
          <label htmlFor="idCliente">Cliente:</label>
          <select name="idCliente" id="idCliente" value={form.idCliente} onChange={handleChange} required>
            <option value="">Seleccione un cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.idCliente} value={cliente.idCliente}>
                {cliente.nombres} {cliente.apellidos} (C.C: {cliente.cedula})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="numeroHabitacion">Número de Habitación:</label>
          <input
            type="number" // O text si el número puede tener caracteres no numéricos
            id="numeroHabitacion"
            name="numeroHabitacion"
            value={form.numeroHabitacion}
            onChange={handleChange}
            placeholder="Ej: 101"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="monto">Monto:</label>
          <input
            type="number"
            id="monto"
            name="monto"
            value={form.monto}
            onChange={handleChange}
            step="0.01"
            min="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="metodoPago">Método de Pago:</label>
          <select name="metodoPago" id="metodoPago" value={form.metodoPago} onChange={handleChange} required>
            <option value="EFECTIVO">Efectivo</option>
            <option value="NEQUI">Nequi</option>
            <option value="BANCOLOMBIA">Bancolombia</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="fechaPago">Fecha de Pago:</label>
          <input
            type="date"
            id="fechaPago"
            name="fechaPago"
            value={form.fechaPago}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Pago'}
          </button>
          <button type="button" className="btn-cancelar" onClick={() => navigate('/pagos')} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PagoForm;
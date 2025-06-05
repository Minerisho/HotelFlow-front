import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consumoService, clienteService, inventarioService } from '../../Services/api';
import './Consumos.css';

const ConsumoForm = () => {
  const navigate = useNavigate();
  const initialFormState = {
    idCliente: '',
    idProducto: '',
    cantidad: 1,
    fechaConsumo: new Date().toISOString().split('T')[0],
    cargadoAHabitacion: false,
  };
  const [form, setForm] = useState(initialFormState);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const clientesRes = await clienteService.getAll();
        setClientes(Array.isArray(clientesRes) ? clientesRes : []);

        const productosRes = await inventarioService.getAll();
        setProductos(Array.isArray(productosRes) ? productosRes : []);
      } catch (err) {
        setError('Error al cargar datos necesarios para el formulario.');
        console.error("Error fetching data for consumo form", err);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.idCliente || !form.idProducto || form.cantidad <= 0) {
      setError('Cliente, producto y cantidad (mayor a 0) son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      // Payload para POST /api/consumos 
      const payload = {
        idCliente: parseInt(form.idCliente, 10),
        idProducto: parseInt(form.idProducto, 10),
        cantidad: parseInt(form.cantidad, 10),
        fechaConsumo: form.fechaConsumo,
        cargadoAHabitacion: form.cargadoAHabitacion,
      };

      await consumoService.create(payload);
      setSuccess('Consumo registrado correctamente.');
      setTimeout(() => navigate('/consumos'), 1500);
    } catch (err) {
      console.error('Error al registrar consumo:', err);
      setError(err.response?.data?.message || 'Error al registrar el consumo. Verifique stock o datos.');
      setLoading(false);
    }
  };

  if (loading && clientes.length === 0 && productos.length === 0) {
    return <div className="loading">Cargando datos del formulario...</div>;
  }

  return (
    <div className="consumo-form-container">
      <h2>Registrar Nuevo Consumo</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="consumo-form">
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
          <label htmlFor="idProducto">Producto:</label>
          <select name="idProducto" id="idProducto" value={form.idProducto} onChange={handleChange} required>
            <option value="">Seleccione un producto</option>
            {productos.map(producto => (
              <option key={producto.idProducto} value={producto.idProducto}>
                {producto.nombre} (Stock: {producto.cantidad})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="cantidad">Cantidad:</label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="fechaConsumo">Fecha de Consumo:</label>
          <input
            type="date"
            id="fechaConsumo"
            name="fechaConsumo"
            value={form.fechaConsumo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cargadoAHabitacion" className="checkbox-label">
            <input
              type="checkbox"
              id="cargadoAHabitacion"
              name="cargadoAHabitacion"
              checked={form.cargadoAHabitacion}
              onChange={handleChange}
            />
            ¿Cargado a la habitación?
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar Consumo'}
          </button>
          <button type="button" className="btn-cancelar" onClick={() => navigate('/consumos')} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ConsumoForm;
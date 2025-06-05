import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { consumoService } from '../../Services/api';
import './Consumos.css';

const ConsumoList = () => {
  const [consumos, setConsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Filtros podrían añadirse aquí si es necesario, ej: por idCliente

  const fetchConsumos = async () => {
    setLoading(true);
    setError('');
    try {
      // El PDF (1.7.2) indica que GET /api/consumos puede tener filtros opcionales.
      // Por ahora, se cargan todos.
      const response = await consumoService.getAll({}); //
      setConsumos(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar consumos:', err);
      setError('Error al cargar los consumos.');
      setConsumos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsumos();
  }, []);

  const handleCargarAHabitacion = async (idConsumo) => {
    if (window.confirm('¿Estás seguro de marcar este consumo como cargado a la habitación?')) {
      try {
        const updatedConsumo = await consumoService.cargarAHabitacion(idConsumo); //
        setConsumos(prevConsumos =>
          prevConsumos.map(c => (c.idConsumo === idConsumo ? { ...c, ...updatedConsumo } : c))
        );
      } catch (err) {
        console.error('Error al cargar consumo a habitación:', err);
        setError(err.response?.data?.message || 'Error al actualizar el consumo.');
      }
    }
  };

  const handleEliminarConsumo = async (idConsumo) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este consumo? Esta acción puede reajustar el inventario.')) {
      try {
        await consumoService.delete(idConsumo); //
        setConsumos(prevConsumos => prevConsumos.filter(c => c.idConsumo !== idConsumo));
      } catch (err) {
        console.error('Error al eliminar el consumo:', err);
        setError(err.response?.data?.message || 'Error al eliminar el consumo.');
      }
    }
  };

  // Campos de Entidad Consumo según PDF (1.7.1): idConsumo, cliente (objeto), producto (objeto), cantidad, fechaConsumo, cargadoAHabitacion 
  return (
    <div className="consumos-container">
      <h2>Gestión de Consumos</h2>
      <div className="actions-bar">
        <Link to="/consumos/nuevo" className="btn-crear-producto">Registrar Consumo</Link>
      </div>

      {loading && <div className="loading">Cargando consumos...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && consumos.length === 0 && !error && (
        <div className="no-results">No hay consumos registrados.</div>
      )}

      {!loading && consumos.length > 0 && (
        <div className="consumo-grid">
          {consumos.map(consumo => (
            <div key={consumo.idConsumo} className="consumo-card">
              <h3>Consumo ID: {consumo.idConsumo}</h3>
              <div className="consumo-info">
                <p><strong>Cliente:</strong> {consumo.cliente?.nombres || 'N/A'} {consumo.cliente?.apellidos || ''} (ID: {consumo.cliente?.idCliente || 'N/A'})</p>
                <p><strong>Producto:</strong> {consumo.producto?.nombre || 'N/A'} (ID: {consumo.producto?.idProducto || 'N/A'})</p>
                <p><strong>Cantidad:</strong> {consumo.cantidad}</p>
                <p><strong>Fecha Consumo:</strong> {new Date(consumo.fechaConsumo).toLocaleDateString()}</p>
                <p><strong>Cargado a Habitación:</strong> {consumo.cargadoAHabitacion ? 'Sí' : 'No'}</p>
              </div>
              <div className="consumo-acciones">
                {!consumo.cargadoAHabitacion && (
                  <button
                    onClick={() => handleCargarAHabitacion(consumo.idConsumo)}
                    className="btn-cargar"
                  >
                    Cargar a Habitación
                  </button>
                )}
                <button
                  onClick={() => handleEliminarConsumo(consumo.idConsumo)}
                  className="btn-eliminar-consumo"
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

export default ConsumoList;
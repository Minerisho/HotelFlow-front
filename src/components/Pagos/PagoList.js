import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pagoService } from '../../Services/api';
import './Pagos.css';

const PagoList = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Filtros podrían añadirse aquí si es necesario

  const fetchPagos = async () => {
    setLoading(true);
    setError('');
    try {
      // GET /api/pagos puede tener filtros opcionales 
      const response = await pagoService.getAll({}); //
      setPagos(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar pagos:', err);
      setError('Error al cargar los pagos.');
      setPagos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const handleAnularPago = async (idPago) => {
    if (window.confirm('¿Estás seguro de que deseas anular este pago? Esta acción no se puede deshacer.')) {
      try {
        await pagoService.delete(idPago); // 
        setPagos(prevPagos => prevPagos.filter(p => p.idPago !== idPago));
      } catch (err) {
        console.error('Error al anular el pago:', err);
        setError(err.response?.data?.message || 'Error al anular el pago.');
      }
    }
  };
  
  // Entidad Pago: idPago, cliente (objeto), habitacion (objeto), monto, metodoPago, fechaPago 
  return (
    <div className="pagos-container">
      <h2>Gestión de Pagos</h2>
      <div className="actions-bar">
        <Link to="/pagos/nuevo" className="btn-crear-producto" style={{backgroundColor: '#007bff'}}>Registrar Pago</Link>
      </div>

      {loading && <div className="loading">Cargando pagos...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && pagos.length === 0 && !error && (
        <div className="no-results">No hay pagos registrados.</div>
      )}

      {!loading && pagos.length > 0 && (
        <div className="pago-grid">
          {pagos.map(pago => (
            <div key={pago.idPago} className="pago-card">
              <h3>Pago ID: {pago.idPago}</h3>
              <div className="pago-info">
                <p><strong>Cliente:</strong> {pago.cliente?.nombres || 'N/A'} {pago.cliente?.apellidos || ''} (ID: {pago.cliente?.idCliente || 'N/A'})</p>
                <p><strong>Habitación N°:</strong> {pago.habitacion?.numeroHabitacion || 'N/A'}</p>
                <p><strong>Monto:</strong> ${typeof pago.monto === 'number' ? pago.monto.toFixed(2) : 'N/A'}</p>
                <p><strong>Método de Pago:</strong> {pago.metodoPago || 'N/A'}</p>
                <p><strong>Fecha de Pago:</strong> {new Date(pago.fechaPago).toLocaleDateString()}</p>
              </div>
              <div className="pago-acciones">
                <button
                  onClick={() => handleAnularPago(pago.idPago)}
                  className="btn-anular-pago"
                >
                  Anular Pago
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PagoList;
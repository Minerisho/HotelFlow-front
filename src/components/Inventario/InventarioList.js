import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { inventarioService } from '../../Services/api';
import './Inventario.css';

const InventarioList = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroNombre, setFiltroNombre] = useState('');

  const fetchProductos = async () => {
    setLoading(true);
    setError('');
    try {
      // El PDF no especifica filtros para GET /api/inventario,
      // por lo que el filtrado por nombre se hará en el cliente por ahora.
      // Si el backend soportara ?nombre=... se usaría aquí.
      const response = await inventarioService.getAll(); //
      setProductos(Array.isArray(response) ? response : []);
    } catch (err) {
      console.error('Error al cargar productos del inventario:', err);
      setError('Error al cargar el inventario.');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleEliminarProducto = async (idProducto) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto del inventario?')) {
      try {
        await inventarioService.delete(idProducto); //
        setProductos(prevProductos => prevProductos.filter(p => p.idProducto !== idProducto));
      } catch (err) {
        console.error('Error al eliminar el producto:', err);
        setError(err.response?.data?.message || 'Error al eliminar el producto.');
      }
    }
  };

  const productosFiltrados = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
  );

  return (
    <div className="inventario-container">
      <h2>Gestión de Inventario</h2>
      <div className="actions-bar">
        <Link to="/inventario/nuevo" className="btn-crear-producto">Añadir Producto</Link>
      </div>

      <div className="filtros-container" style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Filtrar por nombre..."
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          style={{ padding: '10px', width: '100%', boxSizing: 'border-box' }}
        />
      </div>

      {loading && <div className="loading">Cargando inventario...</div>}
      {error && <div className="error-message">{error}</div>}
      {!loading && productosFiltrados.length === 0 && !error && (
        <div className="no-results">No hay productos en el inventario o que coincidan con el filtro.</div>
      )}

      {!loading && productosFiltrados.length > 0 && (
        <div className="inventario-grid">
          {productosFiltrados.map(producto => (
            // Campos de Entidad Inventario: idProducto, nombre, cantidad, precio 
            <div key={producto.idProducto} className="producto-card">
              <h3>{producto.nombre}</h3>
              <div className="producto-info">
                <p><strong>ID:</strong> {producto.idProducto}</p>
                <p><strong>Cantidad:</strong> {producto.cantidad}</p>
                <p><strong>Precio:</strong> ${typeof producto.precio === 'number' ? producto.precio.toFixed(2) : 'N/A'}</p>
              </div>
              <div className="producto-acciones">
                <Link to={`/inventario/editar/${producto.idProducto}`} className="btn-editar">
                  Editar
                </Link>
                <button
                  onClick={() => handleEliminarProducto(producto.idProducto)}
                  className="btn-eliminar"
                >
                  Eliminar
                </button>
                {/* Podría añadirse un botón para ajustar cantidad via PATCH */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InventarioList;
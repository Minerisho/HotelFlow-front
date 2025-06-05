import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventarioService } from '../../Services/api';
import './Inventario.css';

const InventarioForm = () => {
  const navigate = useNavigate();
  const { idProducto: paramIdProducto } = useParams();
  const isEditing = Boolean(paramIdProducto);

  const initialFormState = {
    nombre: '',
    cantidad: '',
    precio: '',
  };
  const [form, setForm] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditing && paramIdProducto) {
      setLoading(true);
      inventarioService.getById(paramIdProducto) //
        .then(data => {
          setForm({
            nombre: data.nombre,
            cantidad: data.cantidad.toString(),
            precio: data.precio.toString(),
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Error al cargar datos del producto:', err);
          setError('No se pudieron cargar los datos del producto para editar.');
          setLoading(false);
        });
    }
  }, [isEditing, paramIdProducto]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!form.nombre || form.cantidad === '' || form.precio === '') {
        setError('Todos los campos son obligatorios.');
        setLoading(false);
        return;
    }

    try {
      // Payload para POST /api/inventario: {"nombre": ..., "cantidad": ..., "precio": ...} 
      // Payload para PUT /api/inventario/{id}: {"cantidad": ..., "precio": ...} (nombre no se actualiza usualmente o con cuidado) 
      const payload = {
        nombre: form.nombre, // Incluido para creación, backend decide si se actualiza en PUT
        cantidad: parseInt(form.cantidad, 10),
        precio: parseFloat(form.precio),
      };

      if (isNaN(payload.cantidad) || isNaN(payload.precio) || payload.cantidad < 0 || payload.precio < 0) {
        setError('Cantidad y precio deben ser números positivos.');
        setLoading(false);
        return;
      }

      if (isEditing) {
        // Para PUT, el PDF muestra un payload que puede incluir nombre, cantidad, precio.
        // Adaptaremos el payload para PUT para que sea consistente con los campos editables.
        const updatePayload = {
            nombre: form.nombre, // El backend decidirá si permite actualizar el nombre o si causa conflicto.
            cantidad: payload.cantidad,
            precio: payload.precio
        };
        await inventarioService.update(paramIdProducto, updatePayload); //
        setSuccess('Producto actualizado correctamente.');
      } else {
        await inventarioService.create(payload); //
        setSuccess('Producto creado correctamente.');
      }

      setTimeout(() => {
        navigate('/inventario');
      }, 1500);

    } catch (err) {
      console.error('Error al guardar el producto:', err);
      let errorMessage = 'Error al guardar el producto.';
      if (err.response) {
        // PDF menciona 409 Conflict (nombre ya existe) para POST 
        if (err.response.status === 409) {
          errorMessage = 'Error: El nombre del producto ya existe.';
        } else if (err.response.data && (err.response.data.message || typeof err.response.data === 'string')) {
          errorMessage = err.response.data.message || err.response.data;
        }
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="inventario-form-container">
      <h2>{isEditing ? `Editar Producto ID: ${paramIdProducto}` : 'Nuevo Producto de Inventario'}</h2>

      {loading && <p className="loading">Cargando...</p>}
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="inventario-form">
        <div className="form-group">
          <label htmlFor="nombre">Nombre del Producto</label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
            readOnly={isEditing} // Opcional: permitir editar nombre o no
          />
        </div>

        <div className="form-group">
          <label htmlFor="cantidad">Cantidad</label>
          <input
            type="number"
            id="cantidad"
            name="cantidad"
            value={form.cantidad}
            onChange={handleChange}
            required
            min="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="precio">Precio</label>
          <input
            type="number"
            id="precio"
            name="precio"
            value={form.precio}
            onChange={handleChange}
            step="0.01"
            required
            min="0"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-guardar" disabled={loading}>
            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
          </button>
          <button type="button" className="btn-cancelar" onClick={() => navigate('/inventario')} disabled={loading}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default InventarioForm;
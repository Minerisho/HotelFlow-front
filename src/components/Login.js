import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../Services/api'; // Asegúrate que la ruta sea correcta
import './Login.css'; //

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    contrasena: '' // Cambiado de 'password' a 'contrasena' para coincidir con el PDF
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validar que los campos no estén vacíos aquí si se desea,
    // aunque el backend también debería validarlo.
    if (!credentials.username || !credentials.contrasena) {
      setError('El usuario y la contraseña son obligatorios.');
      setLoading(false);
      return;
    }

    try {
      // authService.login ahora maneja el almacenamiento del usuario en localStorage
      const userData = await authService.login(credentials);

      if (userData) { // Si userData no es null o undefined (login exitoso)
        setSuccess(true);
        // Esperar un corto tiempo para mostrar el mensaje de éxito antes de redirigir
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500); // Redirige después de 1.5 segundos
      } else {
        // Esto no debería ocurrir si authService.login lanza un error en caso de fallo,
        // pero es una salvaguarda.
        setError('Respuesta inesperada del servidor.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      if (err.response) {
        if (err.response.status === 401) { //
          setError('Credenciales inválidas. Por favor, verifica tu usuario y contraseña.');
        } else if (err.response.status === 400) { //
          setError('Solicitud incorrecta. Verifica los datos enviados.');
        } else {
          setError(`Error del servidor: ${err.response.status}. Inténtalo más tarde.`);
        }
      } else {
        setError('Error de red o el servidor no responde. Inténtalo más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2>HotelFlow - Acceso al Sistema</h2>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              name="username" // Coincide con el estado y el JSON para la API
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Ingrese su usuario"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena" // Cambiado para coincidir con el JSON para la API
              value={credentials.contrasena}
              onChange={handleChange}
              required
              placeholder="Ingrese su contraseña"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">¡Inicio de sesión exitoso! Redirigiendo...</div>}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
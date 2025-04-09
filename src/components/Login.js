import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    correoElectronico: '',
    contrasena: ''
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

    try {
      const loginResponse = await axios.post('http://localhost:8094/api/login/ingresar', credentials);
      
      if (loginResponse.status === 200) {
        localStorage.setItem('user', JSON.stringify(loginResponse.data));
        
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error) {
      console.error('Error during login:', error);
      if (error.response && error.response.status === 401) {
        setError('Credenciales inválidas. Por favor, verifica tu correo y contraseña.');
      } else {
        setError('Error al conectar con el servidor. Inténtalo más tarde.');
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
            <label htmlFor="correoElectronico">Correo Electrónico</label>
            <input
              type="email"
              id="correoElectronico"
              name="correoElectronico"
              value={credentials.correoElectronico}
              onChange={handleChange}
              required
              placeholder="Ingrese su correo electrónico"
            />
          </div>
          <div className="form-group">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              type="password"
              id="contrasena"
              name="contrasena"
              value={credentials.contrasena}
              onChange={handleChange}
              required
              placeholder="Ingrese su contraseña"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message fade-in">Credenciales correctas</div>}
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

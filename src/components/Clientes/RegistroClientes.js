import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './RegistroClientes.css';

const RegistroClientes = () => {
  const navigate = useNavigate();
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState([]);

  const [cliente, setCliente] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    nacionalidad: '',
    fechaNacimiento: '',
    genero: '',
    profesion: '',
    procedencia: '',
    destino: '',
    fechaLlegada: '',
    fechaSalida: '',
    correo: '',
    telefonoEmergencia: '',
    eps: '',
    numeroHabitacion: ''
  });

  const [tipoFecha, setTipoFecha] = useState({
    nacimiento: 'text',
    llegada: 'text',
    salida: 'text'
  });

  useEffect(() => {
    const obtenerHabitaciones = async () => {
      try {
        const response = await axios.get('http://localhost:8094/api/habitaciones?estado=LIBRE');;
        setHabitacionesDisponibles(response.data);
      } catch (error) {
        console.error('Error al obtener habitaciones disponibles:', error);
        alert('No se pudieron cargar las habitaciones disponibles.');
      }
    };

    obtenerHabitaciones();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setCliente({
      nombres: '',
      apellidos: '',
      cedula: '',
      nacionalidad: '',
      fechaNacimiento: '',
      genero: '',
      profesion: '',
      procedencia: '',
      destino: '',
      fechaLlegada: '',
      fechaSalida: '',
      correo: '',
      telefonoEmergencia: '',
      eps: '',
      numeroHabitacion: ''
    });

    setTipoFecha({
      nacimiento: 'text',
      llegada: 'text',
      salida: 'text'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8094/api/clientes', {
        ...cliente,
        habitacion: { numeroHabitacion: cliente.numeroHabitacion }
      });

      if (response.status === 201 || response.status === 200) {
        const deseaOtro = window.confirm('Cliente registrado correctamente. ¿Desea registrar otro cliente?');
        if (deseaOtro) {
          limpiarFormulario();
        } else {
          navigate('/dashboard');
        }
      } else {
        alert('Error al registrar cliente.');
      }
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      alert('Error al registrar cliente. Ver consola para más información.');
    }
  };

  return (
    <div className="registro-clientes-container">
      <h2>Registro de Cliente</h2>
      <form onSubmit={handleSubmit} className="registro-form">
        <input type="text" name="nombres" placeholder="Nombres" value={cliente.nombres} onChange={handleChange} required />
        <input type="text" name="apellidos" placeholder="Apellidos" value={cliente.apellidos} onChange={handleChange} required />
        <input type="text" name="cedula" placeholder="Cédula" value={cliente.cedula} onChange={handleChange} required />
        <input type="text" name="nacionalidad" placeholder="Nacionalidad" value={cliente.nacionalidad} onChange={handleChange} />

        <input
          type={tipoFecha.nacimiento}
          name="fechaNacimiento"
          placeholder="Fecha de Nacimiento"
          value={cliente.fechaNacimiento}
          onChange={handleChange}
          onFocus={() => setTipoFecha(prev => ({ ...prev, nacimiento: 'date' }))}
          onBlur={(e) => {
            if (!e.target.value) {
              setTipoFecha(prev => ({ ...prev, nacimiento: 'text' }));
            }
          }}
        />

        <select name="genero" value={cliente.genero} onChange={handleChange} required>
          <option value="">Selecciona género</option>
          <option value="MASCULINO">Masculino</option>
          <option value="FEMENINO">Femenino</option>
          <option value="OTRO">Otro</option>
        </select>

        <input type="text" name="profesion" placeholder="Profesión" value={cliente.profesion} onChange={handleChange} />
        <input type="text" name="procedencia" placeholder="Procedencia" value={cliente.procedencia} onChange={handleChange} />
        <input type="text" name="destino" placeholder="Destino" value={cliente.destino} onChange={handleChange} />

        <input
          type={tipoFecha.llegada}
          name="fechaLlegada"
          placeholder="Fecha de Llegada"
          value={cliente.fechaLlegada}
          onChange={handleChange}
          onFocus={() => setTipoFecha(prev => ({ ...prev, llegada: 'date' }))}
          onBlur={(e) => {
            if (!e.target.value) {
              setTipoFecha(prev => ({ ...prev, llegada: 'text' }));
            }
          }}
        />

        <input
          type={tipoFecha.salida}
          name="fechaSalida"
          placeholder="Fecha de Salida"
          value={cliente.fechaSalida}
          onChange={handleChange}
          onFocus={() => setTipoFecha(prev => ({ ...prev, salida: 'date' }))}
          onBlur={(e) => {
            if (!e.target.value) {
              setTipoFecha(prev => ({ ...prev, salida: 'text' }));
            }
          }}
        />

        <input type="email" name="correo" placeholder="Correo" value={cliente.correo} onChange={handleChange} />
        <input type="text" name="telefonoEmergencia" placeholder="Tel. Emergencia" value={cliente.telefonoEmergencia} onChange={handleChange} />
        <input type="text" name="eps" placeholder="EPS" value={cliente.eps} onChange={handleChange} />

        <select name="numeroHabitacion" value={cliente.numeroHabitacion} onChange={handleChange} required>
          <option value="">Seleccione una habitación</option>
          {Array.isArray(habitacionesDisponibles) &&
            habitacionesDisponibles.map((hab) => (
              <option key={hab.numeroHabitacion} value={hab.numeroHabitacion}>
                Habitación {hab.numeroHabitacion} - {hab.tipo} ({hab.estado})
              </option>
            ))
          }
        </select>

        <button type="submit" className="registro-boton">Registrar Cliente</button>
      </form>
    </div>
  );
};

export default RegistroClientes;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../../Services/api'; // Ajusta la ruta
import './RegistroClientes.css';

const RegistroClientes = () => {
  const navigate = useNavigate();
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  // Payload para POST /api/clientes según PDF (1.4.1), sin fechas ni habitación.
  const initialFormState = {
    nombres: '',
    apellidos: '',
    cedula: '',
    nacionalidad: '',
    fechaNacimiento: '', // API espera "YYYY-MM-DD"
    genero: '', // API: MASCULINO, FEMENINO, OTRO
    profesion: '',
    procedencia: '',
    destino: '',
    correo: '',
    telefonoEmergencia: '',
    eps: '',
  };
  const [cliente, setCliente] = useState(initialFormState);
  const [tipoFechaNacimiento, setTipoFechaNacimiento] = useState('text');


  // Ya no es necesario cargar habitaciones aquí si no se van a asociar directamente.
  // useEffect(() => {
  //   const obtenerHabitaciones = async () => { ... };
  //   obtenerHabitaciones();
  // }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const limpiarFormulario = () => {
    setCliente(initialFormState);
    setTipoFechaNacimiento('text');
    setMensaje({ text: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje({ text: "", type: "" });

    // Validaciones básicas
    if (!cliente.nombres || !cliente.apellidos || !cliente.cedula || !cliente.genero) {
        setMensaje({text: 'Nombres, apellidos, cédula y género son obligatorios.', type: 'error'});
        setLoading(false);
        return;
    }

    // Payload para el backend. Los campos opcionales se envían como null si están vacíos.
    const clientePayload = {
      nombres: cliente.nombres,
      apellidos: cliente.apellidos,
      cedula: cliente.cedula,
      nacionalidad: cliente.nacionalidad || null,
      fechaNacimiento: cliente.fechaNacimiento || null,
      genero: cliente.genero,
      profesion: cliente.profesion || null,
      procedencia: cliente.procedencia || null,
      destino: cliente.destino || null,
      correo: cliente.correo || null,
      telefonoEmergencia: cliente.telefonoEmergencia || null,
      eps: cliente.eps || null,
    };

    try {
      await clienteService.create(clientePayload); //
      setMensaje({ text: 'Cliente registrado correctamente.', type: 'success' });
      const deseaOtro = window.confirm('Cliente registrado correctamente. ¿Desea registrar otro cliente?');
      if (deseaOtro) {
        limpiarFormulario();
      } else {
        navigate('/clientes'); // O /dashboard o donde prefieras
      }
    } catch (error) {
      console.error('Error al registrar cliente:', error);
      let apiError = 'Error al registrar el cliente. Inténtelo de nuevo.';
      if (error.response) {
          // PDF (1.4.1) menciona 409 Conflict (cédula ya existe)
        if (error.response.status === 409) {
          apiError = 'La cédula ingresada ya se encuentra registrada.';
        } else if (error.response.data?.message) {
          apiError = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          apiError = error.response.data;
        }
      }
      setMensaje({ text: apiError, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registro-clientes-container">
      <h2>Registro de Cliente</h2>
      {mensaje.text && <p className={`mensaje ${mensaje.type}`}>{mensaje.text}</p>}
      <form onSubmit={handleSubmit} className="registro-form">
        <input type="text" name="nombres" placeholder="Nombres" value={cliente.nombres} onChange={handleChange} required />
        <input type="text" name="apellidos" placeholder="Apellidos" value={cliente.apellidos} onChange={handleChange} required />
        <input type="text" name="cedula" placeholder="Cédula" value={cliente.cedula} onChange={handleChange} required />
        <input type="text" name="nacionalidad" placeholder="Nacionalidad" value={cliente.nacionalidad} onChange={handleChange} />

        <input
          type={tipoFechaNacimiento}
          name="fechaNacimiento"
          placeholder="Fecha de Nacimiento (YYYY-MM-DD)"
          value={cliente.fechaNacimiento}
          onChange={handleChange}
          onFocus={() => setTipoFechaNacimiento('date')}
          onBlur={(e) => !e.target.value && setTipoFechaNacimiento('text')}
        />

        {/* Valores genero: MASCULINO, FEMENINO, OTRO (PDF 1.4.1) */}
        <select name="genero" value={cliente.genero} onChange={handleChange} required>
          <option value="">Selecciona género</option>
          <option value="MASCULINO">Masculino</option>
          <option value="FEMENINO">Femenino</option>
          <option value="OTRO">Otro</option>
        </select>

        <input type="text" name="profesion" placeholder="Profesión" value={cliente.profesion} onChange={handleChange} />
        <input type="text" name="procedencia" placeholder="Procedencia" value={cliente.procedencia} onChange={handleChange} />
        <input type="text" name="destino" placeholder="Destino" value={cliente.destino} onChange={handleChange} />
        <input type="email" name="correo" placeholder="Correo Electrónico" value={cliente.correo} onChange={handleChange} />
        <input type="text" name="telefonoEmergencia" placeholder="Tel. Emergencia" value={cliente.telefonoEmergencia} onChange={handleChange} />
        <input type="text" name="eps" placeholder="EPS" value={cliente.eps} onChange={handleChange} />

        {/* Campos de fechaLlegada, fechaSalida y numeroHabitacion eliminados del formulario */}

        <button type="submit" className="registro-boton" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Cliente'}
        </button>
      </form>
    </div>
  );
};

export default RegistroClientes;
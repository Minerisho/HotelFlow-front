import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HistorialClientes.css';

const HistorialClientes = () => {
  const [reservas, setReservas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCedula, setFiltroCedula] = useState('');
  const [filtroFechaEntrada, setFiltroFechaEntrada] = useState('');
  const [filtroFechaSalida, setFiltroFechaSalida] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reservasRes, clientesRes] = await Promise.all([
          axios.get('http://localhost:8094/api/reservas'),
          axios.get('http://localhost:8094/api/clientes'),
        ]);
        setReservas(reservasRes.data);
        setClientes(clientesRes.data);
      } catch (error) {
        setError('No se pudo cargar el historial de clientes.');
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const obtenerClientePorId = (id) => {
    return clientes.find((cliente) => cliente.idCliente === id);
  };

  // Función para comparar solo la fecha (sin hora)
  const mismaFecha = (fecha1, fecha2) => {
    if (!fecha1 || !fecha2) return false;
    const d1 = new Date(fecha1);
    const d2 = new Date(fecha2);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Función para saber si fecha está entre dos fechas (inclusive)
  const fechaEntre = (fecha, inicio, fin) => {
    const f = new Date(fecha);
    const i = new Date(inicio);
    const fn = new Date(fin);
    f.setHours(0, 0, 0, 0);
    i.setHours(0, 0, 0, 0);
    fn.setHours(0, 0, 0, 0);
    return f >= i && f <= fn;
  };

  const reservasFiltradas = reservas.filter((reserva) => {
    const nombreCompleto = reserva.nombreCliente.toLowerCase();
    const filtroNombreLower = filtroNombre.toLowerCase();

    const cliente = obtenerClientePorId(reserva.idCliente);
    const cedula = cliente?.cedula?.toString() || '';

    const cumpleFiltroNombre = nombreCompleto.includes(filtroNombreLower);
    const cumpleFiltroCedula = cedula.includes(filtroCedula);

    let cumpleFiltroFechaEntrada = true;
    let cumpleFiltroFechaSalida = true;

    if (filtroFechaEntrada && filtroFechaSalida) {
      cumpleFiltroFechaEntrada = fechaEntre(
        reserva.fechaLlegadaEstadia,
        filtroFechaEntrada,
        filtroFechaSalida
      );
    } else if (filtroFechaEntrada) {
      cumpleFiltroFechaEntrada = mismaFecha(reserva.fechaLlegadaEstadia, filtroFechaEntrada);
    }

    if (filtroFechaSalida) {
      if (!(filtroFechaEntrada && filtroFechaSalida)) {
        cumpleFiltroFechaSalida = mismaFecha(reserva.fechaSalidaEstadia, filtroFechaSalida);
      }
    }

    return cumpleFiltroNombre && cumpleFiltroCedula && cumpleFiltroFechaEntrada && cumpleFiltroFechaSalida;
  });

  const limpiarFiltros = () => {
    setFiltroNombre('');
    setFiltroCedula('');
    setFiltroFechaEntrada('');
    setFiltroFechaSalida('');
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="historial-container">
      <h2 className="titulo">Historial de Clientes</h2>

      <form className="formulario-filtros" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Buscar por nombre o apellido"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
        />
        <input
          type="text"
          placeholder="Buscar por cédula"
          value={filtroCedula}
          onChange={(e) => setFiltroCedula(e.target.value)}
        />
        <input
          type="date"
          placeholder="Fecha de entrada"
          value={filtroFechaEntrada}
          onChange={(e) => setFiltroFechaEntrada(e.target.value)}
        />
        <input
          type="date"
          placeholder="Fecha de salida"
          value={filtroFechaSalida}
          onChange={(e) => setFiltroFechaSalida(e.target.value)}
        />
        <button type="button" onClick={limpiarFiltros} className="btn-limpiar">
          Limpiar filtros
        </button>
      </form>

      <div className="tabla-container">
        <table className="tabla-historial">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Cédula</th>
              <th>Habitación</th>
              <th>Fecha de entrada</th>
              <th>Fecha de salida</th>
            </tr>
          </thead>
          <tbody>
            {reservasFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>
                  No se encontraron reservas.
                </td>
              </tr>
            ) : (
              reservasFiltradas.map((reserva) => {
                const cliente = obtenerClientePorId(reserva.idCliente);
                return (
                  <tr key={reserva.idReserva}>
                    <td>{reserva.nombreCliente.split(' ')[0]}</td>
                    <td>{reserva.nombreCliente.split(' ').slice(1).join(' ')}</td>
                    <td>{cliente?.cedula || 'Desconocido'}</td>
                    <td>{reserva.numeroHabitacion}</td>
                    <td>{reserva.fechaLlegadaEstadia}</td>
                    <td>{reserva.fechaSalidaEstadia}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistorialClientes;

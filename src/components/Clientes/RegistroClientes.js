import React, { useState } from "react";
import "./RegistroClientes.css";
import axios from "axios";

const RegistroClientes = () => {
  const [cliente, setCliente] = useState({
    nombre: "",
    apellido: "",
    correoElectronico: "",
    contrasena: "",
    rol: ""
  });
  const [mensaje, setMensaje] = useState("");

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const registrarCliente = async () => {
    try {
      const payload = {
        correoElectronico: cliente.correoElectronico,
        contrasena: "123",
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        rol: "HUESPED"
      };

      await axios.post("http://localhost:8094/api/usuarios/", payload);

      setMensaje("Cliente registrado con éxito");

      setCliente({
        nombre: "",
        apellido: "",
        correoElectronico: "",
        contrasena: "123",
        rol: "HUESPED"
      });
    } catch (error) {
      setMensaje("Error al registrar el cliente: " + error.message);
    }
  };

  return (
    <div className="registro-clientes">
      <h2>Registrar Cliente</h2>
      <div className="form-group">
        <label>Nombre:</label>
        <input
          type="text"
          name="nombre"
          value={cliente.nombre}
          onChange={manejarCambio}
          placeholder="Nombre"
        />
      </div>
      <div className="form-group">
        <label>Apellido:</label>
        <input
          type="text"
          name="apellido"
          value={cliente.apellido}
          onChange={manejarCambio}
          placeholder="Apellido"
        />
      </div>
      <div className="form-group">
        <label>Correo Electrónico:</label>
        <input
          type="email"
          name="correoElectronico"
          value={cliente.correoElectronico}
          onChange={manejarCambio}
          placeholder="Correo Electrónico"
        />
      </div>
      <button className="btn-registrar" onClick={registrarCliente}>
        Registrar
      </button>
      {mensaje && <p className="mensaje">{mensaje}</p>}
    </div>
  );
};

export default RegistroClientes;

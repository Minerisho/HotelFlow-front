import axios from 'axios';

// Base API configuration
const API = axios.create({
  baseURL: 'http://localhost:8094/api', // Confirmado de la URL en los endpoints del PDF
});

// Interceptor para añadir configuraciones comunes a las peticiones (si fueran necesarias en el futuro)
// Por ahora, con el login basado en sesión/cookies, no es necesario añadir tokens JWT aquí.
API.interceptors.request.use(config => {
  // Ejemplo: si se necesitara enviar el ID de usuario o algo similar en cada petición
  // const user = authService.getCurrentUser();
  // if (user && user.id) {
  //   config.headers['X-User-ID'] = user.id; // Ejemplo, no especificado en PDF
  // }
  // Habilitar withCredentials permite que el navegador envíe cookies de sesión automáticamente
  config.withCredentials = true;
  return config;
});

// --- Authentication Service ---
export const authService = {
  login: async (credentials) => {
    // El PDF (1.1.2) indica que el endpoint es /api/login/ingresar
    // y el cuerpo es { username, contrasena }
    // La respuesta es el objeto Usuario si es exitoso (200 OK) o un error 401.
    const response = await API.post('/login/ingresar', credentials); // 
    if (response.data) {
      // Asumimos que response.data es el objeto del usuario
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data; // Devuelve el objeto del usuario o el error será manejado por el catch
  },

  logout: () => {
    localStorage.removeItem('user');
    // Aquí podrías añadir una llamada a un endpoint de logout en el backend si existiera,
    // por ejemplo: API.post('/logout');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error al parsear el usuario desde localStorage", error);
      localStorage.removeItem('user'); // Limpiar el localStorage si está corrupto
      return null;
    }
  },

  isAuthenticated: () => {
    return localStorage.getItem('user') !== null;
  }
};

// --- Usuario Service ---
export const usuarioService = {
  getAll: async () => {
    const response = await API.get('/usuarios'); // 
    return response.data;
  },

  getById: async (id) => { // El PDF (1.2.3) usa {id} como path param 
    const response = await API.get(`/usuarios/${id}`);
    return response.data;
  },

  create: async (usuario) => {
    // Payload según PDF (1.2.1): { username, password, nombre, apellido, cedula, rol } 
    const response = await API.post('/usuarios', usuario);
    return response.data; // Espera el usuario creado (sin password) 
  },

  update: async (id, usuarioUpdateData) => { // El PDF (1.2.4) usa {id} 
    // Payload ejemplo: { nombre, apellido, cedula, rol } 
    const response = await API.put(`/usuarios/${id}`, usuarioUpdateData);
    return response.data; // Espera el usuario actualizado 
  },

  delete: async (id) => { // El PDF (1.2.5) usa {id} 
    await API.delete(`/usuarios/${id}`); // Retorna 204 No Content 
  }
};

// --- Habitaciones Service ---
export const habitacionService = {
  getAll: async (params) => { // params: { tipo, estado, disponible, precioMin, precioMax } 
    const response = await API.get('/habitaciones', { params });
    return response.data;
  },

  getDisponiblesEnFechas: async (params) => { // params: { fechaLlegada, fechaSalida, tipo } 
    const response = await API.get('/habitaciones/disponibles-en-fechas', { params });
    return response.data;
  },

  getByNumero: async (numeroHabitacion) => { // 
    const response = await API.get(`/habitaciones/${numeroHabitacion}`);
    return response.data;
  },

  create: async (habitacionData) => {
    // Payload según PDF (1.3.1): { numeroHabitacion, tipo, climatizacion, estado, disponible, precio } 
    const response = await API.post('/habitaciones', habitacionData);
    return response.data; // Espera HabitacionDTO 
  },

  update: async (numeroHabitacion, habitacionData) => { // 
    // Payload ejemplo: { precio, estado } 
    const response = await API.put(`/habitaciones/${numeroHabitacion}`, habitacionData);
    return response.data;
  },

  updateEstado: async (numeroHabitacion, estadoData) => { // 
    // Payload: { estado } 
    const response = await API.patch(`/habitaciones/${numeroHabitacion}/estado`, estadoData);
    return response.data;
  },

  updatePrecio: async (numeroHabitacion, precioData) => { // 
    // Payload: { precio } 
    const response = await API.patch(`/habitaciones/${numeroHabitacion}/precio`, precioData);
    return response.data;
  },

  delete: async (numeroHabitacion) => { // 
    await API.delete(`/habitaciones/${numeroHabitacion}`); // Retorna 204 No Content 
  }
};

// --- Clientes Service ---
export const clienteService = {
  getAll: async (params) => { // params: { apellidos } 
    const response = await API.get('/clientes', { params });
    return response.data;
  },

  getById: async (idCliente) => { // 
    const response = await API.get(`/clientes/${idCliente}`);
    return response.data;
  },

  getByCedula: async (cedula) => { // 
    const response = await API.get(`/clientes/cedula/${cedula}`);
    return response.data;
  },

  create: async (clienteData) => {
    // Payload según PDF (1.4.1) 
    const response = await API.post('/clientes', clienteData);
    return response.data; // Espera Entidad Cliente 
  },

  update: async (idCliente, clienteData) => { // 
    // Payload ejemplo 
    const response = await API.put(`/clientes/${idCliente}`, clienteData);
    return response.data;
  },

  delete: async (idCliente) => { // 
    await API.delete(`/clientes/${idCliente}`); // Retorna 204 No Content 
  }
};

// --- Reservas Service ---
export const reservaService = {
  getAll: async (params) => { // params: { idCliente, numeroHabitacion, fechaInicioCreacion, fechaFinCreacion, estado } 
    const response = await API.get('/reservas', { params });
    return response.data;
  },

  getById: async (idReserva) => { // 
    const response = await API.get(`/reservas/${idReserva}`);
    return response.data;
  },

  getActivasEnFechasPorHabitacion: async (numeroHabitacion, params) => { // params: { fechaLlegada, fechaSalida } 
    const response = await API.get(`/reservas/habitacion/${numeroHabitacion}/activas-en-fechas`, { params });
    return response.data;
  },

  create: async (reservaData) => {
    // Payload según PDF (1.5.1) 
    const response = await API.post('/reservas', reservaData);
    return response.data; // Espera ReservaDTO 
  },

  update: async (idReserva, reservaData) => { // 
    // Payload ejemplo 
    const response = await API.put(`/reservas/${idReserva}`, reservaData);
    return response.data;
  },

  updateEstado: async (idReserva, estadoData) => { // 
    // Payload: { estado, tipoPago } 
    // Estados válidos: PAGADA, NO PAGADA, CANCELADA, ACTIVA 
    const response = await API.patch(`/reservas/${idReserva}/estado`, estadoData);
    return response.data;
  },

  delete: async (idReserva) => { // Significa cancelar reserva 
    await API.delete(`/reservas/${idReserva}`); // Retorna 204 No Content 
  }
};

// --- Pagos Service ---
export const pagoService = {
  getAll: async (params) => { // params: {idCliente, numeroHabitacion, fecha} 
    const response = await API.get('/pagos', { params });
    return response.data;
  },
  getById: async (idPago) => { // 
    const response = await API.get(`/pagos/${idPago}`);
    return response.data;
  },
  create: async (pagoData) => {
    // Payload según PDF (1.8.1) 
    const response = await API.post('/pagos', pagoData);
    return response.data; // Espera Entidad Pago 
  },
  delete: async (idPago) => { // 
    await API.delete(`/pagos/${idPago}`); // Retorna 204 No Content 
  }
};

// --- Inventario Service ---
export const inventarioService = {
  getAll: async () => { // 
    const response = await API.get('/inventario');
    return response.data;
  },
  getById: async (idProducto) => { // 
    const response = await API.get(`/inventario/${idProducto}`);
    return response.data;
  },
  getByNombre: async (nombre) => { // 
    const response = await API.get(`/inventario/nombre/${nombre}`);
    return response.data;
  },
  create: async (productoData) => { // 
    const response = await API.post('/inventario', productoData);
    return response.data; // Espera Entidad Inventario 
  },
  update: async (idProducto, productoData) => { // 
    const response = await API.put(`/inventario/${idProducto}`, productoData);
    return response.data;
  },
  ajustarCantidad: async (idProducto, ajusteData) => { // 
    // Payload: { ajuste } 
    const response = await API.patch(`/inventario/${idProducto}/ajustar-cantidad`, ajusteData);
    return response.data;
  },
  delete: async (idProducto) => { // 
    await API.delete(`/inventario/${idProducto}`); // Retorna 204 No Content 
  }
};

// --- Consumos Service ---
export const consumoService = {
  getAll: async (params) => { // params: { idCliente, idProducto, fecha } 
    const response = await API.get('/consumos', { params });
    return response.data;
  },
  getById: async (idConsumo) => { // 
    const response = await API.get(`/consumos/${idConsumo}`);
    return response.data;
  },
  getPenndientesByCliente: async (idCliente) => { // 
    const response = await API.get(`/consumos/cliente/${idCliente}/pendientes`);
    return response.data;
  },
  create: async (consumoData) => { // 
    const response = await API.post('/consumos', consumoData);
    return response.data; // Espera Entidad Consumo 
  },
  cargarAHabitacion: async (idConsumo) => { // 
    // El PDF indica que no espera cuerpo de solicitud para este PATCH 
    const response = await API.patch(`/consumos/${idConsumo}/cargar`);
    return response.data;
  },
  delete: async (idConsumo) => { // 
    await API.delete(`/consumos/${idConsumo}`); // Retorna 204 No Content 
  }
};


export default API;
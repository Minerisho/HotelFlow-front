import axios from 'axios';


const API = axios.create({
    baseURL: 'http://localhost:8094/api',
  });
  


API.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
   
  }
  return config;
});


export const authService = {
  login: async (credentials) => {
    try {
      const response = await API.post('/login/ingresar', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('user');
  },
  
  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem('user'));
  },
  
  isAuthenticated: () => {
    return localStorage.getItem('user') !== null;
  }
};


export const usuarioService = {
  getAll: async () => {
    try {
      const response = await API.get('/usuarios/list');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getById: async (id) => {
    try {
      const response = await API.get(`/usuarios/list/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  create: async (usuario) => {
    try {
      const response = await API.post('/usuarios/', usuario);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  update: async (usuario) => {
    try {
      const response = await API.put('/usuarios/', usuario);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  delete: async (id) => {
    try {
      const response = await API.delete(`/usuarios/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default API;
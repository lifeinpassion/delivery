import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Orders API
export const ordersAPI = {
  create: (data: any) => api.post('/orders', data),
  getAll: (params?: any) => api.get('/orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, data: any) => api.patch(`/orders/${id}/status`, data),
  assignDriver: (id: string, driverId: string) => api.patch(`/orders/${id}/assign`, { driverId }),
  cancel: (id: string) => api.delete(`/orders/${id}`),
};

// Drivers API
export const driversAPI = {
  create: (data: any) => api.post('/drivers', data),
  getAll: (params?: any) => api.get('/drivers', { params }),
  getById: (id: string) => api.get(`/drivers/${id}`),
  updateLocation: (data: any) => api.patch('/drivers/location', data),
  updateStatus: (status: string) => api.patch('/drivers/status', { status }),
  getOrders: (id: string, params?: any) => api.get(`/drivers/${id}/orders`, { params }),
  getAvailableOrders: () => api.get('/drivers/available-orders'),
  acceptOrder: (orderId: string) => api.post('/drivers/accept-order', { orderId }),
  getStats: (id: string) => api.get(`/drivers/${id}/stats`),
};

// Addresses API
export const addressesAPI = {
  create: (data: any) => api.post('/addresses', data),
  getAll: () => api.get('/addresses'),
  update: (id: string, data: any) => api.patch(`/addresses/${id}`, data),
  delete: (id: string) => api.delete(`/addresses/${id}`),
};

export default api;

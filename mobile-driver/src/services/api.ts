import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this with your actual API URL
const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

// Driver API
export const driverAPI = {
  updateLocation: (latitude: number, longitude: number) =>
    api.patch('/drivers/location', { latitude, longitude }),
  updateStatus: (status: string) =>
    api.patch('/drivers/status', { status }),
  getAvailableOrders: () => api.get('/drivers/available-orders'),
  acceptOrder: (orderId: string) =>
    api.post('/drivers/accept-order', { orderId }),
  getMyOrders: (params?: any) => api.get('/drivers/orders', { params }),
};

// Orders API
export const ordersAPI = {
  getById: (id: string) => api.get(`/orders/${id}`),
  updateStatus: (id: string, status: string, latitude?: number, longitude?: number) =>
    api.patch(`/orders/${id}/status`, { status, latitude, longitude }),
};

export default api;

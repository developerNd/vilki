import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, DeliveryPartner, Order, Earnings } from '../types';

// Configure base URL for your Strapi backend
const API_BASE_URL = 'https://your-strapi-backend.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
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
      // Handle unauthorized access
      AsyncStorage.removeItem('authToken');
      AsyncStorage.removeItem('deliveryPartner');
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  login: async (partnerId: string): Promise<ApiResponse<{ token: string; partner: DeliveryPartner }>> => {
    const response = await api.post('/auth/local', {
      identifier: partnerId,
      password: partnerId, // In real app, use proper password
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('deliveryPartner');
  },

  getProfile: async (): Promise<ApiResponse<DeliveryPartner>> => {
    const response = await api.get('/delivery-partners/me');
    return response.data;
  },

  updateLocation: async (latitude: number, longitude: number): Promise<ApiResponse<DeliveryPartner>> => {
    const response = await api.put('/delivery-partners/me', {
      currentLocation: { latitude, longitude },
    });
    return response.data;
  },
};

// Orders API
export const ordersAPI = {
  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/orders', {
      params: {
        status: 'accepted',
        populate: '*',
      },
    });
    return response.data;
  },

  getMyOrders: async (): Promise<ApiResponse<Order[]>> => {
    const response = await api.get('/orders', {
      params: {
        assignedTo: 'me',
        populate: '*',
      },
    });
    return response.data;
  },

  acceptOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await api.put(`/orders/${orderId}`, {
      status: 'assigned',
      assignedTo: 'me',
    });
    return response.data;
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<ApiResponse<Order>> => {
    const updateData: any = { status };
    
    if (status === 'picked_up') {
      updateData.pickedUpAt = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date().toISOString();
    }

    const response = await api.put(`/orders/${orderId}`, updateData);
    return response.data;
  },

  getOrderDetails: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await api.get(`/orders/${orderId}`, {
      params: {
        populate: '*',
      },
    });
    return response.data;
  },
};

// Earnings API
export const earningsAPI = {
  getEarnings: async (month?: string, year?: number): Promise<ApiResponse<Earnings[]>> => {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await api.get('/earnings', { params });
    return response.data;
  },

  getCurrentMonthEarnings: async (): Promise<ApiResponse<Earnings>> => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const response = await api.get('/earnings', {
      params: { month, year },
    });
    return response.data;
  },
};

// Utility functions
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export default api; 
// api.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, DeliveryPartner, Order, Earnings } from '../types';

export const IP = "https://api.vilkimedicart.in";
export const baseURL = `${IP}/api`;

// Axios instance (still useful)
const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to attach token automatically
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('API Request with token:', config.method?.toUpperCase(), config.url);
  } else {
    console.log('API Request without token:', config.method?.toUpperCase(), config.url);
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Token might be invalid or expired');
      // Optionally clear token and redirect to login
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('deliveryPartner');
    }
    return Promise.reject(error);
  }
);

// Utility to get header manually
export const getHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

// ✅ Auth API
export const authAPI = {
  login: async (partnerid: string, password: string) => {
    try {
      const res = await axios.post(`${baseURL}/delivery-partner/login`, {
        partnerid,
        password,
      });

      const { jwt, user } = res.data;
      await AsyncStorage.setItem('token', jwt);
      await AsyncStorage.setItem('deliveryPartner', JSON.stringify(user));

      return { success: true, user };
    } catch (err: any) {
      console.error('Login error:', err?.response?.data || err);
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('deliveryPartner');
  },

  getStoredPartner: async (): Promise<DeliveryPartner | null> => {
    const partner = await AsyncStorage.getItem('deliveryPartner');
    return partner ? JSON.parse(partner) : null;
  },

  updateLocation: async (
    partnerId: string,
    latitude: number,
    longitude: number
  ): Promise<boolean> => {
    try {
      const body = {
        currentLocation: {
          latitude,
          longitude,
        },
      };
      await api.put(`/delivery-partners/${partnerId}`, body);
      return true;
    } catch (err: any) {
      console.error('Location update error:', err?.response?.data || err);
      return false;
    }
  },
};

// 📦 Orders API (can extend as needed)
export const ordersAPI = {
  getOrders: async () => {
    const res = await api.get('/delivery-partner/open-orders');
    return res.data;
  },

  getMyOrders: async () => {
    const res = await api.get('/orders', {
      params: { assignedTo: 'me', populate: '*' },
    });
    return res.data;
  },

  acceptOrder: async (orderId: string) => {
    const res = await api.put(
      `/orders/${orderId}`,
      { status: 'assigned', assignedTo: 'me' }
    );
    return res.data;
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    const updateData: any = { status };
    if (status === 'picked_up') {
      updateData.pickedUpAt = new Date().toISOString();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date().toISOString();
    }

    const res = await api.put(`/orders/${orderId}`, updateData);
    return res.data;
  },

  getOrderDetails: async (orderId: string) => {
    const res = await api.get(`/orders/${orderId}`, {
      params: { populate: '*' },
    });
    return res.data;
  },
};

// 💰 Earnings API (optional, if you use it)
export const earningsAPI = {
  getEarnings: async (month?: string, year?: number) => {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const res = await api.get('/earnings', {
      params,
    });
    return res.data;
  },

  getCurrentMonthEarnings: async () => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const res = await api.get('/earnings', {
      params: { month, year },
    });
    return res.data;
  },
};

// 🌍 Utils
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);

export const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

export default api; 
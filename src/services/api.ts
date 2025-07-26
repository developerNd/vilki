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
  }
  return config;
});

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
      await axios.put(`${baseURL}/delivery-partners/${partnerId}`, body, await getHeader());
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
    const res = await axios.get(`${baseURL}/orders`, {
      params: { status: 'accepted', populate: '*' },
      ...(await getHeader()),
    });
    return res.data;
  },

  getMyOrders: async () => {
    const res = await axios.get(`${baseURL}/orders`, {
      params: { assignedTo: 'me', populate: '*' },
      ...(await getHeader()),
    });
    return res.data;
  },

  acceptOrder: async (orderId: string) => {
    const res = await axios.put(
      `${baseURL}/orders/${orderId}`,
      { status: 'assigned', assignedTo: 'me' },
      await getHeader()
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

    const res = await axios.put(`${baseURL}/orders/${orderId}`, updateData, await getHeader());
    return res.data;
  },

  getOrderDetails: async (orderId: string) => {
    const res = await axios.get(`${baseURL}/orders/${orderId}`, {
      params: { populate: '*' },
      ...(await getHeader()),
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

    const res = await axios.get(`${baseURL}/earnings`, {
      params,
      ...(await getHeader()),
    });
    return res.data;
  },

  getCurrentMonthEarnings: async () => {
    const currentDate = new Date();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const res = await axios.get(`${baseURL}/earnings`, {
      params: { month, year },
      ...(await getHeader()),
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

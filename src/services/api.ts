// api.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, DeliveryPartner, Order, Earnings } from '../types';

// Environment-based IP configuration
const isDev = __DEV__;

// Configuration options for different development scenarios
const DEV_CONFIGS = {
  // Option 1: If backend is on same machine as emulator (MacBook)
  LOCALHOST: "http://10.0.2.2:1337",
  
  // Option 2: If backend is on Windows laptop (same network)
  WINDOWS_LAPTOP: "http://192.168.1.102:1337",
  
  // Option 4: Production fallback
  PRODUCTION: "https://api.vilkimedicart.in"
};

// Force development mode for testing
const FORCE_DEV = true; // Set this to false when you want production

// Choose your development configuration here
const DEV_IP = DEV_CONFIGS.WINDOWS_LAPTOP; // Windows laptop IP
// const DEV_IP = DEV_CONFIGS.LOCALHOST; // If backend on MacBook
// const DEV_IP = DEV_CONFIGS.PRODUCTION; // Temporary: Use production for testing

export const IP = (isDev || FORCE_DEV) ? DEV_IP : DEV_CONFIGS.PRODUCTION;
export const baseURL = `${IP}/api`;

// Log the current environment and API URL
// console.log(`🚀 Environment: ${isDev ? 'Development' : 'Production'}`);
// console.log(`🔧 Force Dev Mode: ${FORCE_DEV}`);
// console.log(`🌐 API Base URL: ${baseURL}`);
// console.log(`📱 __DEV__ value: ${__DEV__}`);

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
    console.log('🔐 API Request with token:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token preview:', token.substring(0, 20) + '...');
    console.log('📋 Request headers:', config.headers);
  } else {
    console.log('⚠️ API Request without token:', config.method?.toUpperCase(), config.url);
    console.log('🔍 Token not found in AsyncStorage');
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Token might be invalid or expired');
      console.log('Request URL:', error.config?.url);
      console.log('Request method:', error.config?.method);
      
      // Only clear token for certain endpoints, not for order operations
      const url = error.config?.url || '';
      if (url.includes('/delivery-partner/login') || url.includes('/auth/')) {
        console.log('Clearing token for auth-related endpoint');
        AsyncStorage.removeItem('token');
        AsyncStorage.removeItem('deliveryPartner');
      } else {
        console.log('Not clearing token for non-auth endpoint:', url);
      }
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

// Debug function to check authentication state
export const debugAuthState = async () => {
  const token = await AsyncStorage.getItem('token');
  const deliveryPartner = await AsyncStorage.getItem('deliveryPartner');
  
  console.log('🔍 Debug Auth State:');
  console.log('Token exists:', !!token);
  console.log('Token length:', token?.length || 0);
  console.log('Delivery partner exists:', !!deliveryPartner);
  
  if (deliveryPartner) {
    try {
      const partnerData = JSON.parse(deliveryPartner);
      console.log('Partner ID:', partnerData.id);
      console.log('Partner Name:', partnerData.name);
    } catch (e) {
      console.log('Error parsing delivery partner data:', e);
    }
  }
  
  return { token: !!token, deliveryPartner: !!deliveryPartner };
};

// ✅ Auth API
export const authAPI = {
  login: async (partnerid: string, password: string) => {
    try {
      console.log('🔗 Attempting to connect to:', `${baseURL}/delivery-partner/login`);
      console.log('📤 Sending data:', { partnerid, password });
      
      const res = await axios.post(`${baseURL}/delivery-partner/login`, {
        partnerid,
        password,
      });

      console.log('✅ Login successful:', res.data);
      const { jwt, user } = res.data;
      await AsyncStorage.setItem('token', jwt);
      await AsyncStorage.setItem('deliveryPartner', JSON.stringify(user));

      return { success: true, user };
    } catch (err: any) {
      console.error('❌ Login error details:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
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
    try {
      console.log('🔗 Fetching my orders...');
      
      // Get current delivery partner data
      const deliveryPartner = await AsyncStorage.getItem('deliveryPartner');
      if (!deliveryPartner) {
        throw new Error('Delivery partner data not found. Please login again.');
      }
      
      const partnerData = JSON.parse(deliveryPartner);
      console.log('👤 Fetching orders for partner ID:', partnerData.id);
      
      const res = await api.get('/delivery-partner/orders', {
        params: { 
          partnerId: partnerData.id,
          populate: '*' 
        },
      });
      
      console.log('✅ My orders fetched successfully:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Error fetching my orders:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  acceptOrder: async (orderId: string, deliveryPartnerData?: any) => {
    try {
      console.log('🔗 Accepting order:', orderId);
      
      // Debug authentication state
      await debugAuthState();
      
      // Check if user is logged in
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        throw new Error('User not logged in. Please login again.');
      }
      
      // Use provided delivery partner data or get from AsyncStorage
      let partnerData = deliveryPartnerData;
      if (!partnerData) {
        const deliveryPartner = await AsyncStorage.getItem('deliveryPartner');
        if (!deliveryPartner) {
          throw new Error('Delivery partner data not found. Please login again.');
        }
        partnerData = JSON.parse(deliveryPartner);
      }
      
      console.log('👤 Current delivery partner:', partnerData);
      
      const requestData = {
        delivery_partner: partnerData.id,
        status: 'ASSIGNED'
      };
      
      console.log('📤 Request data:', requestData);
      
      // Try different endpoint formats
      let res;
      try {
        // First try the original endpoint with POST
        res = await api.post(`/delivery-partner/orders/${orderId}/accept`, requestData);
      } catch (error: any) {
        if (error.response?.status === 401 || error.response?.status === 404) {
          console.log('🔄 Trying alternative endpoint format...');
          // Try delivery-partner specific endpoint
          res = await api.post(`/delivery-partner/orders/${orderId}/accept`, requestData);
        } else {
          throw error;
        }
      }
      
      console.log('✅ Order accepted successfully:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Accept order error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
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
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
  WINDOWS_LAPTOP: "http://192.168.1.101:1337",
  
  // Option 4: Production fallback
  PRODUCTION: "https://api.vilkimedicart.in"
};

// Force development mode for testing
const FORCE_DEV = false; // Set this to false when you want production

// Choose your development configuration here
// const DEV_IP = DEV_CONFIGS.WINDOWS_LAPTOP; // Windows laptop IP
// const DEV_IP = DEV_CONFIGS.LOCALHOST; // If backend on MacBook
const DEV_IP = DEV_CONFIGS.PRODUCTION; // Temporary: Use production for testing

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

// Request interceptor to attach token automatically
api.interceptors.request.use(async (config) => {
  try {
    // Skip token validation for login endpoint
    if (config.url?.includes('/delivery-partner/login')) {
      console.log('🔓 Login request - skipping token validation');
      return config;
    }

    const token = await AsyncStorage.getItem('token');
    if (token) {
      // Validate token before making request
      const isValid = await validateAndRefreshToken();
      if (!isValid) {
        console.log('❌ Token validation failed, clearing auth data');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('deliveryPartner');
        throw new Error('Token is invalid or expired');
      }

      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 API Request with token:', config.method?.toUpperCase(), config.url);
      console.log('🔑 Token preview:', token.substring(0, 20) + '...');
      console.log('📋 Request headers:', config.headers);
    } else {
      console.log('⚠️ API Request without token:', config.method?.toUpperCase(), config.url);
      console.log('🔍 Token not found in AsyncStorage');
    }
  } catch (error) {
    console.error('❌ Error in request interceptor:', error);
    throw error;
  }
  return config;
});

// Response interceptor to handle errors and token management
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('✅ API Response:', response.config.method?.toUpperCase(), response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error('❌ API Error:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });

    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized - Token might be invalid or expired');
      console.log('Request URL:', error.config?.url);
      console.log('Request method:', error.config?.method);
      
      // Only clear token for certain endpoints, not for order operations
      const url = error.config?.url || '';
      if (url.includes('/delivery-partner/login') || url.includes('/auth/')) {
        console.log('🗑️ Clearing token for auth-related endpoint');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('deliveryPartner');
      } else {
        console.log('⚠️ Not clearing token for non-auth endpoint:', url);
        // For non-auth endpoints, we might want to redirect to login
        // This could be handled by the calling component
      }
    } else if (error.response?.status === 403) {
      console.log('🚫 403 Forbidden - Insufficient permissions');
    } else if (error.response?.status === 500) {
      console.log('💥 500 Server Error - Backend issue');
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

// Utility to ensure authenticated requests
export const ensureAuthenticatedRequest = async (config: any) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Validate token before making request
    const isValid = await validateAndRefreshToken();
    if (!isValid) {
      throw new Error('Token is invalid or expired');
    }
    
    // Ensure Authorization header is set
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
    
    return config;
  } catch (error) {
    console.error('❌ Authentication error:', error);
    throw error;
  }
};

// Function to refresh token if needed
export const refreshTokenIfNeeded = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      return false;
    }

    // Check if token is about to expire (within 5 minutes)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const fiveMinutes = 5 * 60;
      
      if (payload.exp && (payload.exp - currentTime) < fiveMinutes) {
        console.log('⏰ Token expiring soon, attempting refresh...');
        // Here you could implement token refresh logic if your backend supports it
        // For now, we'll just log the warning
        console.log('⚠️ Token will expire soon, consider refreshing');
        return false;
      }
      
      return true;
    } catch (error) {
      console.log('❌ Error checking token expiration:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error in token refresh check:', error);
    return false;
  }
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

// Utility function to validate token and refresh if needed
export const validateAndRefreshToken = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('🔍 No token found');
      return false;
    }

    // Check if token is expired by decoding it (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        console.log('⏰ Token expired, clearing...');
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('deliveryPartner');
        return false;
      }
      
      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      console.log('❌ Error decoding token:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error validating token:', error);
    return false;
  }
};

// ✅ Auth API
export const authAPI = {
  login: async (partnerid: string, password: string) => {
    try {
      console.log('🔗 Attempting to connect to:', `${baseURL}/delivery-partner/login`);
      console.log('📤 Sending data:', { partnerid, password });
      
      const res = await api.post('/delivery-partner/login', {
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
    // Ensure we have a valid token before making the request
    await validateAndRefreshToken();
    const res = await api.get('/delivery-partner/open-orders');
    return res.data;
  },

  getDirectOrders: async () => {
    try {
      console.log('🔗 Fetching direct orders from /stockist-orders/open...');
      
      // Ensure we have a valid token before making the request
      await validateAndRefreshToken();
      
      const res = await api.get('/stockist-orders/open');
      
      console.log('✅ Direct orders fetched successfully:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Error fetching direct orders:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  getMyDirectOrders: async () => {
    try {
      console.log('🔗 Fetching my assigned direct orders...');
      
      // Ensure we have a valid token before making the request
      await validateAndRefreshToken();
      
      // Get current delivery partner data
      const deliveryPartner = await AsyncStorage.getItem('deliveryPartner');
      if (!deliveryPartner) {
        throw new Error('Delivery partner data not found. Please login again.');
      }
      
      const partnerData = JSON.parse(deliveryPartner);
      console.log('👤 Fetching assigned direct orders for partner ID:', partnerData.id);
      
      const res = await api.get('/stockist-orders/my-orders/');
      
      console.log('✅ My assigned direct orders fetched successfully:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Error fetching my assigned direct orders:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
  },

  getMyOrders: async () => {
    try {
      console.log('🔗 Fetching my orders...');
      
      // Ensure we have a valid token before making the request
      await validateAndRefreshToken();
      
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

  acceptOrder: async (orderId: string, deliveryPartnerData?: any, orderType?: 'stockist' | 'direct') => {
    try {
      console.log('🔗 Accepting order:', orderId, 'Type:', orderType);
      
      // Ensure we have a valid token before making the request
      await validateAndRefreshToken();
      
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
      
      let res;
      
      // Handle different order types
      if (orderType === 'direct') {
        // For direct orders, use the stockist-orders endpoint
        console.log('🛒 Accepting direct order via stockist-orders endpoint');
        res = await api.post(`/stockist-orders/${orderId}/accept`, requestData);
      } else {
        // For stockist orders, use the delivery-partner endpoint
        console.log('📦 Accepting stockist order via delivery-partner endpoint');
        try {
          res = await api.post(`/delivery-partner/orders/${orderId}/accept`, requestData);
        } catch (error: any) {
          if (error.response?.status === 401 || error.response?.status === 404) {
            console.log('🔄 Trying alternative endpoint format...');
            res = await api.post(`/delivery-partner/orders/${orderId}/accept`, requestData);
          } else {
            throw error;
          }
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

  updateOrderStatus: async (orderId: string, status: string, orderType?: 'stockist' | 'direct') => {
    try {
      console.log('🔗 Updating order status:', orderId, 'Status:', status, 'Type:', orderType);
      
      // Ensure we have a valid token before making the request
      await validateAndRefreshToken();
      
      const updateData: any = { status };
      if (status === 'picked_up' || status === 'PICKED_UP') {
        updateData.pickedUpAt = new Date().toISOString();
      } else if (status === 'delivered' || status === 'DELIVERED') {
        updateData.deliveredAt = new Date().toISOString();
      }

      let res;
      
      // Handle different order types
      if (orderType === 'direct') {
        // For direct orders, use the stockist-orders endpoint
        console.log('🛒 Updating direct order status via stockist-orders endpoint');
        res = await api.put(`/stockist-orders/${orderId}/update`, updateData);
      } else {
        // For stockist orders, use the delivery-partner endpoint
        console.log('📦 Updating stockist order status via delivery-partner endpoint');
        res = await api.put(`/delivery-partner/orders/${orderId}/status`, updateData);
      }
      
      console.log('✅ Order status updated successfully:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ Update order status error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    }
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
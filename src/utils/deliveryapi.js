// src/api/deliveryApi.js

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isDev = __DEV__;
export const IP = isDev ? 'http://192.168.74.101:1338' : 'https://api.vilkimedicart.in';
export const baseURL = `${IP}/api`;

export const getHeader = async () => {
  const token = await AsyncStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const deliveryLogin = async (partnerid, password) => {
  try {
    const res = await axios.post(`${baseURL}/delivery-partner/login`, {
      partnerid,
      password, // ✅ lowercase 'password'
    });

    const { jwt, user } = res.data;
    await AsyncStorage.setItem('token', jwt);
    await AsyncStorage.setItem('deliveryPartner', JSON.stringify(user));

    return { success: true, user };
  } catch (err) {
    console.error('Login error:', err?.response?.data || err);
    return { success: false, error: err.message };
  }
};


export const deliveryLogout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('deliveryPartner');
};

export const updatePartnerLocation = async (partnerId, latitude, longitude) => {
  try {
    const body = {
      currentLocation: {
        latitude,
        longitude,
      },
    };
    await axios.put(`${baseURL}/delivery-partners/${partnerId}`, body, await getHeader());
    return true;
  } catch (err) {
    console.error('Location update error:', err?.response?.data || err);
    return false;
  }
};

export const getStoredPartner = async () => {
  const partner = await AsyncStorage.getItem('deliveryPartner');
  return partner ? JSON.parse(partner) : null;
};

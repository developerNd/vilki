import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryPartner } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  deliveryPartner: DeliveryPartner | null;
  login: (partnerId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:1338';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const partnerData = await AsyncStorage.getItem('deliveryPartner');
      if (partnerData) {
        const partner = JSON.parse(partnerData);
        setDeliveryPartner(partner);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  };

  const login = async (partnerId: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/delivery-partners/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ partnerId, password }),
      });

      if (!response.ok) {
        console.log('Login failed:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.error) {
        console.log('Login error:', data.error.message);
        return false;
      }

      const partner: DeliveryPartner = data.data;

      await AsyncStorage.setItem('deliveryPartner', JSON.stringify(partner));
      setDeliveryPartner(partner);
      setIsAuthenticated(true);
      console.log('Login successful for:', partner.name);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('deliveryPartner');
      setDeliveryPartner(null);
      setIsAuthenticated(false);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateLocation = async (latitude: number, longitude: number): Promise<void> => {
    if (deliveryPartner) {
      const updatedPartner = {
        ...deliveryPartner,
        currentLocation: { latitude, longitude },
      };
      setDeliveryPartner(updatedPartner);
      await AsyncStorage.setItem('deliveryPartner', JSON.stringify(updatedPartner));
      try {
        await fetch(`${API_BASE_URL}/api/delivery-partners/${deliveryPartner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentLocation: updatedPartner.currentLocation }),
        });
      } catch (error) {
        console.error('Error updating location on backend:', error);
      }
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    deliveryPartner,
    login,
    logout,
    updateLocation,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

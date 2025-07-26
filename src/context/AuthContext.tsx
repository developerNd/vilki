import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { DeliveryPartner } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  deliveryPartner: DeliveryPartner | null;
  login: (partnerId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [deliveryPartner, setDeliveryPartner] = useState<DeliveryPartner | null>(null);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('deliveryPartner');
      if (token && user) {
        setDeliveryPartner(JSON.parse(user));
        setIsAuthenticated(true);
      }
    })();
  }, []);

  const login = async (partnerId: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(partnerId, password);
      console.log('AuthContext login response:', response);
      
      if (response && response.success && response.user) {
        console.log('Setting delivery partner:', response.user);
        setDeliveryPartner(response.user);
        setIsAuthenticated(true);
        console.log('Login successful, user authenticated, isAuthenticated set to true');
        return true;
      }
      console.log('Login failed:', response?.error || 'Unknown error');
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await authAPI.logout();
    setDeliveryPartner(null);
    setIsAuthenticated(false);
  };

  const updateLocation = async (latitude: number, longitude: number): Promise<void> => {
    if (!deliveryPartner) return;
    try {
      const success = await authAPI.updateLocation(deliveryPartner.id.toString(), latitude, longitude);
      if (success) {
        const updatedPartner = {
          ...deliveryPartner,
          currentLocation: { latitude, longitude },
        };
        setDeliveryPartner(updatedPartner);
        await AsyncStorage.setItem('deliveryPartner', JSON.stringify(updatedPartner));
      }
    } catch (error) {
      console.error('Location update error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, deliveryPartner, login, logout, updateLocation }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

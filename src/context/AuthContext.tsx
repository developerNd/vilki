import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DeliveryPartner {
  id: string;
  name: string;
  currentLocation?: { latitude: number; longitude: number };
  // Add other fields if needed
}

interface AuthContextType {
  isAuthenticated: boolean;
  deliveryPartner: DeliveryPartner | null;
  login: (partnerId: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:1338'; // Replace with your backend IP

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
      try {
        const storedUser = await AsyncStorage.getItem('deliveryPartner');
        if (storedUser) {
          setDeliveryPartner(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Error loading auth state', e);
      }
    })();
  }, []);

  const login = async (partnerId: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`localhost:1338/api/delivery-partner/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: partnerId, password }),
      });

      if (!response.ok) {
        console.log('Login failed status:', response.status);
        return false;
      }

      const data = await response.json();

      if (data.error) {
        console.log('Login error:', data.error.message);
        return false;
      }

      const { jwt, user } = data;

      await AsyncStorage.setItem('deliveryPartner', JSON.stringify(user));
      await AsyncStorage.setItem('token', jwt);

      setDeliveryPartner(user);
      setIsAuthenticated(true);
      console.log('Login successful for:', user.name);

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('deliveryPartner');
      await AsyncStorage.removeItem('token');
      setDeliveryPartner(null);
      setIsAuthenticated(false);
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateLocation = async (latitude: number, longitude: number): Promise<void> => {
    if (!deliveryPartner) return;
    try {
      const updatedPartner = {
        ...deliveryPartner,
        currentLocation: { latitude, longitude },
      };
      setDeliveryPartner(updatedPartner);
      await AsyncStorage.setItem('deliveryPartner', JSON.stringify(updatedPartner));

      await fetch(`localhost:1338/api/delivery-partners/${deliveryPartner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentLocation: updatedPartner.currentLocation }),
      });
    } catch (error) {
      console.error('Error updating location:', error);
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

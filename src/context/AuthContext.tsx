import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeliveryPartner } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  deliveryPartner: DeliveryPartner | null;
  login: (partnerId: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateLocation: (latitude: number, longitude: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Test users data
const TEST_USERS: { [key: string]: DeliveryPartner } = {
  'DP001': {
    id: 'DP001',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@vilki.com',
    phone: '+91 98765 43210',
    vehicleNumber: 'DL01AB1234',
    vehicleType: 'Bike',
    isActive: true,
    currentLocation: {
      latitude: 28.6139,
      longitude: 77.2090,
    },
  },
  'DP002': {
    id: 'DP002',
    name: 'Priya Sharma',
    email: 'priya.sharma@vilki.com',
    phone: '+91 98765 43211',
    vehicleNumber: 'DL02CD5678',
    vehicleType: 'Bike',
    isActive: true,
    currentLocation: {
      latitude: 28.5679,
      longitude: 77.2090,
    },
  },
  'DP003': {
    id: 'DP003',
    name: 'Amit Patel',
    email: 'amit.patel@vilki.com',
    phone: '+91 98765 43212',
    vehicleNumber: 'DL03EF9012',
    vehicleType: 'Bike',
    isActive: true,
    currentLocation: {
      latitude: 28.7041,
      longitude: 77.1025,
    },
  },
  'DP004': {
    id: 'DP004',
    name: 'Sneha Gupta',
    email: 'sneha.gupta@vilki.com',
    phone: '+91 98765 43213',
    vehicleNumber: 'DL04GH3456',
    vehicleType: 'Bike',
    isActive: true,
    currentLocation: {
      latitude: 28.4595,
      longitude: 77.0266,
    },
  },
  'DP005': {
    id: 'DP005',
    name: 'Vikram Singh',
    email: 'vikram.singh@vilki.com',
    phone: '+91 98765 43214',
    vehicleNumber: 'DL05IJ7890',
    vehicleType: 'Bike',
    isActive: true,
    currentLocation: {
      latitude: 28.6139,
      longitude: 77.2090,
    },
  },
};

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

  const login = async (partnerId: string): Promise<boolean> => {
    try {
      // Check if the partner ID exists in test users
      const testUser = TEST_USERS[partnerId];
      
      if (!testUser) {
        console.log('Invalid partner ID:', partnerId);
        console.log('Available test users:', Object.keys(TEST_USERS));
        return false;
      }

      // Store the partner data
      await AsyncStorage.setItem('deliveryPartner', JSON.stringify(testUser));
      setDeliveryPartner(testUser);
      setIsAuthenticated(true);
      
      console.log('Login successful for:', testUser.name);
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
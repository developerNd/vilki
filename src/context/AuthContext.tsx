import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  deliveryLogin,
  deliveryLogout,
  updatePartnerLocation,
  getStoredPartner,
} from '../utils/deliveryapi';

export interface DeliveryPartner {
  id: string;
  name: string;
  currentLocation?: { latitude: number; longitude: number };
}

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
      const user = await getStoredPartner();
      if (user) {
        setDeliveryPartner(user);
        setIsAuthenticated(true);
      }
    })();
  }, []);

  const login = async (partnerId: string, password: string): Promise<boolean> => {
    const result = await deliveryLogin(partnerId, password);
    if (result.success) {
      setDeliveryPartner(result.user);
      setIsAuthenticated(true);
    }
    return result.success;
  };

  const logout = async (): Promise<void> => {
    await deliveryLogout();
    setDeliveryPartner(null);
    setIsAuthenticated(false);
  };

  const updateLocation = async (latitude: number, longitude: number): Promise<void> => {
    if (!deliveryPartner) return;
    const updatedPartner = {
      ...deliveryPartner,
      currentLocation: { latitude, longitude },
    };
    const success = await updatePartnerLocation(deliveryPartner.id, latitude, longitude);
    if (success) {
      setDeliveryPartner(updatedPartner);
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

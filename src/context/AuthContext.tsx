import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

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

  // Check stored user on mount
  useEffect(() => {
    (async () => {
      const user = await authAPI.getStoredPartner();
      if (user) {
        setDeliveryPartner(user);
        setIsAuthenticated(true);
      }
    })();
  }, []);

  // Login logic
  const login = async (partnerId: string, password: string): Promise<boolean> => {
    const result = await authAPI.login(partnerId, password);
    if (result.success) {
      setDeliveryPartner(result.user);
      setIsAuthenticated(true);
    }
    return result.success;
  };

  // Logout logic
  const logout = async (): Promise<void> => {
    await authAPI.logout();
    setDeliveryPartner(null);
    setIsAuthenticated(false);
  };

  // Update delivery partner location
  const updateLocation = async (latitude: number, longitude: number): Promise<void> => {
    if (!deliveryPartner) return;
    const success = await authAPI.updateLocation(deliveryPartner.id, latitude, longitude);
    if (success) {
      setDeliveryPartner((prev) =>
        prev
          ? {
              ...prev,
              currentLocation: { latitude, longitude },
            }
          : null
      );
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

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order, OrderStatus } from '../types';
import { useAuth } from './AuthContext'; // Adjust the path if needed

interface OrderContextType {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  fetchOrders: () => Promise<void>;
  acceptOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  setCurrentOrder: (order: Order | null) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { deliveryPartner } = useAuth(); // Pull partner details from auth context

  const API_URL = 'https://api.vilkimedicart.in';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('delivery-token');

      const response = await fetch(`${API_URL}/api/delivery-partner/open-orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        console.error('Unauthorized: Invalid or expired token');
        return;
      }

      const json = await response.json();
      setOrders(json.data || []);
    } catch (error) {
      console.error('Error fetching open orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId: string) => {
    try {
      const token = await AsyncStorage.getItem('delivery-token');

      const response = await fetch(`${API_URL}/api/delivery-partner/accept-order/${orderId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const json = await response.json();
      const updatedOrder = json.data;

      setOrders(prev =>
        prev.map(order => (order.id === orderId ? updatedOrder : order))
      );

      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error accepting order:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const token = await AsyncStorage.getItem('delivery-token');

      const response = await fetch(`${API_URL}/api/delivery-partner/update-order-status/${orderId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          ...(status === OrderStatus.PICKED_UP && { pickedUpAt: new Date().toISOString() }),
          ...(status === OrderStatus.DELIVERED && { deliveredAt: new Date().toISOString() }),
        }),
      });

      const json = await response.json();
      const updatedOrder = json.data;

      setOrders(prev =>
        prev.map(order => (order.id === orderId ? updatedOrder : order))
      );

      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  useEffect(() => {
    if (deliveryPartner?.id) {
      fetchOrders();
    }
  }, [deliveryPartner]);

  const value: OrderContextType = {
    orders,
    currentOrder,
    loading,
    fetchOrders,
    acceptOrder,
    updateOrderStatus,
    setCurrentOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

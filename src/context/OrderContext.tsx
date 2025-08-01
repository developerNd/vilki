import React, { createContext, useContext, useState, useEffect } from 'react';
import { Order, OrderStatus } from '../types';
import { ordersAPI } from '../services/api';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  myOrders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  fetchOrders: () => Promise<void>;
  fetchMyOrders: () => Promise<void>;
  acceptOrder: (orderId: string, deliveryPartnerData?: any) => Promise<void>;
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
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  console.log(orders);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { deliveryPartner } = useAuth();

  // Mock data for demonstration
  const mockOrders: Order[] = [
    {
      id: '1',
      orderNumber: 'ORD001',
      customerName: 'Alice Johnson',
      customerPhone: '+1234567890',
      pickupAddress: {
        address: '123 Medical Store, Connaught Place, New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        instructions: 'Ask for Mr. Sharma at the counter',
      },
      deliveryAddress: {
        address: '456 Green Park, New Delhi',
        latitude: 28.5679,
        longitude: 77.2090,
        instructions: 'Call before delivery',
      },
      items: [
        { id: '1', name: 'Paracetamol 500mg', quantity: 2, price: 50, category: 'Pain Relief' },
        { id: '2', name: 'Vitamin C 1000mg', quantity: 1, price: 200, category: 'Vitamins' },
      ],
      totalAmount: 300,
      status: OrderStatus.ACCEPTED,
      createdAt: '2024-01-15T10:00:00Z',
      acceptedAt: '2024-01-15T10:30:00Z',
      distance: 2.5,
      estimatedTime: 15,
    },
    {
      id: '2',
      orderNumber: 'ORD002',
      customerName: 'Bob Smith',
      customerPhone: '+1234567891',
      pickupAddress: {
        address: '789 Pharmacy, Lajpat Nagar, New Delhi',
        latitude: 28.5679,
        longitude: 77.2090,
        instructions: 'Ring the bell twice',
      },
      deliveryAddress: {
        address: '321 Defence Colony, New Delhi',
        latitude: 28.5679,
        longitude: 77.2090,
        instructions: 'Leave with security guard',
      },
      items: [
        { id: '3', name: 'Amoxicillin 250mg', quantity: 1, price: 150, category: 'Antibiotics' },
      ],
      totalAmount: 150,
      status: OrderStatus.ACCEPTED,
      createdAt: '2024-01-15T11:00:00Z',
      acceptedAt: '2024-01-15T11:15:00Z',
      distance: 1.8,
      estimatedTime: 12,
    },

  ];

  // Example in your OrderContext.js / OrderContext.ts

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getOrders();
      if (response && response.data) {
        setOrders(response.data);
      } else {
        // Fallback to mock data if API fails
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error fetching open orders:', error);
      // Fallback to mock data for development
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getMyOrders();
      if (response && response.data) {
        setMyOrders(response.data);
      } else {
        // Fallback to empty array if API fails
        setMyOrders([]);
      }
    } catch (error) {
      console.error('Error fetching my orders:', error);
      // Fallback to empty array for development
      setMyOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const acceptOrder = async (orderId: string, deliveryPartnerData?: any) => {
    try {
      // Use provided delivery partner data or get from context
      const partnerData = deliveryPartnerData || deliveryPartner;
      
      console.log('🔍 OrderContext acceptOrder debug:');
      console.log('Provided deliveryPartnerData:', deliveryPartnerData);
      console.log('Context deliveryPartner:', deliveryPartner);
      console.log('Final partnerData:', partnerData);
      
      if (!partnerData) {
        throw new Error('Delivery partner data not available. Please login again.');
      }
      
      const response = await ordersAPI.acceptOrder(orderId, partnerData);
      if (response) {
        // Update only the specific order instead of reloading all orders
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order.id === orderId
              ? {
                  ...order,
                  status: OrderStatus.ASSIGNED,
                  assignedTo: partnerData.id.toString(),
                  acceptedAt: new Date().toISOString(),
                  // Add delivery_partner as a dynamic property
                  ...(order as any),
                  delivery_partner: partnerData
                } as any
              : order
          )
        );
        
        // Also update currentOrder if it's the one being accepted
        if (currentOrder?.id === orderId) {
          setCurrentOrder({
            ...currentOrder,
            status: OrderStatus.ASSIGNED,
            assignedTo: partnerData.id.toString(),
            acceptedAt: new Date().toISOString(),
            // Add delivery_partner as a dynamic property
            ...(currentOrder as any),
            delivery_partner: partnerData
          } as any);
        }
      }
      return response;
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error; // Re-throw the error so UI can handle it
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const response = await ordersAPI.updateOrderStatus(orderId, status);
      if (response) {
        setOrders(prevOrders =>
          prevOrders.map(order => {
            if (order.id === orderId) {
              const updatedOrder = { ...order, status };
              if (status === OrderStatus.PICKED_UP) {
                updatedOrder.pickedUpAt = new Date().toISOString();
              } else if (status === OrderStatus.DELIVERED) {
                updatedOrder.deliveredAt = new Date().toISOString();
              }
              return updatedOrder;
            }
            return order;
          })
        );

        if (currentOrder?.id === orderId) {
          const updatedCurrentOrder = orders.find(order => order.id === orderId);
          if (updatedCurrentOrder) {
            setCurrentOrder(updatedCurrentOrder);
          }
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const value: OrderContextType = {
    orders,
    myOrders,
    currentOrder,
    loading,
    fetchOrders,
    fetchMyOrders,
    acceptOrder,
    updateOrderStatus,
    setCurrentOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}; 
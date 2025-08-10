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
  acceptOrder: (orderId: string, deliveryPartnerData?: any, orderType?: 'stockist' | 'direct') => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus, orderType?: 'stockist' | 'direct') => Promise<void>;
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
      totalAmount: 325,
      billAmount: 300,
      deliveryCharges: 25,
      hasExceededFreeDeliveryLimit: true,
      status: OrderStatus.ACCEPTED,
      createdAt: '2024-01-15T10:00:00Z',
      acceptedAt: '2024-01-15T10:30:00Z',
      distance: 2.5,
      estimatedTime: 15,
      orderType: 'stockist',
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
      orderType: 'stockist',
    },
    {
      id: '3',
      orderNumber: 'ORD003',
      customerName: 'Carol Davis',
      customerPhone: '+1234567892',
      pickupAddress: {
        address: 'ABC Medical Center, Dwarka, New Delhi',
        latitude: 28.6139,
        longitude: 77.2090,
        instructions: 'Collect from reception desk',
      },
      deliveryAddress: {
        address: '789 Sector 12, Dwarka, New Delhi',
        latitude: 28.5679,
        longitude: 77.2090,
        instructions: 'Call customer on arrival',
      },
      items: [
        { id: '4', name: 'Omeprazole 20mg', quantity: 1, price: 120, category: 'Gastric' },
        { id: '5', name: 'Cetirizine 10mg', quantity: 2, price: 80, category: 'Allergy' },
      ],
      totalAmount: 280,
      billAmount: 280,
      deliveryCharges: 0,
      hasExceededFreeDeliveryLimit: false,
      status: OrderStatus.ACCEPTED,
      createdAt: '2024-01-15T12:00:00Z',
      acceptedAt: '2024-01-15T12:15:00Z',
      distance: 3.2,
      estimatedTime: 18,
      orderType: 'direct',
    },
    {
      id: '4',
      orderNumber: 'ORD004',
      customerName: 'David Wilson',
      customerPhone: '+1234567893',
      pickupAddress: {
        address: 'XYZ Retail Store, Gurgaon',
        latitude: 28.6139,
        longitude: 77.2090,
        instructions: 'Ask for Mrs. Patel',
      },
      deliveryAddress: {
        address: '456 Cyber City, Gurgaon',
        latitude: 28.5679,
        longitude: 77.2090,
        instructions: 'Deliver to office reception',
      },
      items: [
        { id: '6', name: 'Ibuprofen 400mg', quantity: 3, price: 60, category: 'Pain Relief' },
        { id: '7', name: 'Calcium 500mg', quantity: 1, price: 250, category: 'Supplements' },
      ],
      totalAmount: 430,
      status: OrderStatus.ACCEPTED,
      createdAt: '2024-01-15T13:00:00Z',
      acceptedAt: '2024-01-15T13:20:00Z',
      distance: 4.1,
      estimatedTime: 22,
      orderType: 'direct',
    },
    {
      id: '5',
      orderNumber: 'ORD005',
      customerName: 'Emma Brown',
      customerPhone: '+1234567894',
      pickupAddress: {
        address: 'PQR Medical Store, Noida',
        latitude: 28.6139,
        longitude: 77.2090,
        instructions: 'Collect from back entrance',
      },
      deliveryAddress: {
        address: '123 Sector 62, Noida',
        latitude: 28.5679,
        longitude: 77.2090,
        instructions: 'Leave with security if not home',
      },
      items: [
        { id: '8', name: 'Metformin 500mg', quantity: 2, price: 90, category: 'Diabetes' },
        { id: '9', name: 'Multivitamin', quantity: 1, price: 180, category: 'Vitamins' },
      ],
      totalAmount: 360,
      status: OrderStatus.ACCEPTED,
      createdAt: '2024-01-15T14:00:00Z',
      acceptedAt: '2024-01-15T14:10:00Z',
      distance: 2.8,
      estimatedTime: 16,
      orderType: 'stockist',
    },
  ];

  // Example in your OrderContext.js / OrderContext.ts

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch both stockist and direct orders
      const [stockistResponse, directResponse] = await Promise.allSettled([
        ordersAPI.getOrders(),
        ordersAPI.getDirectOrders()
      ]);

      let allOrders: Order[] = [];

      // Process stockist orders
      if (stockistResponse.status === 'fulfilled') {
        console.log('📦 Stockist orders response:', stockistResponse.value);
        const stockistData = stockistResponse.value?.data || stockistResponse.value;
        if (stockistData && Array.isArray(stockistData)) {
          console.log('🔍 Sample stockist order data:', stockistData[0]); // Debug log
          const stockistOrders = stockistData.map((order: any) => ({
            // Map stockist order structure to match expected Order interface
            id: order.id.toString(),
            orderNumber: order.slug,
            customerName: order.consumerName,
            customerPhone: order.consumerPhone,
            pickupAddress: {
              address: order.seller?.seller_info?.address || order.seller?.address || 'N/A',
              latitude: order.seller?.latitude || 0,
              longitude: order.seller?.longitude || 0,
              instructions: `Pickup from ${order.seller?.name || 'Seller'}`
            },
            deliveryAddress: {
              address: order.address?.addressLine1 || 'N/A',
              latitude: order.address?.latitude || 0,
              longitude: order.address?.longitude || 0,
              instructions: order.address?.addressLine2 || ''
            },
            items: order.order_products || [],
            totalAmount: order.totalAmount || order.total_amount,
            billAmount: order.billAmount,
            deliveryCharges: order.deliveryCharges,
            hasExceededFreeDeliveryLimit: order.hasExceededFreeDeliveryLimit,
            status: order.status as any,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            // Additional fields from stockist order
            consumerEmail: order.consumerEmail,
            isPaid: order.isPaid,
            payment_mode: order.payment_mode,
            payment_id: order.payment_id,
            payment_signature: order.payment_signature,
            rzpayOrderId: order.rzpayOrderId,
            seller: order.seller,
            seller_uuid: order.seller_uuid,
            shares: order.shares,
            user: order.user,
            wallet_balance: order.wallet_balance,
            orderType: 'stockist' as const
          } as any));
          allOrders = [...allOrders, ...stockistOrders];
        }
      } else if (stockistResponse.status === 'rejected') {
        console.error('❌ Stockist orders fetch failed:', stockistResponse.reason);
      }

      // Process direct orders
      if (directResponse.status === 'fulfilled') {
        console.log('🛒 Direct orders response:', directResponse.value);
        const directData = directResponse.value?.data || directResponse.value;
        if (directData && Array.isArray(directData)) {
          const directOrders = directData.map((order: any) => ({
            // Map the direct order structure to match expected Order interface
            id: order.id.toString(),
            orderNumber: order.orderId,
            customerName: order.retailerName,
            customerPhone: order.retailerPhone,
            pickupAddress: {
              address: order.stockistAddress,
              latitude: 0, // Default value since not provided
              longitude: 0, // Default value since not provided
              instructions: ''
            },
            deliveryAddress: {
              address: order.retailerAddress,
              latitude: 0, // Default value since not provided
              longitude: 0, // Default value since not provided
              instructions: ''
            },
            items: [], // Empty array since items not provided in direct orders
            totalAmount: order.totalAmount || order.billAmount,
            billAmount: order.billAmount,
            deliveryCharges: order.deliveryCharges,
            hasExceededFreeDeliveryLimit: order.hasExceededFreeDeliveryLimit,
            status: order.status as any, // Cast to OrderStatus
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            // Additional fields from direct order (as dynamic properties)
            retailerId: order.retailerId,
            retailerEmail: order.retailerEmail,
            stockistName: order.stockistName,
            stockistPhone: order.stockistPhone,
            delivery_partner: order.delivery_partner,
            deliveryPartnerId: order.deliveryPartnerId,
            deliveryPartnerName: order.deliveryPartnerName,
            deliveryPartnerPhone: order.deliveryPartnerPhone,
            estimatedDeliveryTime: order.estimatedDeliveryTime,
            cancellationReason: order.cancellationReason,
            user: order.user,
            orderType: 'direct'
          } as any));
          allOrders = [...allOrders, ...directOrders];
        }
      } else if (directResponse.status === 'rejected') {
        console.error('❌ Direct orders fetch failed:', directResponse.reason);
      }

      console.log(`📊 Total orders fetched: ${allOrders.length}`);
      console.log(`📦 Stockist orders: ${allOrders.filter(o => o.orderType === 'stockist').length}`);
      console.log(`🛒 Direct orders: ${allOrders.filter(o => o.orderType === 'direct').length}`);

      if (allOrders.length > 0) {
        setOrders(allOrders);
      } else {
        // Fallback to mock data if both APIs fail
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to mock data for development
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      // Fetch both stockist and direct orders that are assigned to the current delivery partner
      const [stockistResponse, directResponse] = await Promise.allSettled([
        ordersAPI.getMyOrders(),
        ordersAPI.getMyDirectOrders()
      ]);

      let allMyOrders: Order[] = [];

      // Process stockist orders (my orders)
      if (stockistResponse.status === 'fulfilled' && stockistResponse.value?.data) {
        console.log('📦 My stockist orders response:', stockistResponse.value);
        const stockistData = stockistResponse.value.data;
        if (Array.isArray(stockistData)) {
          const stockistOrders = stockistData.map((order: any) => ({
            ...order,
            id: order.id?.toString() || order.id,
            totalAmount: order.totalAmount || order.total_amount,
            billAmount: order.billAmount,
            deliveryCharges: order.deliveryCharges,
            hasExceededFreeDeliveryLimit: order.hasExceededFreeDeliveryLimit,
            orderType: 'stockist'
          }));
          allMyOrders = [...allMyOrders, ...stockistOrders];
        }
      } else if (stockistResponse.status === 'rejected') {
        console.error('❌ My stockist orders fetch failed:', stockistResponse.reason);
      }

            // Process direct orders (my orders)
      if (directResponse.status === 'fulfilled' && directResponse.value?.data) {
        console.log('🛒 My assigned direct orders response:', directResponse.value);
        const directData = directResponse.value.data;
        if (Array.isArray(directData)) {
          console.log('✅ Assigned direct orders count:', directData.length);
          
          const directOrders = directData.map((order: any) => ({
             // Map the direct order structure to match expected Order interface
             id: order.id.toString(),
             orderNumber: order.orderId,
             customerName: order.retailerName,
             customerPhone: order.retailerPhone,
             pickupAddress: {
               address: order.stockistAddress,
               latitude: 0,
               longitude: 0,
               instructions: ''
             },
             deliveryAddress: {
               address: order.retailerAddress,
               latitude: 0,
               longitude: 0,
               instructions: ''
             },
             items: [],
             totalAmount: order.totalAmount || order.billAmount,
             billAmount: order.billAmount,
             deliveryCharges: order.deliveryCharges,
             hasExceededFreeDeliveryLimit: order.hasExceededFreeDeliveryLimit,
             status: order.status as any,
             createdAt: order.createdAt,
             updatedAt: order.updatedAt,
             // Additional fields from direct order
             retailerId: order.retailerId,
             retailerEmail: order.retailerEmail,
             stockistName: order.stockistName,
             stockistPhone: order.stockistPhone,
             delivery_partner: order.delivery_partner,
             deliveryPartnerId: order.deliveryPartnerId,
             deliveryPartnerName: order.deliveryPartnerName,
             deliveryPartnerPhone: order.deliveryPartnerPhone,
             estimatedDeliveryTime: order.estimatedDeliveryTime,
             cancellationReason: order.cancellationReason,
             user: order.user,
             orderType: 'direct' as const
           } as any));
          allMyOrders = [...allMyOrders, ...directOrders];
        }
      } else if (directResponse.status === 'rejected') {
        console.error('❌ My assigned direct orders fetch failed:', directResponse.reason);
      }

      console.log(`📊 Total my orders fetched: ${allMyOrders.length}`);
      console.log(`📦 My stockist orders: ${allMyOrders.filter(o => o.orderType === 'stockist').length}`);
      console.log(`🛒 My direct orders: ${allMyOrders.filter(o => o.orderType === 'direct').length}`);

      setMyOrders(allMyOrders);
    } catch (error) {
      console.error('Error fetching my orders:', error);
      setMyOrders([]);
    } finally {
      setLoading(false);
    }
  };


  const acceptOrder = async (orderId: string, deliveryPartnerData?: any, orderType?: 'stockist' | 'direct') => {
    try {
      // Use provided delivery partner data or get from context
      const partnerData = deliveryPartnerData || deliveryPartner;
      
      console.log('🔍 OrderContext acceptOrder debug:');
      console.log('Provided deliveryPartnerData:', deliveryPartnerData);
      console.log('Context deliveryPartner:', deliveryPartner);
      console.log('Final partnerData:', partnerData);
      console.log('Order type:', orderType);
      
      if (!partnerData) {
        throw new Error('Delivery partner data not available. Please login again.');
      }
      
      const response = await ordersAPI.acceptOrder(orderId, partnerData, orderType);
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

        // Update myOrders state to include the accepted order
        if (orderType === 'direct') {
          console.log('🛒 Adding accepted direct order to myOrders:', orderId);
          console.log('📤 Response data:', response);
          
          // For direct orders, we need to add the accepted order to myOrders
          const acceptedOrder = {
            id: orderId,
            orderNumber: response.orderId || orderId,
            customerName: response.retailerName || 'Customer',
            customerPhone: response.retailerPhone || '',
            pickupAddress: {
              address: response.stockistAddress || 'N/A',
              latitude: 0,
              longitude: 0,
              instructions: ''
            },
            deliveryAddress: {
              address: response.retailerAddress || 'N/A',
              latitude: 0,
              longitude: 0,
              instructions: ''
            },
            items: [],
            totalAmount: response.billAmount || 0,
            status: OrderStatus.ASSIGNED,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            acceptedAt: new Date().toISOString(),
            delivery_partner: partnerData,
            orderType: 'direct' as const
          } as any;

          console.log('📋 Created accepted order object:', acceptedOrder);

          setMyOrders(prevMyOrders => {
            console.log('📊 Current myOrders count:', prevMyOrders.length);
            // Check if order already exists in myOrders
            const existingOrder = prevMyOrders.find(order => order.id === orderId);
            if (!existingOrder) {
              console.log('✅ Adding new direct order to myOrders');
              return [...prevMyOrders, acceptedOrder];
            } else {
              console.log('⚠️ Order already exists in myOrders');
            }
            return prevMyOrders;
          });
        } else {
          console.log('📦 Refreshing myOrders for stockist order');
          // For stockist orders, refresh myOrders to get the latest data
          fetchMyOrders();
        }
      }
      return response;
    } catch (error) {
      console.error('Error accepting order:', error);
      throw error; // Re-throw the error so UI can handle it
    }
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, orderType?: 'stockist' | 'direct') => {
    try {
      console.log('🔍 OrderContext updateOrderStatus debug:');
      console.log('Order ID:', orderId);
      console.log('Status:', status);
      console.log('Order Type:', orderType);
      
      const response = await ordersAPI.updateOrderStatus(orderId, status, orderType);
      if (response) {
        console.log('✅ API Response:', response);
        
        // Update orders state
        setOrders(prevOrders => {
          console.log('📦 Current orders count:', prevOrders.length);
          const updatedOrders = prevOrders.map(order => {
            if (order.id === orderId) {
              console.log('🔄 Updating order in orders state:', order.id);
              const updatedOrder = { ...order, status };
              if (status === OrderStatus.PICKED_UP) {
                updatedOrder.pickedUpAt = new Date().toISOString();
              } else if (status === OrderStatus.DELIVERED) {
                updatedOrder.deliveredAt = new Date().toISOString();
              }
              return updatedOrder;
            }
            return order;
          });
          console.log('📦 Updated orders count:', updatedOrders.length);
          return updatedOrders;
        });

        // Update myOrders state
        setMyOrders(prevMyOrders => {
          console.log('📋 Current myOrders count:', prevMyOrders.length);
          const orderInMyOrders = prevMyOrders.find(order => order.id === orderId);
          console.log('🔍 Order found in myOrders:', !!orderInMyOrders);
          
          const updatedMyOrders = prevMyOrders.map(order => {
            if (order.id === orderId) {
              console.log('🔄 Updating order in myOrders state:', order.id);
              const updatedOrder = { ...order, status };
              if (status === OrderStatus.PICKED_UP) {
                updatedOrder.pickedUpAt = new Date().toISOString();
              } else if (status === OrderStatus.DELIVERED) {
                updatedOrder.deliveredAt = new Date().toISOString();
              }
              return updatedOrder;
            }
            return order;
          });
          console.log('📋 Updated myOrders count:', updatedMyOrders.length);
          return updatedMyOrders;
        });

        // Update currentOrder if it's the one being updated
        if (currentOrder?.id === orderId) {
          console.log('🔄 Updating currentOrder:', currentOrder.id);
          const updatedCurrentOrder = { ...currentOrder, status };
          if (status === OrderStatus.PICKED_UP) {
            updatedCurrentOrder.pickedUpAt = new Date().toISOString();
          } else if (status === OrderStatus.DELIVERED) {
            updatedCurrentOrder.deliveredAt = new Date().toISOString();
          }
          setCurrentOrder(updatedCurrentOrder);
        }

        // Refresh myOrders to ensure we have the latest data from server
        console.log('🔄 Refreshing myOrders to get latest data...');
        setTimeout(() => {
          fetchMyOrders();
        }, 1000); // Small delay to ensure server has processed the update
        
        // Also refresh orders to ensure consistency
        setTimeout(() => {
          fetchOrders();
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error; // Re-throw so UI can handle it
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
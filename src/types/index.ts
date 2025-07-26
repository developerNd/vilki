export interface DeliveryPartner {
  id: number;
  partnerid: string;
  name: string;
  mail: string;
  phone: string;
  vehicleNumber: string;
  vehicleType: string;
  isActive: boolean;
  latitude?: number | null;
  longitude?: number | null;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  pickupAddress: {
    address: string;
    latitude: number;
    longitude: number;
    instructions?: string;
  };
  deliveryAddress: {
    address: string;
    latitude: number;
    longitude: number;
    instructions?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  assignedTo?: string;
  distance?: number;
  estimatedTime?: number;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  category: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Earnings {
  id: string;
  month: string;
  year: number;
  totalOrders: number;
  totalEarnings: number;
  bonus: number;
  deductions: number;
  netEarnings: number;
  paid: boolean;
  paidAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
} 
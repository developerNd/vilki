import { StackNavigationProp } from '@react-navigation/stack';
import { Order } from './index';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  OrderDetails: { order: Order; fromMyOrders?: boolean };
};

export type TabParamList = {
  Orders: undefined;
  Map: undefined;
  Earnings: undefined;
  Profile: undefined;
};

export type NavigationProp = StackNavigationProp<RootStackParamList>; 
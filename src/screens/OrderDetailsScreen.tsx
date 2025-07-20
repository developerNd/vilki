import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  Divider,
  List,
  useTheme,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrders } from '../context/OrderContext';
import { Order, OrderStatus } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp } from '../types/navigation';

interface RouteParams {
  order: Order;
}

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { order } = route.params as RouteParams;
  const { updateOrderStatus } = useOrders();
  const theme = useTheme();
  const [updating, setUpdating] = useState(false);

  const handleCallCustomer = () => {
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const handleUpdateStatus = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      Alert.alert('Success', `Order status updated to ${getStatusText(newStatus)}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ACCEPTED:
        return '#2196F3';
      case OrderStatus.ASSIGNED:
        return '#FF9800';
      case OrderStatus.PICKED_UP:
        return '#9C27B0';
      case OrderStatus.IN_TRANSIT:
        return '#FF5722';
      case OrderStatus.DELIVERED:
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ACCEPTED:
        return 'Available';
      case OrderStatus.ASSIGNED:
        return 'Assigned';
      case OrderStatus.PICKED_UP:
        return 'Picked Up';
      case OrderStatus.IN_TRANSIT:
        return 'In Transit';
      case OrderStatus.DELIVERED:
        return 'Delivered';
      default:
        return status;
    }
  };

  const canUpdateStatus = (currentStatus: OrderStatus, targetStatus: OrderStatus) => {
    const statusFlow = [
      OrderStatus.ACCEPTED,
      OrderStatus.ASSIGNED,
      OrderStatus.PICKED_UP,
      OrderStatus.IN_TRANSIT,
      OrderStatus.DELIVERED,
    ];
    
    const currentIndex = statusFlow.indexOf(currentStatus);
    const targetIndex = statusFlow.indexOf(targetStatus);
    
    return targetIndex === currentIndex + 1;
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    switch (currentStatus) {
      case OrderStatus.ASSIGNED:
        return OrderStatus.PICKED_UP;
      case OrderStatus.PICKED_UP:
        return OrderStatus.IN_TRANSIT;
      case OrderStatus.IN_TRANSIT:
        return OrderStatus.DELIVERED;
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(order.status);

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.orderNumber}>{order.orderNumber}</Title>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(order.status) }}
              style={[styles.statusChip, { borderColor: getStatusColor(order.status) }]}
            >
              {getStatusText(order.status)}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.customerInfo}>
              <View style={styles.infoRow}>
                <Icon name="person" size={20} color="#666" />
                <Text style={styles.infoText}>{order.customerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#666" />
                <Text style={styles.infoText}>{order.customerPhone}</Text>
                <Button
                  mode="text"
                  compact
                  onPress={handleCallCustomer}
                  style={styles.callButton}
                >
                  Call
                </Button>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pickup Location</Text>
            <View style={styles.addressCard}>
              <Icon name="location-on" size={20} color="#FF5722" />
              <View style={styles.addressContent}>
                <Text style={styles.addressText}>{order.pickupAddress.address}</Text>
                {order.pickupAddress.instructions && (
                  <Text style={styles.instructions}>
                    Instructions: {order.pickupAddress.instructions}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Location</Text>
            <View style={styles.addressCard}>
              <Icon name="location-on" size={20} color="#4CAF50" />
              <View style={styles.addressContent}>
                <Text style={styles.addressText}>{order.deliveryAddress.address}</Text>
                {order.deliveryAddress.instructions && (
                  <Text style={styles.instructions}>
                    Instructions: {order.deliveryAddress.instructions}
                  </Text>
                )}
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.items.map((item, index) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemCategory}>{item.category}</Text>
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
              </View>
            ))}
            <Divider style={styles.itemDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {order.distance && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Distance:</Text>
                <Text style={styles.detailValue}>{order.distance} km</Text>
              </View>
            )}
            {order.estimatedTime && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Estimated Time:</Text>
                <Text style={styles.detailValue}>{order.estimatedTime} minutes</Text>
              </View>
            )}
          </View>

          {nextStatus && (
            <View style={styles.actionSection}>
              <Button
                mode="contained"
                onPress={() => handleUpdateStatus(nextStatus)}
                loading={updating}
                disabled={updating}
                style={styles.updateButton}
                contentStyle={styles.updateButtonContent}
              >
                Mark as {getStatusText(nextStatus)}
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 32,
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  customerInfo: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  callButton: {
    marginLeft: 8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressContent: {
    flex: 1,
    marginLeft: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  instructions: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  itemCategory: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 2,
  },
  itemDivider: {
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionSection: {
    marginTop: 16,
  },
  updateButton: {
    borderRadius: 8,
  },
  updateButtonContent: {
    paddingVertical: 8,
  },
});

export default OrderDetailsScreen; 
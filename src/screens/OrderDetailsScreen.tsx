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
  Text,
  Chip,
  Divider,
  Button,
  useTheme,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrders } from '../context/OrderContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp } from '../types/navigation';

interface RouteParams {
  order: any;
}

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { order } = route.params as RouteParams;
  const { updateOrderStatus } = useOrders();
  const theme = useTheme();
  const [updating, setUpdating] = useState(false);

  const handleCallCustomer = () => {
    if (order.consumerPhone) {
      Linking.openURL(`tel:${order.consumerPhone}`);
    } else {
      Alert.alert('Phone number not available');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return '#2196F3';
      case 'ASSIGNED':
        return '#FF9800';
      case 'PICKED_UP':
        return '#9C27B0';
      case 'IN_TRANSIT':
        return '#FF5722';
      case 'DELIVERED':
        return '#4CAF50';
      case 'DECLINED':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return 'Accepted';
      case 'ASSIGNED':
        return 'Assigned';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'DELIVERED':
        return 'Delivered';
      case 'DECLINED':
        return 'Declined';
      default:
        return status;
    }
  };

  const nextStatusMap: Record<string, string | null> = {
    ACCEPTED: 'ASSIGNED',
    ASSIGNED: 'PICKED_UP',
    PICKED_UP: 'IN_TRANSIT',
    IN_TRANSIT: 'DELIVERED',
    DELIVERED: null,
    DECLINED: null,
  };

  const nextStatus = nextStatusMap[order.status] ?? null;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.orderNumber}>{order.slug}</Title>
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
                <Text style={styles.infoText}>{order.consumerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#666" />
                <Text style={styles.infoText}>{order.consumerPhone}</Text>
                <Button
                  mode="text"
                  compact
                  onPress={handleCallCustomer}
                  style={styles.callButton}
                >
                  Call
                </Button>
              </View>
              {order.consumerEmail && (
                <View style={styles.infoRow}>
                  <Icon name="email" size={20} color="#666" />
                  <Text style={styles.infoText}>{order.consumerEmail}</Text>
                </View>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address</Text>
            <View style={styles.addressCard}>
              <Icon name="location-on" size={20} color="#FF5722" />
              <View style={styles.addressContent}>
                <Text style={styles.addressText}>{order.address?.addressLine1 ?? 'N/A'}</Text>
                <Text style={styles.addressText}>
                  {order.address?.city}, {order.address?.state}, {order.address?.pincode}
                </Text>
                {order.address?.addressLine2 ? (
                  <Text style={styles.instructions}>
                    {order.address.addressLine2}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            {order.order_products?.map((item: any) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {/* If you have category or type, you can show here */}
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
              <Text style={styles.totalAmount}>₹{order.total_amount}</Text>
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
                icon={updating ? undefined : 'check-circle'}
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
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
  callButton: {
    marginLeft: 16,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    elevation: 1,
  },
  addressContent: {
    marginLeft: 8,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
  instructions: {
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  itemDetails: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemDivider: {
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 16,
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
    fontWeight: '600',
    color: '#333',
  },
  actionSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  updateButton: {
    width: '100%',
    borderRadius: 8,
  },
  updateButtonContent: {
    paddingVertical: 8,
  },
});

export default OrderDetailsScreen;

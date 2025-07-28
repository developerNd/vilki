import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  StatusBar,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Chip,
  Divider,
  Button,
  useTheme,
  Surface,
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp } from '../types/navigation';
import { OrderStatus } from '../types';

interface RouteParams {
  order: any;
  fromMyOrders?: boolean;
}

const OrderDetailsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { order, fromMyOrders = false } = route.params as RouteParams;
  const { updateOrderStatus, acceptOrder } = useOrders();
  const { deliveryPartner } = useAuth();
  const theme = useTheme();
  const [updating, setUpdating] = useState(false);
  const [accepting, setAccepting] = useState(false);

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
      await updateOrderStatus(order.id, newStatus as OrderStatus);
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAcceptOrder = async () => {
    Alert.alert(
      'Accept Order',
      `Do you want to accept order ${order.slug}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setAccepting(true);
            try {
              await acceptOrder(order.id, deliveryPartner);
              Alert.alert('Success', 'Order accepted successfully!');
              // Navigate back to orders list to see updated status
              navigation.goBack();
            } catch (error: any) {
              console.error('Accept order error in UI:', error);
              const errorMessage = error.message || 'Failed to accept order';
              Alert.alert('Error', errorMessage);
            } finally {
              setAccepting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return '#F59E0B';
      case 'PICKED_UP':
        return '#8B5CF6';
      case 'IN_TRANSIT':
        return '#EF4444';
      case 'DELIVERED':
        return '#10B981';
      case 'DECLINED':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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

  const getOrderStatus = (order: any) => {
    // If coming from MyOrders screen, always show "Assigned to You" since these are your orders
    if (fromMyOrders) {
      return {
        status: 'ASSIGNED',
        text: 'Assigned to You',
        color: '#F59E0B'
      };
    }
    
    // If delivery_partner is not null and equals current user ID, order is accepted by this delivery partner
    if (order.delivery_partner && deliveryPartner && order.delivery_partner.id === deliveryPartner.id) {
      return {
        status: 'ASSIGNED',
        text: 'Assigned to You',
        color: '#F59E0B'
      };
    }
    
    // If delivery_partner is not null but different user, order is assigned to someone else
    if (order.delivery_partner && order.delivery_partner.id !== deliveryPartner?.id) {
      return {
        status: 'ASSIGNED_OTHER',
        text: 'Assigned to Other',
        color: '#9CA3AF'
      };
    }
    
    // If no delivery_partner, show admin status
    return {
      status: order.status,
      text: getStatusText(order.status),
      color: getStatusColor(order.status)
    };
  };

  const nextStatusMap: Record<string, string | null> = {
    ASSIGNED: 'PICKED_UP',
    PICKED_UP: 'IN_TRANSIT',
    IN_TRANSIT: 'DELIVERED',
    DELIVERED: null,
    DECLINED: null,
  };

  const orderStatus = getOrderStatus(order);
  const nextStatus = nextStatusMap[orderStatus.status] ?? null;

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Surface style={styles.card} elevation={2}>
          <View style={styles.header}>
            <View style={styles.orderNumberContainer}>
              <Icon name="receipt" size={24} color="#2563EB" />
              <Title style={styles.orderNumber}>{order.slug}</Title>
            </View>
            <Chip
              mode="outlined"
              textStyle={{ color: orderStatus.color, fontWeight: '600' }}
              style={[styles.statusChip, { borderColor: orderStatus.color, backgroundColor: `${orderStatus.color}10` }]}
            >
              {orderStatus.text}
            </Chip>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="person" size={20} color="#2563EB" />
              <Text style={styles.sectionTitle}>Customer Information</Text>
            </View>
            <View style={styles.customerInfo}>
              <View style={styles.infoRow}>
                <Icon name="person" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{order.consumerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{order.consumerPhone}</Text>
                <Button
                  mode="text"
                  compact
                  onPress={handleCallCustomer}
                  style={styles.callButton}
                  labelStyle={styles.callButtonLabel}
                >
                  Call
                </Button>
              </View>
              {order.consumerEmail && (
                <View style={styles.infoRow}>
                  <Icon name="email" size={20} color="#6B7280" />
                  <Text style={styles.infoText}>{order.consumerEmail}</Text>
                </View>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Show delivery partner info if assigned or coming from MyOrders */}
          {(order.delivery_partner || fromMyOrders) && (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Icon name="local-shipping" size={20} color="#10B981" />
                  <Text style={styles.sectionTitle}>Delivery Partner</Text>
                </View>
                <View style={styles.deliveryPartnerCard}>
                  <Icon name="local-shipping" size={20} color="#10B981" />
                  <View style={styles.deliveryPartnerContent}>
                    <Text style={styles.deliveryPartnerName}>
                      {order.delivery_partner?.name || deliveryPartner?.name || 'You'}
                    </Text>
                    <Text style={styles.deliveryPartnerPhone}>
                      {order.delivery_partner?.phone || deliveryPartner?.phone || 'N/A'}
                    </Text>
                    {(order.delivery_partner?.id === deliveryPartner?.id || fromMyOrders) && (
                      <Chip mode="outlined" style={styles.assignedChip} textStyle={{ color: '#10B981' }}>
                        Assigned to You
                      </Chip>
                    )}
                  </View>
                </View>
              </View>
              <Divider style={styles.divider} />
            </>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="location-on" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <View style={styles.addressCard}>
              <Icon name="location-on" size={20} color="#EF4444" />
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
            <View style={styles.sectionHeader}>
              <Icon name="inventory" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Order Items</Text>
            </View>
            {order.order_products?.map((item: any, index: number) => (
              <View key={item.id} style={[styles.itemRow, index > 0 && styles.itemRowBorder]}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
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
            <View style={styles.sectionHeader}>
              <Icon name="info" size={20} color="#6B7280" />
              <Text style={styles.sectionTitle}>Order Details</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Order Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(order.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {order.delivery_partner && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Assigned Date:</Text>
                <Text style={styles.detailValue}>
                  {new Date(order.updatedAt).toLocaleDateString()}
                </Text>
              </View>
            )}
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

          {/* Show action buttons only for orders assigned to current user */}
          {((order.delivery_partner && deliveryPartner && order.delivery_partner.id === deliveryPartner.id) || fromMyOrders) && nextStatus && (
            <View style={styles.actionSection}>
              <Button
                mode="contained"
                onPress={() => handleUpdateStatus(nextStatus)}
                loading={updating}
                disabled={updating}
                style={styles.updateButton}
                contentStyle={styles.updateButtonContent}
                labelStyle={styles.updateButtonLabel}
                icon={updating ? undefined : 'check-circle'}
              >
                Mark as {getStatusText(nextStatus)}
              </Button>
            </View>
          )}

          {/* Show accept button if order is not assigned to anyone AND not coming from MyOrders */}
          {!order.delivery_partner && !fromMyOrders && (
            <View style={styles.actionSection}>
              <Button
                mode="contained"
                onPress={handleAcceptOrder}
                loading={accepting}
                disabled={accepting}
                style={styles.acceptButton}
                contentStyle={styles.acceptButtonContent}
                labelStyle={styles.acceptButtonLabel}
                icon={accepting ? undefined : 'check'}
              >
                Accept Order
              </Button>
            </View>
          )}

          {/* Show message if order is assigned to someone else */}
          {order.delivery_partner && deliveryPartner && order.delivery_partner.id !== deliveryPartner.id && (
            <View style={styles.actionSection}>
              <Text style={styles.infoMessage}>
                This order is assigned to another delivery partner
              </Text>
            </View>
          )}
        </Surface>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusChip: {
    height: 32,
    borderRadius: 16,
  },
  divider: {
    marginVertical: 20,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  customerInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  callButton: {
    marginLeft: 16,
  },
  callButtonLabel: {
    color: '#2563EB',
    fontWeight: '600',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  addressContent: {
    marginLeft: 8,
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  instructions: {
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 4,
    color: '#6B7280',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemRowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  itemDetails: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemDivider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  actionSection: {
    marginTop: 24,
    alignItems: 'center',
  },
  updateButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  updateButtonContent: {
    paddingVertical: 12,
  },
  updateButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deliveryPartnerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  deliveryPartnerContent: {
    marginLeft: 8,
    flex: 1,
  },
  deliveryPartnerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  deliveryPartnerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  assignedChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderColor: '#10B981',
  },
  infoMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  acceptButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  acceptButtonContent: {
    paddingVertical: 12,
  },
  acceptButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrderDetailsScreen;

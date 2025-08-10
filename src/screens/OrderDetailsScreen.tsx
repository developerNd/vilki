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
  TextInput,
  Modal,
  Portal,
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
  const { updateOrderStatus, acceptOrder, fetchMyOrders } = useOrders();
  const { deliveryPartner } = useAuth();
  const theme = useTheme();
  const [updating, setUpdating] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);


  const handleCallCustomer = () => {
    const phoneNumber = order.customerPhone || order.consumerPhone;
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber}`);
    } else {
      Alert.alert('Phone number not available');
    }
  };

  const handleGetDirections = () => {
    const deliveryAddress = order.deliveryAddress || order.address;
    if (deliveryAddress) {
      const address = encodeURIComponent(
        `${deliveryAddress.address || deliveryAddress.addressLine1}, ${deliveryAddress.city || ''}, ${deliveryAddress.state || ''} ${deliveryAddress.pincode || ''}`
      );
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open directions');
      });
    } else {
      Alert.alert('Error', 'Delivery address not available');
    }
  };

  const handleGetPickupDirections = () => {
    const pickupAddress = order.pickupAddress || order.seller?.seller_info?.address;
    if (pickupAddress) {
      const address = encodeURIComponent(
        `${pickupAddress.address || pickupAddress}, ${pickupAddress.city || ''}, ${pickupAddress.state || ''} ${pickupAddress.pincode || ''}`
      );
      const url = `https://www.google.com/maps/dir/?api=1&destination=${address}`;
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Unable to open directions');
      });
    } else {
      Alert.alert('Error', 'Pickup address not available');
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    // If delivering direct order, show verification modal
    if ((newStatus === 'DELIVERED' || newStatus === 'delivered') && order.orderType === 'direct') {
      setShowVerificationModal(true);
      return;
    }

    setUpdating(true);
    try {
      await updateOrderStatus(order.id, newStatus as OrderStatus, order.orderType);
      
      // Immediately update the order status to hide the button
      order.status = newStatus;
      
      Alert.alert('Success', `Order status updated to ${newStatus}`);
      // Refresh orders after successful update
      setTimeout(() => {
        fetchMyOrders();
      }, 500);
    } catch (error: any) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyAndDeliver = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    // Get the last 6 digits of the order ID
    const orderId = order.orderNumber || order.slug || order.orderId;
    const orderIdStr = orderId.toString();
    const last6Digits = orderIdStr.length >= 6 ? orderIdStr.slice(-6) : orderIdStr;
    
    if (verificationCode.trim() !== last6Digits) {
      Alert.alert('Error', 'Invalid verification code. Please check the last 6 digits of the order ID.');
      setVerificationCode('');
      return;
    }

    setVerifying(true);
    try {
      await updateOrderStatus(order.id, 'DELIVERED' as OrderStatus, order.orderType);
      
      // Immediately update the order status to hide the button
      order.status = 'DELIVERED';
      
      Alert.alert('Success', 'Order delivered successfully!');
      setVerificationCode('');
      setShowVerificationModal(false);
      // Refresh orders after successful update
      setTimeout(() => {
        fetchMyOrders();
      }, 500);
    } catch (error: any) {
      console.error('Error delivering order:', error);
      Alert.alert('Error', error.message || 'Failed to deliver order');
    } finally {
      setVerifying(false);
    }
  };

  const handleCancelVerification = () => {
    setShowVerificationModal(false);
    setVerificationCode('');
  };

  const handleAcceptOrder = async () => {
    Alert.alert(
      'Accept Order',
      `Do you want to accept this ${order.orderType === 'direct' ? 'direct order' : `order ${order.orderNumber || order.slug}`}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setAccepting(true);
            try {
              await acceptOrder(order.id, deliveryPartner, order.orderType);
              Alert.alert('Success', 'Order accepted successfully!');
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
    if (fromMyOrders) {
      return {
        status: 'ASSIGNED',
        text: 'Assigned to You',
        color: '#F59E0B'
      };
    }
    
    if (order.delivery_partner && deliveryPartner && order.delivery_partner.id === deliveryPartner.id) {
      return {
        status: 'ASSIGNED',
        text: 'Assigned to You',
        color: '#F59E0B'
      };
    }
    
    if (order.delivery_partner && order.delivery_partner.id !== deliveryPartner?.id) {
      return {
        status: 'ASSIGNED_OTHER',
        text: 'Assigned to Other',
        color: '#9CA3AF'
      };
    }
    
    return {
      status: order.status,
      text: getStatusText(order.status),
      color: getStatusColor(order.status)
    };
  };

  const nextStatusMap: Record<string, string | null> = {
    ASSIGNED: 'PICKED_UP',
    assigned: 'PICKED_UP', // Handle lowercase
    ACCEPTED: 'PICKED_UP', // Handle uppercase accepted
    accepted: 'PICKED_UP', // Handle lowercase accepted
    PICKED_UP: 'DELIVERED',
    picked: 'DELIVERED', // Handle lowercase status
    PICKED: 'DELIVERED', // Handle uppercase without _UP
    IN_TRANSIT: 'DELIVERED',
    in_transit: 'DELIVERED', // Handle lowercase
    DELIVERED: null,
    delivered: null, // Handle lowercase
    DECLINED: null,
    declined: null, // Handle lowercase
  };

  const orderStatus = getOrderStatus(order);
  // Use actual order status for determining next status, not the calculated status
  const actualOrderStatus = order.status || 'ASSIGNED';
  const nextStatus = nextStatusMap[actualOrderStatus] ?? null;
  


  // Format pickup address (assuming it comes from seller-infos address field)
  const pickupAddress = order.pickupAddress
    ? {
        addressLine1: order.pickupAddress.addressLine1 || order.pickupAddress.address || 'N/A',
        city: order.pickupAddress.city || '',
        state: order.pickupAddress.state || '',
        pincode: order.pickupAddress.pincode || '',
        addressLine2: order.pickupAddress.addressLine2 || ''
      }
    : { addressLine1: 'N/A', city: '', state: '', pincode: '', addressLine2: '' };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Surface style={styles.card} elevation={2}>
          <View style={styles.header}>
            <View style={styles.orderNumberContainer}>
              <Icon name="receipt" size={24} color="#2563EB" />
              <Title style={styles.orderNumber}>
              {order.orderType === 'direct' ? 'Direct Order' : `Order #${order.orderNumber || order.slug}`}
            </Title>
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
                <Text style={styles.infoText}>{order.customerName || order.consumerName}</Text>
              </View>
              <View style={styles.infoRow}>
                <Icon name="phone" size={20} color="#6B7280" />
                <Text style={styles.infoText}>{order.customerPhone || order.consumerPhone}</Text>
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
              <Icon name="store" size={20} color="#F59E0B" />
              <Text style={styles.sectionTitle}>Pickup Address</Text>
            </View>
            <View style={styles.addressCard}>
              <Icon name="store" size={20} color="#F59E0B" />
              <View style={styles.addressContent}>
                {/* Seller Information for Stockist Orders */}
                {order.orderType === 'stockist' && order.seller && (
                  <View style={styles.sellerInfoContainer}>
                    <Text style={styles.sellerName}>{order.seller.name}</Text>
                    {order.seller.seller_info?.business_name && (
                      <Text style={styles.sellerBusiness}>{order.seller.seller_info.business_name}</Text>
                    )}
                    {order.seller.phone && (
                      <Text style={styles.sellerPhone}>{order.seller.phone}</Text>
                    )}
                  </View>
                )}
                
                <Text style={styles.addressText}>
                  {order.pickupAddress?.address || pickupAddress.addressLine1 || 'N/A'}
                </Text>
                <Text style={styles.addressText}>
                  {order.pickupAddress?.city || pickupAddress.city}, {order.pickupAddress?.state || pickupAddress.state}, {order.pickupAddress?.pincode || pickupAddress.pincode}
                </Text>
                {order.pickupAddress?.instructions || pickupAddress.addressLine2 ? (
                  <Text style={styles.instructions}>
                    {order.pickupAddress?.instructions || pickupAddress.addressLine2}
                  </Text>
                ) : null}
                
                <Button
                  mode="contained"
                  onPress={() => handleGetPickupDirections()}
                  style={styles.getDirectionsButton}
                  contentStyle={styles.getDirectionsButtonContent}
                  labelStyle={styles.getDirectionsButtonLabel}
                  icon="directions"
                >
                  Get Directions
                </Button>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="location-on" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Delivery Address</Text>
            </View>
            <View style={styles.addressCard}>
              <Icon name="location-on" size={20} color="#EF4444" />
              <View style={styles.addressContent}>
                <Text style={styles.addressText}>
                  {(order.deliveryAddress?.address || order.address?.addressLine1) ?? 'N/A'}
                </Text>
                <Text style={styles.addressText}>
                  {order.deliveryAddress?.city || order.address?.city}, {order.deliveryAddress?.state || order.address?.state}, {order.deliveryAddress?.pincode || order.address?.pincode}
                </Text>
                {order.deliveryAddress?.addressLine2 || order.address?.addressLine2 ? (
                  <Text style={styles.instructions}>
                    {order.deliveryAddress?.addressLine2 || order.address?.addressLine2}
                  </Text>
                ) : null}
                <Button
                  mode="contained"
                  onPress={handleGetDirections}
                  style={styles.getDirectionsButton}
                  contentStyle={styles.getDirectionsButtonContent}
                  labelStyle={styles.getDirectionsButtonLabel}
                  icon="directions"
                >
                  Get Directions
                </Button>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="inventory" size={20} color="#8B5CF6" />
              <Text style={styles.sectionTitle}>Order Items</Text>
            </View>
            {(order.items || order.order_products)?.map((item: any, index: number) => (
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
              <Text style={styles.totalAmount}>₹{order.totalAmount || order.total_amount}</Text>
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



          {(fromMyOrders || (order.delivery_partner && deliveryPartner && order.delivery_partner.id === deliveryPartner.id)) && nextStatus && (
            <View style={styles.actionSection}>
              {(nextStatus === 'PICKED_UP' || nextStatus === 'picked' || nextStatus === 'PICKED') && (
                <Button
                  mode="contained"
                  onPress={() => handleUpdateStatus(nextStatus)}
                  loading={updating}
                  disabled={updating}
                  style={styles.pickupButton}
                  contentStyle={styles.updateButtonContent}
                  labelStyle={styles.updateButtonLabel}
                  icon={updating ? undefined : 'package-variant'}
                >
                  Mark as Picked Up
                </Button>
              )}
              {(nextStatus === 'DELIVERED' || nextStatus === 'delivered') && (
                <Button
                  mode="contained"
                  onPress={() => handleUpdateStatus(nextStatus)}
                  loading={updating}
                  disabled={updating}
                  style={styles.deliverButton}
                  contentStyle={styles.updateButtonContent}
                  labelStyle={styles.updateButtonLabel}
                  icon={updating ? undefined : 'truck-delivery'}
                >
                  Mark as Delivered
                </Button>
              )}
              {nextStatus !== 'PICKED_UP' && nextStatus !== 'picked' && nextStatus !== 'PICKED' && nextStatus !== 'DELIVERED' && nextStatus !== 'delivered' && (
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
              )}
            </View>
          )}



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

          {order.delivery_partner && deliveryPartner && order.delivery_partner.id !== deliveryPartner.id && (
            <View style={styles.actionSection}>
              <Text style={styles.infoMessage}>
                This order is assigned to another delivery partner
              </Text>
            </View>
          )}
        </Surface>
      </ScrollView>

      {/* Verification Modal */}
      <Portal>
        <Modal
          visible={showVerificationModal}
          onDismiss={handleCancelVerification}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Icon name="verified" size={32} color="#10B981" />
              <Title style={styles.modalTitle}>Delivery Verification</Title>
            </View>
            
                          <Text style={styles.modalSubtitle}>
                Ask the customer for the last 6 digits of their order ID to verify delivery:
              </Text>
              
              <View style={styles.verificationCodeDisplay}>
                <Text style={styles.verificationCodeLabel}>Order ID:</Text>
                <Text style={styles.verificationCodeText}>
                  {(order.orderNumber || order.slug || order.orderId).toString().length >= 6 
                    ? (order.orderNumber || order.slug || order.orderId).toString().slice(0, -6) + '******'
                    : '******'}
                </Text>
                <Text style={styles.verificationCodeHint}>
                  Ask the customer to provide the last 6 digits of their order ID
                </Text>
              </View>

            <TextInput
              mode="outlined"
              label="Verification Code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
              style={styles.verificationInput}
              placeholder="Enter last 6 digits"
              autoFocus
            />

            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={handleCancelVerification}
                style={styles.cancelButton}
                contentStyle={styles.modalButtonContent}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleVerifyAndDeliver}
                loading={verifying}
                disabled={verifying || !verificationCode.trim()}
                style={styles.verifyButton}
                contentStyle={styles.modalButtonContent}
                labelStyle={styles.verifyButtonLabel}
                icon={verifying ? undefined : 'check-circle'}
              >
                Verify & Deliver
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
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
  getDirectionsButton: {
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignSelf: 'flex-start',
  },
  getDirectionsButtonContent: {
    paddingVertical: 8,
  },
  getDirectionsButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
  pickupButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#F59E0B',
  },
  deliverButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  verificationCodeDisplay: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  verificationCodeLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  verificationCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  verificationCodeHint: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  verificationInput: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    borderColor: '#6B7280',
  },
  verifyButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  modalButtonContent: {
    paddingVertical: 12,
  },
  cancelButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  verifyButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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

  sellerCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    elevation: 1,
  },
  sellerContent: {
    marginLeft: 8,
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  sellerBusiness: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sellerPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sellerAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  sellerInfoContainer: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
});

export default OrderDetailsScreen;
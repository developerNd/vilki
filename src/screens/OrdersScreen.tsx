import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  useTheme,
  ActivityIndicator,
  Surface,
  SegmentedButtons,
} from 'react-native-paper';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';

type OrderType = 'stockist' | 'direct';

const OrdersScreen: React.FC = () => {
  const { orders, loading, fetchOrders, acceptOrder } = useOrders();
  const { deliveryPartner } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [activeOrderType, setActiveOrderType] = useState<OrderType>('stockist');

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = (order: any) => {
    Alert.alert(
      'Accept Order',
      `Do you want to accept order ${order.slug}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            await acceptOrder(order.id, deliveryPartner);
            Alert.alert('Success', 'Order accepted successfully!');
          },
        },
      ]
    );
  };

  const handleViewOrder = (order: any) => {
    navigation.navigate('OrderDetails', { order, fromMyOrders: false });
  };

  const getOrderStatus = (order: any) => {
    // If delivery_partner is not null and equals current user ID, order is accepted by this delivery partner
    if (order.delivery_partner && deliveryPartner && order.delivery_partner.id === deliveryPartner.id) {
      return {
        status: 'ASSIGNED',
        text: 'Assigned to You',
        color: '#2563EB'
      };
    }

    // If delivery_partner is not null but different user, order is assigned to someone else
    if (order.delivery_partner && order.delivery_partner.id !== deliveryPartner?.id) {
      return {
        status: 'ASSIGNED_OTHER',
        text: 'Assigned to Other',
        color: '#FF4757'
      };
    }

    // If no delivery_partner, show as available for acceptance
    return {
      status: 'AVAILABLE',
      text: 'Available',
      color: '#00D4AA'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return '#2563EB'; // Bright blue
      case 'ASSIGNED_OTHER':
        return '#FF4757'; // Bright red
      case 'AVAILABLE':
        return '#00D4AA'; // Bright teal
      default:
        return '#FFD93D'; // Bright yellow
    }
  };

  // Filter orders based on active tab
  const getFilteredOrders = () => {
    if (activeOrderType === 'stockist') {
      // Show stockist orders (current orders that are from wholesalers/stockists)
      return orders.filter(order => order.orderType === 'stockist' || !order.orderType);
    } else {
      // Show direct orders (orders from retailers directly)
      return orders.filter(order => order.orderType === 'direct');
    }
  };

  const filteredOrders = getFilteredOrders();

  const renderOrderItem = ({ item }: { item: any }) => {
    const orderStatus = getOrderStatus(item);

    return (
      <Surface style={styles.orderCard} elevation={3}>
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberContainer}>
            <Icon name="receipt" size={24} color="#2563EB" />
            <Title style={styles.orderNumber}>{item.slug}</Title>
          </View>
          <View style={styles.orderTypeContainer}>
            <Chip
              mode="outlined"
              textStyle={{ color: orderStatus.color, fontWeight: '700', fontSize: 12 }}
              style={[styles.statusChip, { borderColor: orderStatus.color, backgroundColor: `${orderStatus.color}20` }]}
            >
              {orderStatus.text}
            </Chip>
            <Chip
              mode="outlined"
              textStyle={{ 
                color: activeOrderType === 'stockist' ? '#2563EB' : '#00D4AA', 
                fontWeight: '700',
                fontSize: 11
              }}
              style={[styles.typeChip, { 
                borderColor: activeOrderType === 'stockist' ? '#2563EB' : '#00D4AA', 
                backgroundColor: activeOrderType === 'stockist' ? '#2563EB20' : '#00D4AA20' 
              }]}
            >
              {activeOrderType === 'stockist' ? 'Stockist' : 'Direct'}
            </Chip>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Icon name="person" size={18} color="#2563EB" />
          <Text style={styles.customerText}>{item.consumerName}</Text>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressRow}>
            <Icon name="location-on" size={18} color="#FF4757" />
            <Text style={styles.addressLabel}>Address:</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {item.address?.addressLine1 ?? 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="inventory" size={16} color="#2563EB" />
              <Text style={styles.detailLabel}>Items:</Text>
              <Text style={styles.detailValue}>
                {(item.order_products?.length ?? 0)} items
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="payments" size={16} color="#00D4AA" />
              <Text style={styles.detailLabel}>Amount:</Text>
              <Text style={styles.detailValue}>₹{item.total_amount}</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              console.log('View Details pressed for order:', item.slug);
              handleViewOrder(item);
            }}
            style={styles.viewButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="eye"
          >
            View Details
          </Button>
          {/* Show Accept button only if order is not assigned to anyone */}
          {!item.delivery_partner && (
            <Button
              mode="contained"
              onPress={() => handleAcceptOrder(item)}
              style={styles.acceptButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.acceptButtonLabel}
              icon="check"
            >
              Accept Order
            </Button>
          )}
        </View>
      </Surface>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>Good morning,</Text>
                <Text style={styles.userName}>{deliveryPartner?.name}</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Ready to deliver? Here are your available orders
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="local-shipping" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{filteredOrders.length}</Text>
                  <Text style={styles.statLabel}>Available</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Order Type Selector */}
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeOrderType}
          onValueChange={setActiveOrderType as (value: string) => void}
          buttons={[
            {
              value: 'stockist',
              label: 'Stockist Orders',
              icon: 'store',
              checkedColor: '#FFFFFF',
              uncheckedColor: '#2563EB',
            },
            {
              value: 'direct',
              label: 'Direct Orders',
              icon: 'cart',
              checkedColor: '#FFFFFF',
              uncheckedColor: '#00D4AA',
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={filteredOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="local-shipping" size={80} color="#2563EB" />
            <Text style={styles.emptyText}>
              No {activeOrderType === 'stockist' ? 'stockist' : 'direct'} orders available
            </Text>
            <Text style={styles.emptySubtext}>
              Pull to refresh for new orders
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 50,
    paddingBottom: 0,
  },
  headerBackground: {
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  welcomeSection: {
    flex: 1,
    marginRight: 16,
  },
  greetingContainer: {
    marginBottom: 8,
  },
  greetingText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 22,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minWidth: 90,
  },
  statIconContainer: {
    marginBottom: 10,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  segmentedButtons: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
  },
  listContainer: {
    padding: 20,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderWidth: 1,
    borderColor: '#2563EB10',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  orderNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 10,
  },
  orderTypeContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    height: 36,
    borderRadius: 18,
    marginBottom: 6,
    borderWidth: 2,
  },
  typeChip: {
    height: 35,
    borderRadius: 14,
    borderWidth: 2,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  addressContainer: {
    marginBottom: 20,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 10,
    marginRight: 10,
    minWidth: 70,
    fontWeight: '600',
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontWeight: '500',
  },
  orderDetails: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    marginRight: 6,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 10,
    borderRadius: 16,
    borderColor: '#2563EB',
    borderWidth: 2,
  },
  acceptButton: {
    flex: 1,
    marginLeft: 10,
    borderRadius: 16,
    backgroundColor: '#00D4AA',
  },
  buttonContent: {
    paddingVertical: 12,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563EB',
  },
  acceptButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#2563EB',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    color: '#2563EB',
    marginTop: 20,
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default OrdersScreen;

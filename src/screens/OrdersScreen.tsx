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
} from 'react-native-paper';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';

const OrdersScreen: React.FC = () => {
  const { orders, loading, fetchOrders, acceptOrder } = useOrders();
  const { deliveryPartner } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

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

    // If no delivery_partner, show as available for acceptance
    return {
      status: 'AVAILABLE',
      text: 'Available',
      color: '#10B981'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return '#F59E0B';
      case 'ASSIGNED_OTHER':
        return '#9CA3AF';
      case 'AVAILABLE':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const orderStatus = getOrderStatus(item);

    return (
      <Surface style={styles.orderCard} elevation={2}>
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberContainer}>
            <Icon name="receipt" size={20} color="#2563EB" />
            <Title style={styles.orderNumber}>{item.slug}</Title>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: orderStatus.color, fontWeight: '600' }}
            style={[styles.statusChip, { borderColor: orderStatus.color, backgroundColor: `${orderStatus.color}10` }]}
          >
            {orderStatus.text}
          </Chip>
        </View>

        <View style={styles.customerInfo}>
          <Icon name="person" size={16} color="#6B7280" />
          <Text style={styles.customerText}>{item.consumerName}</Text>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressRow}>
            <Icon name="location-on" size={16} color="#EF4444" />
            <Text style={styles.addressLabel}>Address:</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {item.address?.addressLine1 ?? 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Icon name="inventory" size={14} color="#6B7280" />
              <Text style={styles.detailLabel}>Items:</Text>
              <Text style={styles.detailValue}>
                {(item.order_products?.length ?? 0)} items
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Icon name="payments" size={14} color="#6B7280" />
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
                  <Icon name="local-shipping" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{orders.length}</Text>
                  <Text style={styles.statLabel}>Available</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={orders}
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
            <Icon name="local-shipping" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders available</Text>
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
    backgroundColor: '#4367b6ff',
    paddingTop: 50,
    paddingBottom: 0,
  },
  headerBackground: {
    backgroundColor: '#4367b6ff',
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
    fontSize: 16,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#DBEAFE',
    fontWeight: '500',
    lineHeight: 20,
  },
  statsContainer: {
    alignItems: 'flex-end',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 80,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  listContainer: {
    padding: 20,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  orderHeader: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusChip: {
    height: 32,
    borderRadius: 16,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
    fontWeight: '500',
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  orderDetails: {
    marginBottom: 20,
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
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    marginRight: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    color: '#1F2937',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
    borderColor: '#E5E7EB',
  },
  acceptButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#10B981',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  acceptButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default OrdersScreen;

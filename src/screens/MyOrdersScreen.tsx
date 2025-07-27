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
import { OrderStatus } from '../types';

const MyOrdersScreen: React.FC = () => {
  const { myOrders, loading, fetchMyOrders, updateOrderStatus } = useOrders();
  const { deliveryPartner } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyOrders();
    setRefreshing(false);
  };

  const handleViewOrder = (order: any) => {
    navigation.navigate('OrderDetails', { order, fromMyOrders: true });
  };

  const handleUpdateStatus = async (order: any, newStatus: string) => {
    Alert.alert(
      'Update Status',
      `Do you want to mark order ${order.slug} as ${getStatusText(newStatus)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            await updateOrderStatus(order.id, newStatus as OrderStatus);
            Alert.alert('Success', `Order status updated to ${getStatusText(newStatus)}`);
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

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'ASSIGNED': 'PICKED_UP',
      'PICKED_UP': 'IN_TRANSIT',
      'IN_TRANSIT': 'DELIVERED',
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const nextStatus = getNextStatus(item.status);
    
    return (
      <Surface style={styles.orderCard} elevation={2}>
        <View style={styles.orderHeader}>
          <View style={styles.orderNumberContainer}>
            <Icon name="receipt" size={20} color="#2563EB" />
            <Title style={styles.orderNumber}>{item.slug}</Title>
          </View>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status), fontWeight: '600' }}
            style={[styles.statusChip, { borderColor: getStatusColor(item.status), backgroundColor: `${getStatusColor(item.status)}10` }]}
          >
            {getStatusText(item.status)}
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
          {item.acceptedAt && (
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Icon name="schedule" size={14} color="#6B7280" />
                <Text style={styles.detailLabel}>Accepted:</Text>
                <Text style={styles.detailValue}>
                  {new Date(item.acceptedAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handleViewOrder(item)}
            style={styles.viewButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
            icon="eye"
          >
            View Details
          </Button>
          {nextStatus && (
            <Button
              mode="contained"
              onPress={() => handleUpdateStatus(item, nextStatus)}
              style={styles.updateButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.updateButtonLabel}
              icon="check-circle"
            >
              Mark as {getStatusText(nextStatus)}
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
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#10B981" barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>Your Orders</Text>
                <Text style={styles.userName}>{deliveryPartner?.name}</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Manage and track your assigned deliveries
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="assignment" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{myOrders.length}</Text>
                  <Text style={styles.statLabel}>Active</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <FlatList
        data={myOrders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="assignment" size={80} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders assigned</Text>
            <Text style={styles.emptySubtext}>
              You don't have any active orders yet
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
    backgroundColor: '#10B981',
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerBackground: {
    backgroundColor: '#10B981',
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
    color: '#D1FAE5',
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
    color: '#D1FAE5',
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
    color: '#D1FAE5',
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
    marginBottom: 8,
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
  updateButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  updateButtonLabel: {
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

export default MyOrdersScreen; 
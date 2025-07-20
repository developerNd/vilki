import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
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

  const handleAcceptOrder = (order: Order) => {
    Alert.alert(
      'Accept Order',
      `Do you want to accept order ${order.orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            await acceptOrder(order.id);
            Alert.alert('Success', 'Order accepted successfully!');
          },
        },
      ]
    );
  };

  const handleViewOrder = (order: Order) => {
    navigation.navigate('OrderDetails', { order });
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

  const renderOrderItem = ({ item }: { item: Order }) => (
    <Card style={styles.orderCard} mode="outlined">
      <Card.Content>
        <View style={styles.orderHeader}>
          <Title style={styles.orderNumber}>{item.orderNumber}</Title>
          <Chip
            mode="outlined"
            textStyle={{ color: getStatusColor(item.status) }}
            style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <View style={styles.customerInfo}>
          <Icon name="person" size={16} color="#666" />
          <Text style={styles.customerText}>{item.customerName}</Text>
        </View>

        <View style={styles.addressContainer}>
          <View style={styles.addressRow}>
            <Icon name="location-on" size={16} color="#FF5722" />
            <Text style={styles.addressLabel}>Pickup:</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {item.pickupAddress.address}
            </Text>
          </View>
          <View style={styles.addressRow}>
            <Icon name="location-on" size={16} color="#4CAF50" />
            <Text style={styles.addressLabel}>Delivery:</Text>
            <Text style={styles.addressText} numberOfLines={2}>
              {item.deliveryAddress.address}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Items:</Text>
            <Text style={styles.detailValue}>{item.items.length} items</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>₹{item.totalAmount}</Text>
          </View>
          {item.distance && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Distance:</Text>
              <Text style={styles.detailValue}>{item.distance} km</Text>
            </View>
          )}
          {item.estimatedTime && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>ETA:</Text>
              <Text style={styles.detailValue}>{item.estimatedTime} min</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => handleViewOrder(item)}
            style={styles.viewButton}
          >
            View Details
          </Button>
          {item.status === OrderStatus.ACCEPTED && (
            <Button
              mode="contained"
              onPress={() => handleAcceptOrder(item)}
              style={styles.acceptButton}
            >
              Accept Order
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Orders</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {deliveryPartner?.name}
        </Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="local-shipping" size={64} color="#ccc" />
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  listContainer: {
    padding: 16,
  },
  orderCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusChip: {
    height: 28,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  addressContainer: {
    marginBottom: 16,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 60,
  },
  addressText: {
    flex: 1,
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
  },
  acceptButton: {
    flex: 1,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});

export default OrdersScreen; 
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

const MapScreen: React.FC = () => {
  const { orders } = useOrders();
  const { deliveryPartner } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // Mock map component - in a real app, you would use react-native-maps
  const MapView = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Icon name="map" size={64} color="#ccc" />
        <Text style={styles.mapPlaceholderText}>Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          In a real app, this would show your location and nearby orders
        </Text>
      </View>
      
      {/* Mock location marker */}
      <View style={styles.locationMarker}>
        <Icon name="my-location" size={24} color="#2196F3" />
      </View>
      
      {/* Mock order markers */}
      {orders.slice(0, 3).map((order, index) => (
        <View
          key={order.id}
          style={[
            styles.orderMarker,
            {
              left: 50 + (index * 80),
              top: 100 + (index * 60),
            }
          ]}
        >
          <Icon name="local-shipping" size={20} color="#FF5722" />
        </View>
      ))}
    </View>
  );

  const getNearbyOrders = () => {
    return orders.filter(order => order.distance && order.distance <= 5);
  };

  const nearbyOrders = getNearbyOrders();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Map</Text>
        <Text style={styles.headerSubtitle}>
          Your location and nearby orders
        </Text>
      </View>

      <MapView />

      <Card style={styles.nearbyCard} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>Nearby Orders</Title>
          {nearbyOrders.length > 0 ? (
            nearbyOrders.map((order) => (
              <View key={order.id} style={styles.nearbyOrder}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                  <Text style={styles.orderDistance}>{order.distance} km away</Text>
                </View>
                <View style={styles.orderActions}>
                  <Button
                    mode="outlined"
                    compact
                    onPress={() => {
                      // Navigate to order details
                    }}
                    icon="eye"
                  >
                    View
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noOrders}>
              <Icon name="local-shipping" size={48} color="#ccc" />
              <Text style={styles.noOrdersText}>No nearby orders</Text>
              <Text style={styles.noOrdersSubtext}>
                Orders within 5km will appear here
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.statsCard} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>Today's Stats</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Icon name="local-shipping" size={24} color="#2196F3" />
              <Text style={styles.statLabel}>Orders</Text>
              <Text style={styles.statValue}>{orders.length}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.statLabel}>Delivered</Text>
              <Text style={styles.statValue}>
                {orders.filter(o => o.status === 'delivered').length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="trending-up" size={24} color="#FF9800" />
              <Text style={styles.statLabel}>In Progress</Text>
              <Text style={styles.statValue}>
                {orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Icon name="account-balance-wallet" size={24} color="#9C27B0" />
              <Text style={styles.statLabel}>Earnings</Text>
              <Text style={styles.statValue}>
                ₹{orders.reduce((sum, order) => sum + (order.totalAmount * 0.1), 0).toFixed(0)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>
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
  mapContainer: {
    height: height * 0.4,
    backgroundColor: '#f0f0f0',
    position: 'relative',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  mapPlaceholderSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  locationMarker: {
    position: 'absolute',
    left: 20,
    top: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  orderMarker: {
    position: 'absolute',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nearbyCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  nearbyOrder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  orderDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  orderActions: {
    marginLeft: 16,
  },
  noOrders: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  noOrdersSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  statsCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MapScreen; 
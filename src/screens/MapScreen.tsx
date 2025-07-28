import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  useTheme,
  ActivityIndicator,
  Surface,
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
        <Icon name="map" size={80} color="#D1D5DB" />
        <Text style={styles.mapPlaceholderText}>Live Map View</Text>
        <Text style={styles.mapPlaceholderSubtext}>
          Your location and nearby delivery orders
        </Text>
      </View>

      {/* Mock location marker */}
      <View style={styles.locationMarker}>
        <Icon name="my-location" size={24} color="#2563EB" />
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
          <Icon name="local-shipping" size={20} color="#EF4444" />
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
      <StatusBar backgroundColor="#8B5CF6" barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerContent}>
            <View style={styles.welcomeSection}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>Live Map</Text>
                <Text style={styles.userName}>{deliveryPartner?.name}</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Track your location and nearby orders
              </Text>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Icon name="location-on" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.statContent}>
                  <Text style={styles.statNumber}>{nearbyOrders.length}</Text>
                  <Text style={styles.statLabel}>Nearby</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <MapView />

      <Surface style={styles.nearbyCard} elevation={2}>
        <View style={styles.cardHeader}>
          <Icon name="local-shipping" size={20} color="#8B5CF6" />
          <Title style={styles.sectionTitle}>Nearby Orders</Title>
        </View>
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
                  style={styles.viewButton}
                  labelStyle={styles.viewButtonLabel}
                  icon="eye"
                >
                  View
                </Button>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noOrders}>
            <Icon name="local-shipping" size={64} color="#D1D5DB" />
            <Text style={styles.noOrdersText}>No nearby orders</Text>
            <Text style={styles.noOrdersSubtext}>
              Orders within 5km will appear here
            </Text>
          </View>
        )}
      </Surface>

      <Surface style={styles.statsCard} elevation={2}>
        <View style={styles.cardHeader}>
          <Icon name="analytics" size={20} color="#8B5CF6" />
          <Title style={styles.sectionTitle}>Today's Stats</Title>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Icon name="local-shipping" size={20} color="#2563EB" />
            </View>
            <Text style={styles.statLabel}>Orders</Text>
            <Text style={styles.statValue}>{orders.length}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Icon name="check-circle" size={20} color="#10B981" />
            </View>
            <Text style={styles.statLabel}>Delivered</Text>
            <Text style={styles.statValue}>
              {orders.filter(o => o.status === 'delivered').length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Icon name="trending-up" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statLabel}>In Progress</Text>
            <Text style={styles.statValue}>
              {orders.filter(o => ['assigned', 'picked_up', 'in_transit'].includes(o.status)).length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconWrapper}>
              <Icon name="account-balance-wallet" size={20} color="#8B5CF6" />
            </View>
            <Text style={styles.statLabel}>Earnings</Text>
            <Text style={styles.statValue}>
              ₹{orders.reduce((sum, order) => sum + (order.totalAmount * 0.1), 0).toFixed(0)}
            </Text>
          </View>
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#8B5CF6',
    paddingTop: 50,
    paddingBottom: 0,
  },
  headerBackground: {
    backgroundColor: '#8B5CF6',
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
    color: '#E9D5FF',
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
    color: '#E9D5FF',
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
    color: '#E9D5FF',
    fontWeight: '500',
  },
  mapContainer: {
    height: height * 0.35,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    fontSize: 18,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '600',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  locationMarker: {
    position: 'absolute',
    left: 20,
    top: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderMarker: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nearbyCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  nearbyOrder: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  orderDistance: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  orderActions: {
    marginLeft: 16,
  },
  viewButton: {
    borderRadius: 8,
    borderColor: '#E5E7EB',
  },
  viewButtonLabel: {
    fontSize: 12,
    color: '#374151',
  },
  noOrders: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '600',
  },
  noOrdersSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  statsCard: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  statIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});

export default MapScreen; 
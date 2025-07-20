import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { Earnings } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';

const EarningsScreen: React.FC = () => {
  const { deliveryPartner } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState<Earnings[]>([]);

  // Mock earnings data
  const mockEarnings: Earnings[] = [
    {
      id: '1',
      month: 'January',
      year: 2024,
      totalOrders: 45,
      totalEarnings: 15000,
      bonus: 2000,
      deductions: 500,
      netEarnings: 16500,
      paid: true,
      paidAt: '2024-02-01T00:00:00Z',
    },
    {
      id: '2',
      month: 'December',
      year: 2023,
      totalOrders: 38,
      totalEarnings: 12000,
      bonus: 1500,
      deductions: 300,
      netEarnings: 13200,
      paid: true,
      paidAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      month: 'November',
      year: 2023,
      totalOrders: 42,
      totalEarnings: 13500,
      bonus: 1800,
      deductions: 400,
      netEarnings: 14900,
      paid: true,
      paidAt: '2023-12-01T00:00:00Z',
    },
  ];

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      setTimeout(() => {
        setEarnings(mockEarnings);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const getCurrentMonthEarnings = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return earnings.find(
      earning => earning.month === monthNames[currentMonth] && earning.year === currentYear
    );
  };

  const currentMonthEarnings = getCurrentMonthEarnings();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings Dashboard</Text>
        <Text style={styles.headerSubtitle}>
          Welcome back, {deliveryPartner?.name}
        </Text>
      </View>

      {currentMonthEarnings && (
        <Card style={styles.currentMonthCard} mode="outlined">
          <Card.Content>
            <Title style={styles.currentMonthTitle}>Current Month</Title>
            <View style={styles.earningsGrid}>
              <View style={styles.earningsItem}>
                <Icon name="local-shipping" size={24} color="#2196F3" />
                <Text style={styles.earningsLabel}>Orders</Text>
                <Text style={styles.earningsValue}>{currentMonthEarnings.totalOrders}</Text>
              </View>
              <View style={styles.earningsItem}>
                <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
                <Text style={styles.earningsLabel}>Earnings</Text>
                <Text style={styles.earningsValue}>₹{currentMonthEarnings.totalEarnings}</Text>
              </View>
              <View style={styles.earningsItem}>
                <Icon name="stars" size={24} color="#FF9800" />
                <Text style={styles.earningsLabel}>Bonus</Text>
                <Text style={styles.earningsValue}>₹{currentMonthEarnings.bonus}</Text>
              </View>
              <View style={styles.earningsItem}>
                <Icon name="trending-up" size={24} color="#9C27B0" />
                <Text style={styles.earningsLabel}>Net</Text>
                <Text style={styles.earningsValue}>₹{currentMonthEarnings.netEarnings}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>Payment History</Title>
          {earnings.map((earning) => (
            <View key={earning.id} style={styles.earningRow}>
              <View style={styles.earningHeader}>
                <Text style={styles.earningMonth}>{earning.month} {earning.year}</Text>
                <View style={[
                  styles.paymentStatus,
                  { backgroundColor: earning.paid ? '#E8F5E8' : '#FFF3E0' }
                ]}>
                  <Text style={[
                    styles.paymentStatusText,
                    { color: earning.paid ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {earning.paid ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.earningDetails}>
                <View style={styles.earningDetail}>
                  <Text style={styles.earningDetailLabel}>Orders Delivered:</Text>
                  <Text style={styles.earningDetailValue}>{earning.totalOrders}</Text>
                </View>
                <View style={styles.earningDetail}>
                  <Text style={styles.earningDetailLabel}>Base Earnings:</Text>
                  <Text style={styles.earningDetailValue}>₹{earning.totalEarnings}</Text>
                </View>
                <View style={styles.earningDetail}>
                  <Text style={styles.earningDetailLabel}>Bonus:</Text>
                  <Text style={styles.earningDetailValue}>₹{earning.bonus}</Text>
                </View>
                <View style={styles.earningDetail}>
                  <Text style={styles.earningDetailLabel}>Deductions:</Text>
                  <Text style={styles.earningDetailValue}>-₹{earning.deductions}</Text>
                </View>
                <View style={styles.earningDetail}>
                  <Text style={styles.earningDetailLabel}>Net Earnings:</Text>
                  <Text style={[styles.earningDetailValue, styles.netEarnings]}>
                    ₹{earning.netEarnings}
                  </Text>
                </View>
              </View>
              
              {earning.paid && earning.paidAt && (
                <Text style={styles.paidDate}>
                  Paid on {new Date(earning.paidAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          ))}
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>Payment Information</Title>
          <Text style={styles.infoText}>
            • Payments are processed monthly on the 1st of each month
          </Text>
          <Text style={styles.infoText}>
            • Bonus is calculated based on performance and customer ratings
          </Text>
          <Text style={styles.infoText}>
            • Deductions may include fuel charges or other operational costs
          </Text>
          <Text style={styles.infoText}>
            • For payment queries, contact support at support@vilki.com
          </Text>
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
  currentMonthCard: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  currentMonthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  earningsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  earningsItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  card: {
    margin: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  earningRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  earningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  earningMonth: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  earningDetails: {
    gap: 8,
  },
  earningDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  earningDetailLabel: {
    fontSize: 14,
    color: '#666',
  },
  earningDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  netEarnings: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  paidDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
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
});

export default EarningsScreen; 
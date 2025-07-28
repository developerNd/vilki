// screens/EarningsScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  useTheme,
  ActivityIndicator,
  Surface,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { earningsAPI } from '../services/api';
import { Earnings } from '../types';

const EarningsScreen: React.FC = () => {
  const { deliveryPartner } = useAuth();
  const theme = useTheme();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState<Earnings[]>([]);

  // Memoized month names to avoid re-creation on each render
  const monthNames = useMemo(() => [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ], []);

  // Mock earnings data (replace with real API fetch)
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

  // Fetch earnings from API
  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await earningsAPI.getEarnings();
      if (response && response.data) {
        setEarnings(response.data);
      } else {
        // Fallback to mock data if API fails
        setEarnings(mockEarnings);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Fallback to mock data for development
      setEarnings(mockEarnings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEarnings();
    setRefreshing(false);
  };

  const getCurrentMonthEarnings = (): Earnings | undefined => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return earnings.find(
      (e) => e.month === monthNames[currentMonth] && e.year === currentYear
    );
  };

  const currentMonthEarnings = getCurrentMonthEarnings();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F59E0B" />
        <Text style={styles.loadingText}>Loading earnings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#F59E0B" barStyle="light-content" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F59E0B']}
            tintColor="#F59E0B"
          />
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <View style={styles.headerContent}>
              <View style={styles.welcomeSection}>
                <View style={styles.greetingContainer}>
                  <Text style={styles.greetingText}>Earnings Dashboard</Text>
                  <Text style={styles.userName}>{deliveryPartner?.name || 'Delivery Partner'}</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                  Track your earnings and payment history
                </Text>
              </View>
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statIconContainer}>
                    <Icon name="account-balance-wallet" size={24} color="#FFFFFF" />
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statNumber}>
                      ₹{earnings.reduce((sum, e) => sum + e.netEarnings, 0).toLocaleString()}
                    </Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {currentMonthEarnings && (
          <Surface style={styles.currentMonthCard} elevation={2}>
            <View style={styles.cardHeader}>
              <Icon name="trending-up" size={20} color="#F59E0B" />
              <Title style={styles.currentMonthTitle}>Current Month</Title>
            </View>
            <View style={styles.earningsGrid}>
              {[
                {
                  icon: 'local-shipping',
                  label: 'Orders',
                  value: currentMonthEarnings.totalOrders,
                  color: '#2563EB',
                },
                {
                  icon: 'account-balance-wallet',
                  label: 'Earnings',
                  value: `₹${currentMonthEarnings.totalEarnings}`,
                  color: '#10B981',
                },
                {
                  icon: 'stars',
                  label: 'Bonus',
                  value: `₹${currentMonthEarnings.bonus}`,
                  color: '#F59E0B',
                },
                {
                  icon: 'trending-up',
                  label: 'Net',
                  value: `₹${currentMonthEarnings.netEarnings}`,
                  color: '#8B5CF6',
                },
              ].map(({ icon, label, value, color }) => (
                <View style={styles.earningsItem} key={label}>
                  <View style={[styles.earningsIconWrapper, { backgroundColor: `${color}10` }]}>
                    <Icon name={icon} size={20} color={color} />
                  </View>
                  <Text style={styles.earningsLabel}>{label}</Text>
                  <Text style={styles.earningsValue}>{value}</Text>
                </View>
              ))}
            </View>
          </Surface>
        )}

        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon name="history" size={20} color="#F59E0B" />
            <Title style={styles.sectionTitle}>Payment History</Title>
          </View>
          {earnings.map((earning) => (
            <View key={earning.id} style={styles.earningRow}>
              <View style={styles.earningHeader}>
                <Text style={styles.earningMonth}>
                  {earning.month} {earning.year}
                </Text>
                <View
                  style={[
                    styles.paymentStatus,
                    { backgroundColor: earning.paid ? '#D1FAE5' : '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentStatusText,
                      { color: earning.paid ? '#10B981' : '#F59E0B' },
                    ]}
                  >
                    {earning.paid ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>

              <View style={styles.earningDetails}>
                <View style={styles.earningDetail}>
                  <Text style={styles.earningDetailLabel}>Orders Delivered:</Text>
                  <Text style={styles.earningDetailValue}>
                    {earning.totalOrders}
                  </Text>
                </View>
                <View style={styles.earningDetail}>
                  <Text style={styles.earningDetailLabel}>Base Earnings:</Text>
                  <Text style={styles.earningDetailValue}>
                    ₹{earning.totalEarnings}
                  </Text>
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
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon name="info" size={20} color="#F59E0B" />
            <Title style={styles.sectionTitle}>Payment Information</Title>
          </View>
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
  header: {
    backgroundColor: '#F59E0B',
    paddingTop: 50,
    paddingBottom: 0,
  },
  headerBackground: {
    backgroundColor: '#F59E0B',
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
    color: '#FEF3C7',
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
    color: '#FEF3C7',
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
    minWidth: 100,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#FEF3C7',
    fontWeight: '500',
  },
  currentMonthCard: {
    margin: 20,
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  currentMonthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
  },
  earningsIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  card: {
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  earningRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
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
    color: '#1F2937',
  },
  paymentStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
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
    color: '#6B7280',
  },
  earningDetailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  netEarnings: {
    fontWeight: 'bold',
    color: '#2563EB',
  },
  paidDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
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
});

export default EarningsScreen;

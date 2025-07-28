import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Avatar,
  List,
  Divider,
  useTheme,
  Surface,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen: React.FC = () => {
  const { deliveryPartner, logout } = useAuth();
  const theme = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  if (!deliveryPartner || !deliveryPartner.name) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#6B7280" barStyle="light-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerBackground}>
            <View style={styles.profileSection}>
              <Avatar.Text
                size={100}
                label={deliveryPartner?.name ? deliveryPartner.name.split(' ').map(n => n[0]).join('') : 'DP'}
                style={styles.avatar}
                color="#FFFFFF"
                labelStyle={styles.avatarLabel}
              />
              <View style={styles.profileInfo}>
                <Text style={styles.name}>{deliveryPartner.name}</Text>
                <Text style={styles.role}>Delivery Partner</Text>
                <Text style={styles.partnerId}>ID: {deliveryPartner.id}</Text>
              </View>
            </View>
          </View>
        </View>

        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon name="person" size={20} color="#6B7280" />
            <Title style={styles.sectionTitle}>Personal Information</Title>
          </View>
          <List.Item
            title="Name"
            description={deliveryPartner.name}
            left={(props) => <List.Icon {...props} icon="account" color="#6B7280" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Email"
            description={deliveryPartner.mail}
            left={(props) => <List.Icon {...props} icon="email" color="#6B7280" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Phone"
            description={deliveryPartner.phone}
            left={(props) => <List.Icon {...props} icon="phone" color="#6B7280" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon name="motorcycle" size={20} color="#6B7280" />
            <Title style={styles.sectionTitle}>Vehicle Information</Title>
          </View>
          <List.Item
            title="Vehicle Type"
            description={deliveryPartner.vehicleType}
            left={(props) => <List.Icon {...props} icon="motorcycle" color="#6B7280" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Vehicle Number"
            description={deliveryPartner.vehicleNumber}
            left={(props) => <List.Icon {...props} icon="card-text" color="#6B7280" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon name="check-circle" size={20} color="#6B7280" />
            <Title style={styles.sectionTitle}>Account Status</Title>
          </View>
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Icon
                name={deliveryPartner.isActive ? 'check-circle' : 'cancel'}
                size={24}
                color={deliveryPartner.isActive ? '#10B981' : '#EF4444'}
              />
              <Text style={styles.statusText}>
                {deliveryPartner.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </Surface>

        <Surface style={styles.card} elevation={2}>
          <View style={styles.cardHeader}>
            <Icon name="information" size={20} color="#6B7280" />
            <Title style={styles.sectionTitle}>App Information</Title>
          </View>
          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" color="#6B7280" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
          <List.Item
            title="Last Updated"
            description={new Date().toLocaleDateString()}
            left={(props) => <List.Icon {...props} icon="update" color="#6B7280" />}
            style={styles.listItem}
            titleStyle={styles.listItemTitle}
            descriptionStyle={styles.listItemDescription}
          />
        </Surface>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
            labelStyle={styles.logoutButtonLabel}
            icon="logout"
          >
            Logout
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Vilki Delivery Partner App
          </Text>
        </View>
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
    backgroundColor: '#446dbeff',
    paddingTop: 50,
    paddingBottom: 0,
  },
  headerBackground: {
    backgroundColor: '#446dbeff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#232f41ff',
  },
  avatarLabel: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  profileInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#D1D5DB',
    marginBottom: 8,
    fontWeight: '500',
  },
  partnerId: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  card: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  listItem: {
    paddingVertical: 12,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  listItemDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusContainer: {
    paddingVertical: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 8,
  },
  logoutButton: {
    borderRadius: 12,
    backgroundColor: '#EF4444',
  },
  logoutButtonContent: {
    paddingVertical: 12,
  },
  logoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default ProfileScreen; 
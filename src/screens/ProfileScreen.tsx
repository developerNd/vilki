import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
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

  if (!deliveryPartner) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text
          size={80}
          label={deliveryPartner.name.split(' ').map(n => n[0]).join('')}
          style={styles.avatar}
        />
        <Title style={styles.name}>{deliveryPartner.name}</Title>
        <Text style={styles.role}>Delivery Partner</Text>
        <Text style={styles.partnerId}>ID: {deliveryPartner.id}</Text>
      </View>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>Personal Information</Title>
          
          <List.Item
            title="Name"
            description={deliveryPartner.name}
            left={(props) => <List.Icon {...props} icon="account" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Email"
            description={deliveryPartner.email}
            left={(props) => <List.Icon {...props} icon="email" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Phone"
            description={deliveryPartner.phone}
            left={(props) => <List.Icon {...props} icon="phone" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>Vehicle Information</Title>
          
          <List.Item
            title="Vehicle Type"
            description={deliveryPartner.vehicleType}
            left={(props) => <List.Icon {...props} icon="motorcycle" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Vehicle Number"
            description={deliveryPartner.vehicleNumber}
            left={(props) => <List.Icon {...props} icon="card-text" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>Account Status</Title>
          
          <View style={styles.statusContainer}>
            <View style={styles.statusRow}>
              <Icon
                name={deliveryPartner.isActive ? 'check-circle' : 'cancel'}
                size={24}
                color={deliveryPartner.isActive ? '#4CAF50' : '#F44336'}
              />
              <Text style={styles.statusText}>
                {deliveryPartner.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card} mode="outlined">
        <Card.Content>
          <Title style={styles.sectionTitle}>App Information</Title>
          
          <List.Item
            title="App Version"
            description="1.0.0"
            left={(props) => <List.Icon {...props} icon="information" />}
            style={styles.listItem}
          />
          
          <List.Item
            title="Last Updated"
            description={new Date().toLocaleDateString()}
            left={(props) => <List.Icon {...props} icon="update" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  partnerId: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'monospace',
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
  listItem: {
    paddingVertical: 8,
  },
  statusContainer: {
    paddingVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    padding: 16,
  },
  logoutButton: {
    borderRadius: 8,
    backgroundColor: '#F44336',
  },
  logoutButtonContent: {
    paddingVertical: 8,
  },
  footer: {
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen; 
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image, // <-- Import Image here
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  Card,
  Title,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const LoginScreen: React.FC = () => {
  const [partnerId, setPartnerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const theme = useTheme();

  const testUsers = [
    { id: 'DP001', name: 'Rahul Kumar', location: 'Connaught Place' },
    { id: 'DP002', name: 'Priya Sharma', location: 'Lajpat Nagar' },
    { id: 'DP003', name: 'Amit Patel', location: 'Dwarka' },
    { id: 'DP004', name: 'Sneha Gupta', location: 'Gurgaon' },
    { id: 'DP005', name: 'Vikram Singh', location: 'Noida' },
  ];

  const handleLogin = async () => {
    if (!partnerId.trim()) {
      Alert.alert('Error', 'Please enter your Delivery Partner ID');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const success = await login(partnerId.trim(), password.trim());
      if (!success) {
        Alert.alert(
          'Invalid Credentials',
          'Please use one of the test user IDs shown below:\n\n' +
          testUsers.map(user => `${user.id} - ${user.name}`).join('\n')
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectTestUser = (userId: string) => {
    setPartnerId(userId);
    setShowTestUsers(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            {/* Replace Icon with your custom logo image */}
            <Image
              source={require('../../assets/transparent_logo.png')} // Adjust path if needed
              style={styles.logo}
            />
            <Text style={[styles.title, { color: theme.colors.primary }]}>
              Vilki Delivery
            </Text>
            <Text style={styles.subtitle}>Partner App</Text>
          </View>

          <Surface style={styles.loginCard} elevation={4}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.instructionText}>
              Enter your Delivery Partner ID and password to access your dashboard
            </Text>

            <TextInput
              label="Delivery Partner ID"
              value={partnerId}
              onChangeText={setPartnerId}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="Enter your partner ID"
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              placeholder="Enter your password"
              right={
                <TextInput.Icon
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>

            <Button
              mode="text"
              onPress={() => setShowTestUsers(!showTestUsers)}
              style={styles.testUsersButton}
            >
              {showTestUsers ? 'Hide Test Users' : 'Show Test Users'}
            </Button>

            {showTestUsers && (
              <Card style={styles.testUsersCard} mode="outlined">
                <Card.Content>
                  <Title style={styles.testUsersTitle}>Test User IDs</Title>
                  <Text style={styles.testUsersSubtitle}>
                    Click on any ID to auto-fill:
                  </Text>
                  {testUsers.map(user => (
                    <Button
                      key={user.id}
                      mode="outlined"
                      onPress={() => selectTestUser(user.id)}
                      style={styles.testUserButton}
                      contentStyle={styles.testUserButtonContent}
                    >
                      <View style={styles.testUserInfo}>
                        <Text style={[styles.testUserId, { color: theme.colors.primary }]}>
                          {user.id}
                        </Text>
                        <Text style={styles.testUserName}>{user.name}</Text>
                        <Text style={styles.testUserLocation}>{user.location}</Text>
                      </View>
                    </Button>
                  ))}
                </Card.Content>
              </Card>
            )}

            <Text style={styles.helpText}>
              Don't have a partner ID? Contact your administrator
            </Text>
          </Surface>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              © 2024 Vilki Delivery. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // light blue background
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 20,
    color: '#1976D2', // darker blue
    marginTop: 2,
  },
  loginCard: {
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#1565C0',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  testUsersButton: {
    marginTop: 12,
  },
  testUsersCard: {
    marginTop: 16,
    borderRadius: 8,
  },
  testUsersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  testUsersSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  testUserButton: {
    marginBottom: 8,
    borderRadius: 8,
  },
  testUserButtonContent: {
    paddingVertical: 8,
  },
  testUserInfo: {
    alignItems: 'flex-start',
    width: '100%',
  },
  testUserId: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  testUserName: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
  testUserLocation: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#0D47A1',
    textAlign: 'center',
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
  },
  footerText: {
    fontSize: 12,
    color: '#90CAF9',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40, // half of width/height to make circle
    resizeMode: 'cover', // use 'cover' so it fills the circle nicely
    marginBottom: 10,
  },

});

export default LoginScreen;

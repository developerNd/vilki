// screens/LoginScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  Card,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useNavigation, CommonActions } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const [partnerId, setPartnerId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showTestUsers, setShowTestUsers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const theme = useTheme();
  
  // Create a ref for password input to enable focusing programmatically
  const passwordInputRef = useRef<any>(null);

  const testUsers = [
    { id: 'DP001', name: 'Rahul Kumar', location: 'Connaught Place' },
    { id: 'DP002', name: 'Priya Sharma', location: 'Lajpat Nagar' },
    { id: 'DP003', name: 'Amit Patel', location: 'Dwarka' },
    { id: 'DP004', name: 'Sneha Gupta', location: 'Gurgaon' },
    { id: 'DP005', name: 'Vikram Singh', location: 'Noida' },
  ];

  useEffect(() => {
    console.log('LoginScreen: isAuthenticated changed to:', isAuthenticated);
    if (isAuthenticated) {
      console.log('LoginScreen: Navigating to Main screen');
      // Reset navigation stack and navigate to Dashboard (Main Tab)
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Main' }], // make sure your main screen is named "Main"
        })
      );
    }
  }, [isAuthenticated, navigation]);

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
      console.log('LoginScreen: Attempting login with:', partnerId.trim());
      const success = await login(partnerId.trim(), password.trim());
      console.log('LoginScreen: Login result:', success);
      if (!success) {
        Alert.alert(
          'Invalid Credentials',
          'Please use one of the test user IDs shown below:\n\n' +
          testUsers.map((user) => `${user.id} - ${user.name}`).join('\n')
        );
      }
    } catch (error) {
      console.log('LoginScreen: Login error:', error);
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
    <View style={styles.container}>
      <StatusBar backgroundColor="#2563EB" barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/transparent_logo.png')}
                  style={styles.logo}
                />
                <Text style={styles.appName}>Vilki Delivery</Text>
                <Text style={styles.subtitle}>Partner App</Text>
              </View>
            </View>

            <Surface style={styles.loginCard} elevation={4}>
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome Back!</Text>
                <Text style={styles.instructionText}>
                  Sign in to access your delivery dashboard
                </Text>
              </View>

              <View style={styles.formSection}>
                <TextInput
                  label="Delivery Partner ID"
                  value={partnerId}
                  onChangeText={setPartnerId}
                  mode="outlined"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Enter your partner ID"
                  left={<TextInput.Icon icon="account" color="#6B7280" />}
                  returnKeyType="next"
                  onSubmitEditing={() => {
                    passwordInputRef.current?.focus();
                  }}
                  blurOnSubmit={false}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#2563EB"
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  left={<TextInput.Icon icon="lock" color="#6B7280" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                      color="#6B7280"
                    />
                  }
                  ref={passwordInputRef}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#2563EB"
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                  labelStyle={styles.loginButtonLabel}
                  icon={loading ? undefined : 'login'}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </View>

              <View style={styles.testUsersSection}>
                <Button
                  mode="text"
                  onPress={() => setShowTestUsers(!showTestUsers)}
                  style={styles.testUsersButton}
                  labelStyle={styles.testUsersButtonLabel}
                  icon={showTestUsers ? 'chevron-up' : 'chevron-down'}
                >
                  {showTestUsers ? 'Hide Test Users' : 'Show Test Users'}
                </Button>

                {showTestUsers && (
                  <Card style={styles.testUsersCard} mode="outlined">
                    <Card.Content>
                      <Text style={styles.testUsersSubtitle}>Click on any ID to auto-fill:</Text>
                      {testUsers.map((user) => (
                        <Button
                          key={user.id}
                          mode="outlined"
                          onPress={() => selectTestUser(user.id)}
                          style={styles.testUserButton}
                          contentStyle={styles.testUserButtonContent}
                          labelStyle={styles.testUserButtonLabel}
                          icon="account-circle"
                        >
                          <View style={styles.testUserInfo}>
                            <Text style={styles.testUserId}>
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
              </View>

              <Text style={styles.helpText}>
                Don't have a partner ID? Contact your administrator
              </Text>
            </Surface>

            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2024 Vilki Delivery. All rights reserved.</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563EB',
  },
  keyboardContainer: {
    flex: 1,
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
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#DBEAFE',
    fontWeight: '500',
  },
  loginCard: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#2563EB',
  },
  loginButtonContent: {
    paddingVertical: 12,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  testUsersSection: {
    marginBottom: 16,
  },
  testUsersButton: {
    marginBottom: 16,
  },
  testUsersButtonLabel: {
    color: '#2563EB',
    fontWeight: '600',
  },
  testUsersCard: {
    borderRadius: 12,
    borderColor: '#E5E7EB',
  },
  testUsersSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  testUserButton: {
    marginBottom: 8,
    borderRadius: 8,
    borderColor: '#E5E7EB',
  },
  testUserButtonContent: {
    paddingVertical: 8,
  },
  testUserButtonLabel: {
    color: '#374151',
  },
  testUserInfo: {
    alignItems: 'flex-start',
    width: '100%',
  },
  testUserId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  testUserName: {
    fontSize: 12,
    color: '#374151',
    marginTop: 2,
  },
  testUserLocation: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  helpText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    fontSize: 12,
    color: '#DBEAFE',
  },
});

export default LoginScreen;

import React from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  SafeAreaView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {
  createStackNavigator,
} from '@react-navigation/stack';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  Provider as PaperProvider,
  DefaultTheme as PaperDefaultTheme,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {
  LoginScreen,
  OrdersScreen,
  MyOrdersScreen,
  OrderDetailsScreen,
  ProfileScreen,
  EarningsScreen,
  MapScreen,
} from './src/screens';

import {
  AuthProvider,
  useAuth,
  OrderProvider,
} from './src/context';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 🎨 Modern Theme for Paper
const theme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#2563EB', // Modern blue
    secondary: '#10B981', // Modern green
    accent: '#F59E0B', // Modern amber
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#1F2937',
    placeholder: '#9CA3AF',
    border: '#E5E7EB',
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Orders') {
            iconName = 'local-shipping';
          } else if (route.name === 'My Orders') {
            iconName = 'assignment';
          } else if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Earnings') {
            iconName = 'account-balance-wallet';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: 8,
          paddingTop: 8,
          height: 70,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Available',
        }}
      />
      <Tab.Screen 
        name="My Orders" 
        component={MyOrdersScreen}
        options={{
          tabBarLabel: 'My Orders',
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen 
        name="Earnings" 
        component={EarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: '#F8FAFC' }
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen
              name="OrderDetails"
              component={OrderDetailsScreen}
              options={{ 
                headerShown: true, 
                title: 'Order Details',
                headerStyle: {
                  backgroundColor: '#2563EB',
                  elevation: 0,
                  shadowOpacity: 0,
                },
                headerTintColor: '#FFFFFF',
                headerTitleStyle: {
                  fontWeight: '600',
                  fontSize: 18,
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </SafeAreaView>
  );
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <PaperProvider theme={theme}>
      <AuthProvider>
        <OrderProvider>
          <View style={styles.container}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor="#2563EB"
            />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </View>
        </OrderProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});

export default App;

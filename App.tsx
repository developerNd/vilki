/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import {
  LoginScreen,
  OrdersScreen,
  OrderDetailsScreen,
  ProfileScreen,
  EarningsScreen,
  MapScreen,
} from './src/screens';

// Import context
import { AuthProvider, useAuth, OrderProvider } from './src/context';

// Note: react-native-screens is not installed to avoid compatibility issues

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Orders') {
              iconName = 'local-shipping';
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
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Orders" component={OrdersScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
        <Tab.Screen name="Earnings" component={EarningsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </SafeAreaView>
  );
}

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="OrderDetails" 
              component={OrderDetailsScreen}
              options={{ headerShown: true, title: 'Order Details' }}
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
    <PaperProvider>
      <AuthProvider>
        <OrderProvider>
          <View style={styles.container}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
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
  },
});

export default App;

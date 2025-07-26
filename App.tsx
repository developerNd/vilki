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

// 🔵 Blue Theme for Paper
const theme = {
  ...PaperDefaultTheme,
  colors: {
    ...PaperDefaultTheme.colors,
    primary: '#2196F3', // Set primary to blue
  },
};

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName= '';

          if (route.name === 'Orders') {
            iconName = 'delivery';
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
    <PaperProvider theme={theme}>
      <AuthProvider>
        <OrderProvider>
          <View style={styles.container}>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
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
  },
});

export default App;

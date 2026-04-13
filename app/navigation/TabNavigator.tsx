import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/customer/home/HomeScreen';
import CartScreen from '../screens/customer/cart/CartScreen';
import OrderHistoryScreen from '../screens/customer/orders/OrderHistoryScreen';
import { Constants } from '../utils/constants';
import { RootState } from '../store/types';
import { Colors } from '@/styles/colors';
import ProfileScreen from '@/screens/customer/profile/ProfileScreen';
import { logout } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Constants.SCREENS.HOME} component={HomeScreen} />
  </Stack.Navigator>
);

// Cart Stack
const CartStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Constants.SCREENS.CART} component={CartScreen} />
  </Stack.Navigator>
);

// Orders Stack
const OrdersStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Constants.SCREENS.ORDER_HISTORY} component={OrderHistoryScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={Constants.SCREENS.PROFILE_TAB} component={ProfileScreen} />
  </Stack.Navigator>
);

// Custom Tab Bar Component with enhanced design
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { itemsCount  } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  return (
    <View style={styles.tabBar}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          // else 
          if (route.name === Constants.SCREENS.PROFILE_TAB)
          {
            Alert.alert('Notification', 'Screens yet to be implemented !',
              [
                {
                  text: 'Logout',
                  onPress: async() => {
                    await AsyncStorage.removeItem('authToken');
                    dispatch(logout());
                  },
                },
                { text: 'Okay', style: 'cancel' },
              ]
            );
            return;
          }

          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let iconName = '';
        let badgeCount = 0;

        if (route.name === Constants.SCREENS.HOME_TAB) {
          iconName = 'home';
        } else if (route.name === Constants.SCREENS.CART_TAB) {
          iconName = 'local-mall';
          badgeCount = itemsCount;
        } else if (route.name === Constants.SCREENS.ORDERS_TAB) {
          iconName = 'receipt';
        } else if (route.name === Constants.SCREENS.PROFILE_TAB) {
          iconName = 'person';
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <Icon
                name={iconName}
                size={24}
                color={isFocused ? Colors.primary : Colors.textPrimary}
              />
              {badgeCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? Colors.primary : Colors.textPrimary }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const CustomerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name={Constants.SCREENS.HOME_TAB} 
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.CART_TAB} 
        component={CartStack}
        options={{ tabBarLabel: 'Cart' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.ORDERS_TAB} 
        component={OrdersStack}
        options={{ tabBarLabel: 'Orders' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.PROFILE_TAB} 
        component={ProfileStack}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    height: 70,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  badge : {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: Colors.error,
    borderRadius: 8,
    paddingHorizontal: 4,
    minWidth: 16,
    height: 16,
  },
  badgeText: {
    color: Colors.textWhite,
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


export default CustomerTabNavigator;
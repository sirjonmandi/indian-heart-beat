import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DeliveryDashboardScreen from '../screens/delivery/dashboard/DeliveryDashboardScreen';
import DeliveryOrdersScreen from '../screens/delivery/orders/DeliveryOrdersScreen';
import DeliveryEarningsScreen from '../screens/delivery/earnings/DeliveryEarningsScreen';
import DeliveryProfileScreen from '../screens/delivery/profile/DeliveryProfileScreen';

import { Constants } from '../utils/constants';
import { RootState } from '../store/types';

// Create the Tab Navigator
const Tab = createBottomTabNavigator();

// Delivery Tab Bar Component
const DeliveryCustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { availableOrders, isOnline } = useSelector((state: RootState) => state.delivery);

  return (
    <View style={[
      styles.tabBar, 
      { 
        backgroundColor: '#fff',
        opacity: isOnline ? 1 : 0.7,
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
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

        if (route.name === Constants.SCREENS.DELIVERY_DASHBOARD_TAB) {
          iconName = 'dashboard';
        } else if (route.name === Constants.SCREENS.DELIVERY_ORDERS_TAB) {
          iconName = 'local-shipping';
          badgeCount = availableOrders?.length || 0;
        } else if (route.name === Constants.SCREENS.DELIVERY_EARNINGS_TAB) {
          iconName = 'account-balance-wallet';
        } else if (route.name === Constants.SCREENS.DELIVERY_PROFILE_TAB) {
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
                color={isFocused ? '#2196F3' : '#999999'}
              />
              {badgeCount > 0 && (
                <View style={[styles.badge, { backgroundColor: '#2196F3' }]}>
                  <Text style={styles.badgeText}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.tabLabel,
              { color: isFocused ? '#2196F3' : '#999999' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const DeliveryPartnerTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <DeliveryCustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name={Constants.SCREENS.DELIVERY_DASHBOARD_TAB} 
        component={DeliveryDashboardScreen}
        options={{ tabBarLabel: 'DASHBOARD' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.DELIVERY_ORDERS_TAB} 
        component={DeliveryOrdersScreen}
        options={{ tabBarLabel: 'ORDERS' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.DELIVERY_EARNINGS_TAB} 
        component={DeliveryEarningsScreen}
        options={{ tabBarLabel: 'EARNINGS' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.DELIVERY_PROFILE_TAB} 
        component={DeliveryProfileScreen}
        options={{ tabBarLabel: 'PROFILE' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -12,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DeliveryPartnerTabNavigator;
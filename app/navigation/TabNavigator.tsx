import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import HomeScreen from '../screens/customer/home/HomeScreen';
import CartScreen from '../screens/customer/cart/CartScreen';
import OrderHistoryScreen from '../screens/customer/orders/OrderHistoryScreen';
import { Constants } from '../utils/constants';
import { RootState } from '../store/types';
import { Colors } from '@/styles/colors';

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

// Custom Tab Bar Component with enhanced design
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const { cartItemsCount } = useSelector((state: RootState) => state.cart);

  return (
    <View style={styles.tabBar}>
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

        if (route.name === Constants.SCREENS.HOME_TAB) {
          iconName = 'home';
        } else if (route.name === Constants.SCREENS.CART_TAB) {
          iconName = 'shopping-cart';
          badgeCount = cartItemsCount;
        } else if (route.name === Constants.SCREENS.ORDERS_TAB) {
          iconName = 'receipt';
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
                color={isFocused ? Colors.primary : Colors.textColor}
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
              { color: isFocused ? Colors.primary : Colors.textColor }
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
        options={{ tabBarLabel: 'HOME' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.CART_TAB} 
        component={CartStack}
        options={{ tabBarLabel: 'CART' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.ORDERS_TAB} 
        component={OrdersStack}
        options={{ tabBarLabel: 'ORDERS' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    paddingVertical: 8,
    paddingHorizontal: 16,
    // borderTopWidth: 1,
    // borderTopColor: '#E0E0E0',
    height: 60,
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
});


export default CustomerTabNavigator;
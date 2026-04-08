import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import ShopOrderManagementScreen from '../screens/shop/orders/ShopOrderManagementScreen';
import ShopInventoryScreen from '../screens/shop/inventory/ShopInventoryScreen';
import ShopEarningsScreen from '../screens/shop/earnings/ShopEarningsScreen';
// import StoreProfileScreen from '../screens/shop/profile/ShopProfileScreen';
import StoreDashboardScreen from '../screens/shop/dashboard/StoreDashboardScreen';

import { Constants } from '../utils/constants';
import { RootState } from '../store/types';

const Tab = createBottomTabNavigator();

// Store Tab Bar Component with proper styles
const StoreCustomTabBar = ({ state, descriptors, navigation }: any) => {
  // const { pendingOrders } = useSelector((state: RootState) => state.shop);
  const pendingOrders = [1, 2, 3]; // Mock data - replace with actual selector

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

        if (route.name === Constants.SCREENS.STORE_DASHBOARD_TAB) {
          iconName = 'dashboard';
        } else if (route.name === Constants.SCREENS.STORE_ORDERS_TAB) {
          iconName = 'receipt';
          badgeCount = pendingOrders?.length || 0;
        } else if (route.name === Constants.SCREENS.STORE_INVENTORY_TAB) {
          iconName = 'inventory';
        } else if (route.name === Constants.SCREENS.STORE_EARNINGS_TAB) {
          iconName = 'account-balance-wallet';
        } else if (route.name === Constants.SCREENS.STORE_PROFILE_TAB) {
          iconName = 'store';
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
                color={isFocused ? '#4CAF50' : '#999999'}
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
              { color: isFocused ? '#4CAF50' : '#999999' }
            ]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const StoreTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <StoreCustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name={Constants.SCREENS.STORE_DASHBOARD_TAB} 
        component={StoreDashboardScreen}
        options={{ tabBarLabel: 'DASHBOARD' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.STORE_ORDERS_TAB} 
        component={ShopOrderManagementScreen}
        options={{ tabBarLabel: 'ORDERS' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.STORE_INVENTORY_TAB} 
        component={ShopInventoryScreen}
        options={{ tabBarLabel: 'INVENTORY' }}
      />
      <Tab.Screen 
        name={Constants.SCREENS.STORE_EARNINGS_TAB} 
        component={ShopEarningsScreen}
        options={{ tabBarLabel: 'EARNINGS' }}
      />
      {/* <Tab.Screen 
        name={Constants.SCREENS.STORE_PROFILE_TAB} 
        component={StoreProfileScreen}
        options={{ tabBarLabel: 'PROFILE' }}
      /> */}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  // FIXED TAB BAR STYLES - This was the missing part!
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
    backgroundColor: '#4CAF50',
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

  // OTHER STYLES (kept for compatibility, but not needed for tab bar)
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  ordersSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  orderDetails: {
    marginBottom: 8,
  },
  orderShop: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderDistance: {
    fontSize: 12,
    color: '#999',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderEarning: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  actionButtonQuick: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StoreTabNavigator;
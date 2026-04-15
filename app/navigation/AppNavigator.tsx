// ===============================================
// FIXED APP NAVIGATOR - NO NESTED NAVIGATORS
// ===============================================

import React, { useEffect, useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet } from 'react-native';

// Navigation Components
import AuthNavigator from './AuthNavigator';
import CustomerTabNavigator from './TabNavigator';
import StoreTabNavigator from './StoreTabNavigator';
import DeliveryPartnerTabNavigator from './DeliveryPartnerTabNavigator';

// Shared Screens
import ProductListScreen from '../screens/customer/home/ProductListScreen';
import CategoryScreen from '../screens/customer/home/CategoryScreen';
import StoreDetailScreen from '../screens/customer/home/StoreDetailScreen';
import ProductDetailScreen from '../screens/customer/home/ProductDetailScreen';
import SearchScreen from '../screens/customer/home/SearchScreen';
import CheckoutScreen from '../screens/customer/cart/CheckoutScreen';
import CartScreen from '../screens/customer/cart/CartScreen';
import AddressScreen from '../screens/address/AddressScreen';
import AddAddressScreen from '../screens/address/AddAddressScreen';
import OrderTrackingScreen from '../screens/customer/orders/OrderTrackingScreen';
import OrderDetailsScreen from '../screens/customer/orders/OrderDetailsScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import ProfileEditScreen from '../screens/customer/profile/ProfileEditScreen';
import ProfileScreen from '../screens/customer/profile/ProfileScreen';
import WalletScreen from '../screens/customer/profile/WalletScreen';
import ReferralScreen from '../screens/customer/profile/ReferralScreen';
import HelpSupportScreen from '../screens/customer/profile/HelpSupportScreen';
import PaymentScreen from '../screens/customer/payment/PaymentScreen';

// User Type Selection Screen
import UserTypeSelectionScreen from '../screens/auth/UserTypeSelectionScreen';

// Store/Delivery Screens
import ShopOrderManagementScreen from '../screens/shop/orders/ShopOrderManagementScreen';
import AddProductScreen from '../screens/shop/inventory/AddProductScreen';
import EditProductScreen from '../screens/shop/inventory/EditProductScreen';
import ShopSettingsScreen from '../screens/shop/profile/ShopSettingsScreen';
import ShopReportsScreen from '../screens/shop/reports/ShopReportsScreen';
import DeliveryOrderDetailsScreen from '../screens/delivery/orders/DeliveryOrderDetailsScreen';
import DeliveryTrackingScreen from '../screens/delivery/tracking/DeliveryTrackingScreen';
import DeliverySettingsScreen from '../screens/delivery/profile/DeliverySettingsScreen';
import DeliveryProfileEditScreen from '@/screens/delivery/profile/DeliveryProfileEditScreen';
import BankDetailsScreen from '@/screens/delivery/profile/BankDetailsScreen';

import { RootState } from '../store/types';
import { Constants } from '../utils/constants';
import { checkAuthStatus, setUserType } from '../store/slices/authSlice';

import SplashScreen from '../screens/auth/SplashScreen';
import AboutUsScreen from '@/screens/customer/profile/AboutUsScreen';
import ShopBankDetailsScreen from '@/screens/shop/profile/ShopBankDetailsScreen';
import VehicleDetailsScreen from '@/screens/delivery/profile/VehicleDetailsScreen';
import DocumentDetailsScreen from '@/screens/delivery/profile/DocumentDetailsScreen';
import FeedbackScreen from '@/screens/delivery/profile/FeedbackScreen';
import RatingReviewScreen from '@/screens/delivery/profile/RatingReviewScreen';
import PerformanceReportScreen from '@/screens/delivery/profile/PerformanceReportScreen';
import WorkScheduleScreen from '@/screens/delivery/profile/WorkScheduleScreen';
import AgeVerificationScreen from '@/screens/auth/AgeVerificationScreen';
import LocationPermissionScreen from '@/screens/auth/LocationPermissionScreen';
import { Colors } from '@/styles/colors';
import OrderHistoryScreen from '@/screens/customer/orders/OrderHistoryScreen';
const Stack = createStackNavigator();

// Simple Loading Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <SplashScreen />
  </View>
);

// Create a Main Navigator that handles shared screens
const MainNavigator: React.FC<{ userType: string }> = ({ userType }) => {
  // Get the appropriate initial navigator based on user type
  const getInitialTabNavigator = () => {
    switch (userType) {
      case 'customer':
        return CustomerTabNavigator;
      case 'shop_owner':
        return StoreTabNavigator;
      case 'delivery_partner':
        return DeliveryPartnerTabNavigator;
      default:
        return CustomerTabNavigator;
    }
  };

  const InitialNavigator = getInitialTabNavigator();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="MainTabs"
    >
      {/* The main tab navigator - this is the initial screen */}
      <Stack.Screen 
        name="MainTabs" 
        component={InitialNavigator} 
      />
      
      {/* Shared screens that can be accessed from any tab */}
      <Stack.Screen name={Constants.SCREENS.NOTIFICATIONS} component={NotificationsScreen} />
      
      {/* Customer specific shared screens */}
      {userType === 'customer' && (
        <>
          <Stack.Screen name={Constants.SCREENS.STORE_DETAIL} component={StoreDetailScreen} />
          <Stack.Screen name={Constants.SCREENS.LOCATION_PERMISSION} component={LocationPermissionScreen} />
          <Stack.Screen name={Constants.SCREENS.AGE_VERIFICATION} component={AgeVerificationScreen} />
          <Stack.Screen name={Constants.SCREENS.PRODUCT_LIST} component={ProductListScreen} />
          <Stack.Screen name={Constants.SCREENS.PRODUCT_DETAIL} component={ProductDetailScreen} />
          <Stack.Screen name={Constants.SCREENS.CATEGORY} component={CategoryScreen} />
          <Stack.Screen name={Constants.SCREENS.SEARCH} component={SearchScreen} />
          <Stack.Screen name={Constants.SCREENS.CART} component={CartScreen} />
          <Stack.Screen name={Constants.SCREENS.CHECKOUT} component={CheckoutScreen} />
          <Stack.Screen name={Constants.SCREENS.ADDRESSES} component={AddressScreen} />
          <Stack.Screen name={Constants.SCREENS.ADD_ADDRESS} component={AddAddressScreen} />
          <Stack.Screen name={Constants.SCREENS.ORDER_HISTORY} component={OrderHistoryScreen} />
          <Stack.Screen name={Constants.SCREENS.ORDER_TRACKING} component={OrderTrackingScreen} />
          <Stack.Screen name={Constants.SCREENS.ORDER_DETAILS} component={OrderDetailsScreen} />
          <Stack.Screen name={Constants.SCREENS.PROFILE} component={ProfileScreen} />
          <Stack.Screen name={Constants.SCREENS.PROFILE_EDIT} component={ProfileEditScreen} />
          <Stack.Screen name={Constants.SCREENS.WALLET} component={WalletScreen} />
          <Stack.Screen name={Constants.SCREENS.REFERRAL} component={ReferralScreen} />
          <Stack.Screen name={Constants.SCREENS.HELP_SUPPORT} component={HelpSupportScreen} />
          <Stack.Screen name={Constants.SCREENS.ABOUT_US} component={AboutUsScreen} />
          <Stack.Screen name={Constants.SCREENS.PAYMENT} component={PaymentScreen} />
        </>
      )}

      {/* Shop Owner specific screens */}
      {userType === 'shop_owner' && (
        <>
          <Stack.Screen name={Constants.SCREENS.SHOP_ORDER_DETAILS} component={ShopOrderManagementScreen} />
          <Stack.Screen name={Constants.SCREENS.ADD_PRODUCT} component={AddProductScreen} />
          <Stack.Screen name={Constants.SCREENS.EDIT_PRODUCT} component={EditProductScreen} />
          <Stack.Screen name={Constants.SCREENS.SHOP_SETTINGS} component={ShopSettingsScreen} />
          <Stack.Screen name={Constants.SCREENS.STORE_BANK_DETAILS} component={ShopBankDetailsScreen} />
          <Stack.Screen name={Constants.SCREENS.SHOP_REPORTS} component={ShopReportsScreen} />
          <Stack.Screen name={Constants.SCREENS.PROFILE} component={ProfileScreen} />
          <Stack.Screen name={Constants.SCREENS.PROFILE_EDIT} component={ProfileEditScreen} />
          <Stack.Screen name={Constants.SCREENS.HELP_SUPPORT} component={HelpSupportScreen} />
          <Stack.Screen name={Constants.SCREENS.ABOUT_US} component={AboutUsScreen} />
        </>
      )}

      {/* Delivery Partner specific screens */}
      {userType === 'delivery_partner' && (
        <>
          <Stack.Screen name={Constants.SCREENS.DELIVERY_ORDER_DETAILS} component={DeliveryOrderDetailsScreen} />
          <Stack.Screen name={Constants.SCREENS.DELIVERY_TRACKING} component={DeliveryTrackingScreen} />
          <Stack.Screen name={Constants.SCREENS.DELIVERY_SETTINGS} component={DeliverySettingsScreen} />
          <Stack.Screen name={Constants.SCREENS.PROFILE} component={ProfileScreen} />
          <Stack.Screen name={Constants.SCREENS.DELIVERY_PROFILE_EDIT} component={DeliveryProfileEditScreen} />
          <Stack.Screen name={Constants.SCREENS.DELIVERY_VEHICLE} component={VehicleDetailsScreen} />
          <Stack.Screen name={Constants.SCREENS.DELIVERY_DOCUMENTS} component={DocumentDetailsScreen} />
          <Stack.Screen name={Constants.SCREENS.DELIVERY_BANK_DETAILS} component={BankDetailsScreen} />
          <Stack.Screen name={Constants.SCREENS.PERFORMANCE_REPORT} component={PerformanceReportScreen} />
          <Stack.Screen name={Constants.SCREENS.WORKSHCEDULE} component={WorkScheduleScreen} />
          <Stack.Screen name={Constants.SCREENS.HELP_SUPPORT} component={HelpSupportScreen} />
          <Stack.Screen name={Constants.SCREENS.ABOUT_US} component={AboutUsScreen}/>
          <Stack.Screen name={Constants.SCREENS.RATINGSREVIEWS} component={RatingReviewScreen} />
          <Stack.Screen name={Constants.SCREENS.FEEDBACK} component={FeedbackScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const AppNavigator: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, userType, user, loading } = useSelector((state: RootState) => state.auth);
  
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if user is logged in and get user type
      await dispatch(checkAuthStatus()).unwrap();
      
      // Small delay for splash screen
      setTimeout(() => {
        setIsAppReady(true);
      }, 2000);
    } catch (error) {
      console.error('App initialization error:', error);
      setIsAppReady(true);
    }
  };
 
  if (!isAppReady || loading) {
    return <LoadingScreen />;
  }

  // If user is not authenticated, show auth flow
  if (!isAuthenticated) {
    console.log('User is not authenticated, showing AuthNavigator');
    return <AuthNavigator />;
  }

  // If user is authenticated but no user type is selected
  if (!userType && !user?.userType) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name={Constants.SCREENS.USER_TYPE_SELECTION} 
          component={UserTypeSelectionScreen} 
        />
      </Stack.Navigator>
    );
  }

  // Return the MainNavigator with shared screens
  const currentUserType = userType || user?.userType;
  console.log(`🎯 Navigating to ${currentUserType} interface`);
  return <MainNavigator userType={currentUserType} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    // backgroundColor: Colors.background,
    // backgroundColor: '#FFF',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0b090a',
  },
});

export { AppNavigator, CustomerTabNavigator, StoreTabNavigator, DeliveryPartnerTabNavigator };
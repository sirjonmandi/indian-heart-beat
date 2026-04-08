import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/auth/SplashScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import AgeVerificationScreen from '../screens/auth/AgeVerificationScreen';
import LocationPermissionScreen from '../screens/auth/LocationPermissionScreen';
import PincodeCheckScreen from '../screens/auth/PincodeCheckScreen';
import UserTypeSelectionScreen from '../screens/auth/UserTypeSelectionScreen';
import ShopRegisterScreen from '../screens/auth/ShopRegisterScreen';
import DeliveryPartnerRegisterScreen from '../screens/auth/DeliveryPartnerRegisterScreen';

import { Constants } from '../utils/constants';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';
import ResetPasswordOTPScreen from '@/screens/auth/ResetPasswordOTPScreen';

const Stack = createStackNavigator();

const AuthNavigator: React.FC = () => {
  console.log('AuthNavigator initialized');
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
      initialRouteName={Constants.SCREENS.ONBOARDING}
    >
      <Stack.Screen name={Constants.SCREENS.SPLASH} component={SplashScreen} />
      <Stack.Screen name={Constants.SCREENS.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={Constants.SCREENS.USER_TYPE_SELECTION} component={UserTypeSelectionScreen} />
      <Stack.Screen name={Constants.SCREENS.LOGIN} component={LoginScreen} />
      <Stack.Screen name={Constants.SCREENS.REGISTER} component={RegisterScreen} />
      <Stack.Screen name={Constants.SCREENS.OTP_VERIFICATION} component={OTPVerificationScreen} />
      <Stack.Screen name={Constants.SCREENS.AGE_VERIFICATION} component={AgeVerificationScreen} />
      <Stack.Screen name={Constants.SCREENS.RESET_PASSWORD_OTP} component={ResetPasswordOTPScreen} />
      <Stack.Screen name={Constants.SCREENS.RESET_PASSWORD} component={ResetPasswordScreen} />
      <Stack.Screen name={Constants.SCREENS.LOCATION_PERMISSION} component={LocationPermissionScreen} />
      <Stack.Screen name={Constants.SCREENS.PINCODE_CHECK} component={PincodeCheckScreen} />
      <Stack.Screen name={Constants.SCREENS.SHOP_REGISTER} component={ShopRegisterScreen} />
      <Stack.Screen name={Constants.SCREENS.DELIVERY_PARTNER_REGISTER} component={DeliveryPartnerRegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
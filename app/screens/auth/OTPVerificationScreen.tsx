import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { GlobalStyles } from '../../styles/globalStyles';
import { Constants } from '../../utils/constants';
import { loginSuccess, setAuthenticated, setUserType } from '../../store/slices/authSlice';
import Button from '../../components/common/Button';
import OTPInput from '../../components/auth/OTPInput';
import Header from '../../components/common/Header';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api/authAPI';
import { ApiResponse, ApiError } from '@/services/api';
import CustomAlert from '@/components/common/CustomAlert';

// Define proper types
type RootStackParamList = {
  OTPVerification: { phoneNumber: string };
};

type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isVerified: boolean;
  ageVerified: boolean;
  addresses?: any[];
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    currency: string;
  };
}

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<OTPVerificationRouteProp>();
  const dispatch = useDispatch();
  const { phoneNumber } = route.params;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
  });

  useEffect(() => {
    startResendTimer();
  }, []);

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(30);
    
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const createUserObject = (userData: any): User => ({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    isVerified: Boolean(userData.phone_verified_at),
    ageVerified: false,
    addresses: userData.addresses || [],
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en',
      currency: 'INR',
    }
  });

  const saveAuthData = async (token: string, user: User, userType: string) => {
    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['user', JSON.stringify(user)],
        ['userType', userType],
      ]);
    } catch (error) {
      console.error('Failed to save auth data:', error);
      throw new Error('Failed to save authentication data');
    }
  };

  const getErrorMessage = (error: unknown): string => {
      // if (error instanceof Error) {
      //   return error.message;
      // }
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ApiError;
        return (
          (apiError.response?.data?.errors && 
           Object.values(apiError.response.data.errors)?.[0]?.[0]) ||
          apiError.response?.data?.message ||
          'Something went wrong. Please try again.'
        );
      }
      
      return 'Something went wrong. Please try again.';
    };

  const handleVerifyOTP = async () => {
    if (otp.length !== Constants.OTP_LENGTH) {
      Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      const response: ApiResponse = await authAPI.verifyOTP({ 
        phone: phoneNumber, 
        otp 
      });

      const { data } = response.data;
      const { token, user: userData } = data;

      if (!response.data.success || !token) {
        throw new Error('Verification failed. Please try again.');
      }

      if (!userData.phone_verified_at) {
        throw new Error('Phone number verification is incomplete.');
      }

      const user = createUserObject(userData);
      
      // Save authentication data
      await saveAuthData(token, user, userData.user_type);

      // Update Redux store
      dispatch(setUserType(userData.user_type));
      dispatch(setAuthenticated(true));
      dispatch(loginSuccess({ user, token }));

      // Navigate to next screen (handled by auth state change)
      
    } catch (error) {
      // let errorMessage = 'Something went wrong. Please try again.';
      
      // if (error instanceof Error) {
      //   errorMessage = error.message;
      // } else if (error && typeof error === 'object' && 'response' in error) {
      //   const apiError = error as ApiError;
      //   errorMessage = 
      //     (apiError.response?.data?.errors && 
      //      Object.values(apiError.response.data.errors)?.[0]?.[0]) ||
      //     apiError.response?.data?.message ||
      //     errorMessage;
      // }
      
      // Alert.alert('Verification Failed', errorMessage);
      const errorMessage = getErrorMessage(error);
      // Alert.alert('Verification Failed', errorMessage);
      setAlertConfig({
        visible: true,
        title: 'Verification Failed',
        message: errorMessage,
      });
      console.error('OTP verification error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setResendLoading(true);
    
    try {
      // TODO: Replace with actual resend API call
      await authAPI.resendOTP({ phone: phoneNumber });
      
      setOtp('');
      startResendTimer();
      
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setAlertConfig({
        visible: true,
        title: 'Resend OTP Failed',
        message: errorMessage,
      });
      console.error('Resend OTP error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const isOTPValid = otp.length === Constants.OTP_LENGTH;

  return (
    <>
    <SafeAreaView style={GlobalStyles.container}>
      <Header 
        title="Verify OTP"
        showBack
        onBackPress={() => navigation.goBack()}
        backgroundColor={Colors.white}
        textColor={Colors.textPrimary}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={GlobalStyles.heading2}>Enter OTP</Text>
          <Text style={[GlobalStyles.bodyTextSecondary, styles.subtitle]}>
            We've sent a 6-digit code to +91 {phoneNumber}
          </Text>

          <OTPInput
            length={Constants.OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            style={styles.otpInput}
          />

          <Button
            title="Verify & Continue"
            onPress={handleVerifyOTP}
            loading={loading}
            disabled={!isOTPValid || loading}
            style={styles.verifyButton}
          />

          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity 
                onPress={handleResendOTP}
                disabled={resendLoading}
                style={styles.resendButton}
              >
                <Text style={[
                  styles.resendText, 
                  resendLoading && styles.resendTextDisabled
                ]}>
                  {resendLoading ? 'Sending...' : 'Resend OTP'}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>
                Resend OTP in {resendTimer}s
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
    <View>
      {/* Your other components */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={[
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
            onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
          },
        ]}
        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  subtitle: {
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  otpInput: {
    marginBottom: Spacing.xl,
  },
  verifyButton: {
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendButton: {
    padding: Spacing.sm,
  },
  resendText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  resendTextDisabled: {
    color: Colors.textSecondary,
  },
  timerText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.base,
  },
});

export default OTPVerificationScreen;
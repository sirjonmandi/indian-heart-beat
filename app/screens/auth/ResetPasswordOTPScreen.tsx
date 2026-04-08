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

const ResetPasswordOTPScreen: React.FC = () => {
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
    buttons: [
              {
                text: 'OK',
                color: '#ba181b',
                textColor: '#FFFFFF',
                onPress: () => {
                  setAlertConfig({ ...alertConfig, visible: false });
                },
              },
            ]
  });

  useEffect(() => {
    callForgotPassword();
  }, [phoneNumber]);

  const callForgotPassword = async () => {
    try {
      const response: ApiResponse = await authAPI.forgotPassword({ phone: phoneNumber });
      const { data } = response;
      
      if (!data.success) {
        throw new Error(data.message || 'Forgot password request failed. Please try again.');
      }

      // Handle successful forgot password request
      let message = data.message || 'OTP has been sent to your phone number';
      setAlertConfig({
        ...alertConfig,
        visible: true,
        title: 'Success',
        message: message,
      });
      startResendTimer();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      // Alert.alert('Error', errorMessage);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: errorMessage,
        buttons: [
              {
                text: 'OK',
                color: '#ba181b',
                textColor: '#FFFFFF',
                onPress: () => {
                  setAlertConfig({ ...alertConfig, visible: false });
                  navigation.goBack();
                },
              },
            ]
      });
    }
  };

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

  const getErrorMessage = (error: unknown): string => {
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
      // Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP');
      setAlertConfig({
        visible: true,
        title: 'Invalid OTP',
        message: 'Please enter a valid 6-digit OTP',
        buttons: [
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
            onPress: () => {
              setAlertConfig({ ...alertConfig, visible: false });
            },
          },
        ]
      });
      return;
    }

    setLoading(true);
    
    try {
      const response: ApiResponse = await authAPI.verifyForgotOTP({
        phone: phoneNumber, 
        otp: otp,
      });

      const { data } = response;
      console.log(JSON.stringify(data,null,2));
      if (!data.success) {
        throw new Error(data.message || 'Verification failed. Please try again.');
      }

      if (!data.data.token) {
        throw new Error('No token received. Please try again.');
      }

      navigation.navigate(Constants.SCREENS.RESET_PASSWORD, {
        phoneNumber: phoneNumber,
        token: data.data.token,
      });
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      // Alert.alert('Verification Failed', errorMessage);
      setAlertConfig({
        visible: true,
        title: 'Verification Failed',
        message: errorMessage,
        buttons: [
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
            onPress: () => {
              setAlertConfig({ ...alertConfig, visible: false });
            },
          },
        ]
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
      callForgotPassword();
      
      setOtp('');
      startResendTimer();
      
      // Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
      setAlertConfig({
        visible: true,
        title: 'OTP Sent',
        message: 'A new OTP has been sent to your phone',
        buttons: [
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
            onPress: () => {
              setAlertConfig({ ...alertConfig, visible: false });
            },
          },
        ]
      });
      
    } catch (error) {
      // Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Failed to resend OTP. Please try again.',
        buttons: [
          {
            text: 'OK',
            color: '#ba181b',
            textColor: '#FFFFFF',
            onPress: () => {
              setAlertConfig({ ...alertConfig, visible: false });
            },
          },
        ]
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
        backgroundColor={'#0b090a'}
        textColor={'#ffffff'}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <Text style={[GlobalStyles.heading2, {color: '#ffffff'}]}>Enter OTP</Text>
          <Text style={[GlobalStyles.bodyTextSecondary, styles.subtitle, {color: '#ffffff'}]}>
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
            style={[styles.verifyButton,{backgroundColor:'#ba181b'}]}
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
        buttons={alertConfig.buttons}
        onDismiss={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          // navigation.goBack();
        }}
      />
    </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    backgroundColor:'#0b090a',
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

export default ResetPasswordOTPScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Constants } from '../../utils/constants';
import { authAPI } from '@services/api/authAPI';
import { ApiResponse, ApiError } from '@/services/api/types';
import { loginSuccess, setAuthenticated, setUserType } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import CustomAlert from '@/components/common/CustomAlert';
import { Colors } from '@/styles/colors';

type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { phoneNumber: string };
  OTPVerification: { phoneNumber: string };
};

type LoginScreenNavigationProp = NavigationProp<RootStackParamList>;

interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  status: string;
  ageVerificationStatus: string;
  isVerified: boolean;
  ageVerified: boolean;
  addresses?: any[];
  deviceTokens?: string;
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    language: string;
    currency: string;
  };
}

interface ValidationResult {
  isValid: boolean;
  message?: string;
}

const LoginScreen: React.FC = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: Constants.GOOGLE_KEY,
      offlineAccess: true,
    });
  }, []);

  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const validatePhoneNumber = (phone: string): ValidationResult => {
    if (!phone) return { isValid: false, message: 'Phone number is required' };
    if (phone.length !== 10) return { isValid: false, message: 'Please enter a valid 10-digit phone number' };
    if (!/^\d+$/.test(phone)) return { isValid: false, message: 'Phone number must contain only digits' };
    return { isValid: true };
  };

  const validatePassword = (pass: string): ValidationResult => {
    if (!pass) return { isValid: false, message: 'Password is required' };
    if (pass.length < 6) return { isValid: false, message: 'Password must be at least 6 characters' };
    return { isValid: true };
  };

  const validateForm = (): ValidationResult => {
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) return phoneValidation;
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) return passwordValidation;
    return { isValid: true };
  };

  const createUserObject = (userData: any): User => ({
    id: userData.id,
    firstName: userData.first_name,
    lastName: userData.last_name,
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    dateOfBirth: userData.date_of_birth,
    isVerified: Boolean(userData.phone_verified_at),
    status: userData.status,
    ageVerificationStatus: userData.age_verification_status,
    ageVerified: false,
    addresses: userData.addresses || [],
    deviceTokens: userData.device_tokens || '',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en',
      currency: 'INR',
    },
  });

  const saveAuthData = async (token: string, user: User, userType: string): Promise<void> => {
    try {
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['user', JSON.stringify(user)],
        ['userType', userType],
      ]);
    } catch (error) {
      throw new Error('Failed to save authentication data');
    }
  };

  const handleSuccessfulLogin = async (data: any): Promise<void> => {
    const { token, user: userData } = data;
    const user = createUserObject(userData);
    await saveAuthData(token, user, userData.user_type);
    dispatch(setUserType(userData.user_type));
    dispatch(setAuthenticated(true));
    dispatch(loginSuccess({ user, token }));
  };

  const handleUnverifiedUser = (): void => {
    navigation.navigate('OTPVerification', { phoneNumber });
  };

  const getErrorMessage = (error: unknown): string => {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as ApiError;
      return (
        (apiError.response?.data?.errors &&
          Object.values(apiError.response.data.errors)?.[0]?.[0]) ||
        apiError.response?.data?.message ||
        apiError.errors ||
        'Something went wrong. Please try again.'
      );
    }
    return 'Something went wrong. Please try again.';
  };

  const showError = (title: string, message: string) => {
    setAlertConfig({ visible: true, title, message });
  };

  const handleLogin = async (): Promise<void> => {
    Keyboard.dismiss();
    const validation = validateForm();
    if (!validation.isValid) {
      showError('Validation Error', validation.message ?? '');
      return;
    }
    setLoading(true);
    try {
      const response: ApiResponse = await authAPI.login({ phone: phoneNumber, password });
      const { data } = response.data;
      if (!response.data.success || !data?.token) throw new Error('Login failed. Please try again.');
      if (!data.user?.phone_verified_at) { handleUnverifiedUser(); return; }
      await handleSuccessfulLogin(data);
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 422) { handleUnverifiedUser(); return; }
      }
      showError('Login Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken =
        (userInfo as any).idToken ||
        (userInfo as any)?.data?.idToken ||
        (userInfo as any)?.serverAuthCode ||
        (userInfo as any)?.accessToken;
      if (!idToken) { Alert.alert('Login Failed', 'Token not found from Google Sign-In.'); return; }
      const response = await authAPI.loginWithGoogle({ token: idToken });
      const { data } = response.data;
      if (!response.data.success || !data?.token) { Alert.alert('Login Error', 'Failed to verify in backend'); return; }
      await handleSuccessfulLogin(data);
    } catch (error) {
      Alert.alert('Login Failed', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (): void => {
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      showError('Enter Phone Number', 'Please enter your phone number first');
      return;
    }
    navigation.navigate(Constants.SCREENS.RESET_PASSWORD_OTP, { phoneNumber: `${phoneNumber}` });
  };

  const handlePhoneNumberChange = (text: string): void => {
    setPhoneNumber(text.replace(/[^0-9]/g, '').slice(0, 10));
  };

  const isFormValid = phoneNumber.length === 10 && password.length >= 6;

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Decorative blobs */}
              <View style={styles.blobTopRight} />
              <View style={styles.blobTopRightSmall} />
              <View style={styles.blobBottomLeft} />

              {/* Logo row */}
              <View style={styles.logoRow}>
                <View style={styles.logoMark}>
                  <Icon name="restaurant" size={18} color="#fff" />
                </View>
                <Text style={styles.logoName}>Indian Heart Beat</Text>
              </View>

              {/* Status pill */}
              <View style={styles.pill}>
                <View style={styles.pillDot} />
                <Text style={styles.pillText}>Secure sign-in</Text>
              </View>

              {/* Headline */}
              <Text style={styles.headline}>Welcome back 👋</Text>
              <Text style={styles.subline}>Sign in to your account to continue</Text>

              {/* Feature chips */}
              <View style={styles.chipsRow}>
                {['Fast Delivery', 'Track Orders', 'Exclusive Deals'].map(chip => (
                  <View key={chip} style={styles.chip}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
              </View>

              {/* Phone field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <View style={styles.inputWrap}>
                  <Icon name="phone" size={16} color="#999" style={styles.fieldIcon} />
                  <Text style={styles.phonePrefix}>+91</Text>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="Enter phone number"
                    placeholderTextColor="#c4c4c4"
                    value={phoneNumber}
                    onChangeText={handlePhoneNumberChange}
                    keyboardType="numeric"
                    maxLength={10}
                    returnKeyType="next"
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="telephoneNumber"
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>PASSWORD</Text>
                <View style={styles.inputWrap}>
                  <Icon name="lock" size={16} color="#999" style={styles.fieldIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter password"
                    placeholderTextColor="#c4c4c4"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="password"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    activeOpacity={0.7}
                    disabled={loading}
                  >
                    <Icon
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={18}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot password */}
              <TouchableOpacity
                style={styles.forgotRow}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
                disabled={loading}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Sign In button */}
              <TouchableOpacity
                style={[styles.btnPrimary, (!isFormValid || loading) && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={!isFormValid || loading}
                activeOpacity={0.85}
              >
                <Icon name="login" size={16} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.btnPrimaryText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>

              {/* OR divider */}
              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>OR</Text>
                <View style={styles.orLine} />
              </View>

              {/* Google button */}
              <TouchableOpacity
                style={[styles.btnGoogle, loading && styles.btnDisabled]}
                onPress={handleGoogleLogin}
                activeOpacity={0.85}
                disabled={loading}
              >
                <Icon name="login" size={18} color="#444" style={{ marginRight: 10 }} />
                <Text style={styles.btnGoogleText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  Don't have an account?{' '}
                  <Text
                    style={[styles.footerLink, loading && { opacity: 0.4 }]}
                    onPress={loading ? undefined : () => navigation.navigate('Register')}
                  >
                    Sign Up
                  </Text>
                </Text>
              </View>

              {/* Security note */}
              {/* <View style={styles.securityRow}>
                <Icon name="shield" size={12} color="#ccc" style={{ marginRight: 5 }} />
                <Text style={styles.securityText}>256-bit encrypted · your data is safe</Text>
              </View> */}   
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={[
          {
            text: 'OK',
            color: '#1a1a1a',
            textColor: '#FFFFFF',
            onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
          },
        ]}
        onDismiss={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
  },

  // --- Decorative blobs ---
  blobTopRight: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f5f0ff',
    opacity: 0.6,
  },
  blobTopRightSmall: {
    position: 'absolute',
    top: 40,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e8f4fd',
    opacity: 0.7,
  },
  blobBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff5f0',
    opacity: 0.5,
  },

  // --- Logo ---
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: -0.3,
  },

  // --- Status pill ---
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginBottom: 14,
    gap: 6,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  pillText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
  },

  // --- Headline ---
  headline: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f0f0f',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 6,
  },
  subline: {
    fontSize: 14,
    color: '#888',
    marginBottom: 18,
    letterSpacing: 0.1,
  },

  // --- Feature chips ---
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ebebeb',
    borderRadius: 20,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  chipText: {
    fontSize: 11,
    color: '#777',
    fontWeight: '400',
  },

  // --- Fields ---
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#aaa',
    letterSpacing: 1,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
    paddingVertical: 0,
  },
  phonePrefix: {
    fontSize: 14,
    color: '#aaa',
    fontWeight: '500',
    marginRight: 6,
  },
  phoneInput: {
    // extra left spacing handled by phonePrefix
  },
  eyeBtn: {
    padding: 6,
    marginRight: -4,
  },

  // --- Forgot ---
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: 22,
    marginTop: 4,
  },
  forgotText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // --- Primary button ---
  btnPrimary: {
    height: 52,
    backgroundColor: Colors.primaryBg,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  btnDisabled: {
    opacity: 0.45,
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // --- OR divider ---
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#efefef',
  },
  orText: {
    fontSize: 12,
    color: '#bbb',
    fontWeight: '500',
    letterSpacing: 0.5,
  },

  // --- Google button ---
  btnGoogle: {
    height: 50,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  btnGoogleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },

  // --- Footer ---
  footerRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#aaa',
  },
  footerLink: {
    color: '#1a1a1a',
    fontWeight: '700',
  },

  // --- Security note ---
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 11,
    color: '#bbb',
  },
});

export default LoginScreen;
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

} from 'react-native';

import { useNavigation, NavigationProp } from '@react-navigation/native';

import { useDispatch } from 'react-redux';

import Icon from 'react-native-vector-icons/MaterialIcons';

import LinearGradient from 'react-native-linear-gradient';

import { Constants } from '../../utils/constants';

import { authAPI } from '@services/api/authAPI';

import { ApiResponse, ApiError } from '@/services/api/types';

import { loginSuccess, logout, setAuthenticated, setUserType } from '@/store/slices/authSlice';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { Colors } from '@/styles/colors';

import CustomAlert from '@/components/common/CustomAlert';

// Types

type RootStackParamList = {

  Login: undefined;

  Register: undefined;

  ForgotPassword: { phoneNumber: string };

  OTPVerification: { phoneNumber: string };

};



type LoginScreenNavigationProp = NavigationProp<RootStackParamList>;



interface User {

  id: string;

  firstName:string;

  lastName:string;

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

      webClientId: Constants.GOOGLE_KEY, // from Google Cloud Console

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


  // Validation functions

  const validatePhoneNumber = (phone: string): ValidationResult => {

    if (!phone) {

      return { isValid: false, message: 'Phone number is required' };

    }

    if (phone.length !== 10) {

      return { isValid: false, message: 'Please enter a valid 10-digit phone number' };

    }

    if (!/^\d+$/.test(phone)) {

      return { isValid: false, message: 'Phone number must contain only digits' };

    }

    return { isValid: true };

  };



  const validatePassword = (pass: string): ValidationResult => {

    if (!pass) {

      return { isValid: false, message: 'Password is required' };

    }

    if (pass.length < 6) {

      return { isValid: false, message: 'Password must be at least 6 characters' };

    }

    return { isValid: true };

  };



  const validateForm = (): ValidationResult => {

    const phoneValidation = validatePhoneNumber(phoneNumber);

    if (!phoneValidation.isValid) {

      return phoneValidation;

    }



    const passwordValidation = validatePassword(password);

    if (!passwordValidation.isValid) {

      return passwordValidation;

    }



    return { isValid: true };

  };



  // Helper functions

  const createUserObject = (userData: any): User => ({

    id: userData.id,

    firstName: userData.first_name,

    lastName:userData.last_name,

    name: userData.name,

    email: userData.email,

    phone: userData.phone,

    dateOfBirth:userData.date_of_birth,

    isVerified: Boolean(userData.phone_verified_at),

    status: userData.status,

    ageVerificationStatus:userData.age_verification_status,

    ageVerified: false,

    addresses: userData.addresses || [],

    deviceTokens: userData.device_tokens || '',

    preferences: {

      notifications: true,

      darkMode: false,

      language: 'en',

      currency: 'INR',

    }

  });



  const saveAuthData = async (token: string, user: User, userType: string): Promise<void> => {

    try {

      // console.log('================ handleSuccessfulLogin ====================');

      // console.log('Login Success:', JSON.stringify(user, null, 2));

      // console.log('====================================');

      

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



  const handleSuccessfulLogin = async (data: any): Promise<void> => {

    const { token, user: userData } = data;

    const user = createUserObject(userData);

    

    await saveAuthData(token, user, userData.user_type);

    

    // Update Redux store

    dispatch(setUserType(userData.user_type));

    dispatch(setAuthenticated(true));

    dispatch(loginSuccess({ user, token }));

  };



  const handleUnverifiedUser = (): void => {

    navigation.navigate('OTPVerification', { 

      phoneNumber: phoneNumber 

    });

  };



  const getErrorMessage = (error: unknown): string => {

    

    if (error && typeof error === 'object' && 'response' in error) {

      const apiError = error as ApiError;

      return (

        (apiError.response?.data?.errors && 

         Object.values(apiError.response.data.errors)?.[0]?.[0]) ||

        apiError.response?.data?.message || apiError.errors ||

        'Something went wrong. Please try again.'

      );

    }

    

    return 'Something went wrong. Please try again.';

  };



  const handleLogin = async (): Promise<void> => {

    // Dismiss keyboard

    Keyboard.dismiss();

    

    // Validate form

    const validation = validateForm();

    if (!validation.isValid) {

      // Alert.alert('Validation Error', validation.message);
      let errorMessage = validation.message;
      setAlertConfig({
        visible: true,
        title: 'Verification Failed',
        message: errorMessage,
      });
      return;

    }



    setLoading(true);

    

    try {

      const response: ApiResponse = await authAPI.login({ 

        phone: phoneNumber, 

        password: password 

      });



      const { data } = response.data;

      

      if (!response.data.success || !data?.token) {

        throw new Error('Login failed. Please try again.');

      }



      // Check if phone is verified

      if (!data.user?.phone_verified_at) {

        handleUnverifiedUser();

        return;

      }



      // console.log('=============== login response =====================');

      // console.log(JSON.stringify(data,null,2));

      // console.log('====================================');

      await handleSuccessfulLogin(data);

      

    } catch (error) {

      console.error('Login error:', error);

      

      // Handle specific error cases

      if (error && typeof error === 'object' && 'response' in error) {

        const apiError = error as ApiError;

        

        // If user exists but not verified (422 status)

        if (apiError.response?.status === 422) {

          handleUnverifiedUser();

          return;

        }

      }

      

      const errorMessage = getErrorMessage(error);

      // Alert.alert('Login Failed', errorMessage);

      setAlertConfig({
        visible: true,
        title: 'Verification Failed',
        message: errorMessage,
      });

    } finally {

      setLoading(false);

    }

  };





  // const handleGoogleLogin = async () => {

  //   try {

  //     setLoading(true);

      

  //     await GoogleSignin.hasPlayServices();

      

  //     const userInfo = await GoogleSignin.signIn();



  //     // Different versions/platforms may return token in different places.

  //     // Prefer `idToken` (top-level) as returned by `@react-native-google-signin/google-signin`.

  //     const idToken = (userInfo as any).idToken || (userInfo as any)?.data?.idToken || (userInfo as any)?.serverAuthCode || (userInfo as any)?.accessToken;



  //     if (!idToken) {

  //       console.warn('Google sign-in returned no token', userInfo);

  //       // throw new Error('Token not found from Google Sign-In.');

  //       Alert.alert('Login Failed', 'Token not found from Google Sign-In.');

  //     }



  //     // send idToken (or serverAuthCode/accessToken fallback) to your backend

  //     const response = await authAPI.loginWithGoogle({ token: idToken });



  //     const { data } = response.data;



  //     if (!response.data.success || !data?.token) {

  //       console.error('Backend rejected Google login', response.data);

  //       // throw new Error('Login failed. Please try again.');

  //       Alert.alert('login Error','Failed to verify in backend');

  //     }



  //     await handleSuccessfulLogin(data);

  //   } catch (error) {

  //     console.log('Google login error:', JSON.stringify(error, null, 2));

  //     const errorMessage = getErrorMessage(error);

  //     Alert.alert('Login Failed', errorMessage);

  //   } finally {

  //     setLoading(false);

  //   }

  // };



  const handleForgotPassword = (): void => {

    const phoneValidation = validatePhoneNumber(phoneNumber);

    if (!phoneValidation.isValid) {

      // Alert.alert('Enter Phone Number', 'Please enter your phone number first');
      setAlertConfig({
        visible: true,
        title: 'Enter Phone Number',
        message: 'Please enter your phone number first',
      });
      return;

    }

    // navigation.navigate(Constants.SCREENS.RESET_PASSWORD);

    // Alert.alert('Forgot Password','This Feature is under development!');

    navigation.navigate(Constants.SCREENS.RESET_PASSWORD_OTP, {

      phoneNumber: `${phoneNumber}`

    });

  };



  const handlePhoneNumberChange = (text: string): void => {

    // Only allow numbers and limit to 10 digits

    const numericText = text.replace(/[^0-9]/g, '').slice(0, 10);

    setPhoneNumber(numericText);

  };



  const isFormValid = phoneNumber.length === 10 && password.length >= 6;



  return (
    <>
      <SafeAreaView style={styles.container}>

      <LinearGradient

        colors={[Colors.background, Colors.background]}

        style={styles.gradient}

        start={{ x: 0, y: 0 }}

        end={{ x: 1, y: 1 }}

      >

        <KeyboardAvoidingView 

          style={styles.keyboardAvoidingView}

          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}

          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}

        >

          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

            <ScrollView 

              contentContainerStyle={styles.scrollViewContent}

              showsVerticalScrollIndicator={false}

              keyboardShouldPersistTaps="handled"

            >

              {/* Header */}

              <View style={styles.header}>

                <View style={styles.logoContainer}>
                  <Image 
                    source={require('../../../assets/images/app_logo.png')} 
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                  {/* <Text style={styles.logoEmoji}>🍺</Text>
                  <Text style={styles.appName}>BeerGo</Text> */}

                </View>

                <Text style={styles.welcomeText}>Welcome Back!</Text>

                <Text style={styles.subtitleText}>Sign in to continue</Text>

              </View>



              {/* Form */}

              <View style={styles.formContainer}>

                {/* Phone Number Input */}

                <View style={styles.inputContainer}>

                  <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />

                  <TextInput

                    style={styles.input}

                    placeholder="Enter phone number"

                    placeholderTextColor="#999"

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

                  <Text style={styles.phonePrefix}>+91</Text>

                </View>



                {/* Password Input */}

                <View style={styles.inputContainer}>

                  <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />

                  <TextInput

                    style={styles.input}

                    placeholder="Enter password"

                    placeholderTextColor="#999"

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

                    style={styles.eyeIcon}

                    activeOpacity={0.7}

                    disabled={loading}

                  >

                    <Icon 

                      name={showPassword ? 'visibility-off' : 'visibility'} 

                      size={20} 

                      color="#666" 

                    />

                  </TouchableOpacity>

                </View>



                {/* Forgot Password */}

                <TouchableOpacity 

                  style={styles.forgotPassword}

                  onPress={handleForgotPassword}

                  activeOpacity={0.7}

                  disabled={loading}

                >

                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>

                </TouchableOpacity>



                {/* Login Button */}

                <TouchableOpacity 

                  style={[

                    styles.loginButton, 

                    (!isFormValid || loading) && styles.disabledButton

                  ]}

                  onPress={handleLogin}

                  disabled={!isFormValid || loading}

                  activeOpacity={0.8}

                >

                  <Text style={styles.loginButtonText}>

                    {loading ? 'Signing In...' : 'Login'}

                  </Text>

                </TouchableOpacity>



                {/* OR Divider */}

                {/* <View style={styles.orContainer}>

                  <View style={styles.orLine} />

                  <Text style={styles.orText}>OR</Text>

                  <View style={styles.orLine} />

                </View> */}



                {/* Google Login Button */}

                {/* <TouchableOpacity 

                  style={[styles.googleButton, loading && styles.disabledButton]} 

                  onPress={handleGoogleLogin}

                  activeOpacity={0.8}

                  disabled={loading}

                >

                  <Icon name="login" size={20} color="#2C2C2C" style={styles.googleIcon} />

                  <Text style={styles.googleButtonText}>Continue with Google</Text>

                </TouchableOpacity> */}

              </View>



              {/* Footer */}

              {/* <View style={styles.footer}>

                <Text style={styles.footerText}>

                  Don't have an account?{' '}

                  <Text 

                    style={[

                      styles.signUpText,

                      loading && styles.disabledText

                    ]}

                    onPress={loading ? undefined : () => navigation.navigate('Register')}

                  >

                    Sign Up

                  </Text>

                </Text>

              </View> */}

            </ScrollView>

          </TouchableWithoutFeedback>

        </KeyboardAvoidingView>

      </LinearGradient>

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

    backgroundColor: Colors.background,

  },

  gradient: {

    flex: 1,

  },

  keyboardAvoidingView: {

    flex: 1,

  },

  scrollViewContent: {

    flexGrow: 1,

    justifyContent: 'center',

    paddingHorizontal: 30,

    paddingVertical: 20,

  },

  header: {

    alignItems: 'center',

    marginBottom: 40,

  },

  logoContainer: {

    alignItems: 'center',

    marginBottom: 20,

  },

  logoEmoji: {

    fontSize: 60,

    marginBottom: 10,

  },

  appName: {

    fontSize: 32,

    fontWeight: 'bold',

    color: '#2C2C2C',

    textShadowColor: 'rgba(0, 0, 0, 0.1)',

    textShadowOffset: { width: 1, height: 1 },

    textShadowRadius: 2,

  },

  welcomeText: {

    fontSize: 24,

    fontWeight: 'bold',

    color: Colors.textWhite,

    marginBottom: 8,

  },

  subtitleText: {

    fontSize: 16,

    color: Colors.textWhite,

    opacity: 0.8,

  },

  formContainer: {

    marginBottom: 30,

  },

  inputContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    backgroundColor: Colors.backgroundSecondary,

    borderRadius: 12,

    paddingHorizontal: 15,

    paddingVertical: 15,

    marginBottom: 15,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

    borderWidth: 1,

    borderColor: 'rgba(0, 0, 0, 0.05)',

  },

  inputIcon: {

    marginRight: 12,

  },

  input: {

    flex: 1,

    fontSize: 16,

    color: Colors.textColor,

    paddingVertical: 0,

    minHeight: 20,

  },

  phonePrefix: {

    fontSize: 16,

    color: '#666',

    marginLeft: 8,

  },

  eyeIcon: {

    padding: 8,

    marginRight: -8,

  },

  forgotPassword: {

    alignSelf: 'flex-end',

    marginBottom: 25,

    padding: 5,

  },

  forgotPasswordText: {

    color: Colors.textColor,

    fontSize: 14,

    fontWeight: '500',

    textDecorationLine: 'underline',

  },

  loginButton: {

    backgroundColor: Colors.primary,

    paddingVertical: 16,

    borderRadius: 12,

    alignItems: 'center',

    marginBottom: 20,

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 4 },

    shadowOpacity: 0.2,

    shadowRadius: 8,

    elevation: 5,

  },

  disabledButton: {

    backgroundColor: Colors.primary,

    opacity: 0.6,

  },

  loginButtonText: {

    color: '#FFFFFF',

    fontSize: 18,

    fontWeight: 'bold',

  },

  orContainer: {

    flexDirection: 'row',

    alignItems: 'center',

    marginVertical: 20,

  },

  orLine: {

    flex: 1,

    height: 1,

    backgroundColor: '#2C2C2C',

    opacity: 0.3,

  },

  orText: {

    marginHorizontal: 15,

    color: '#2C2C2C',

    fontSize: 14,

    fontWeight: '500',

  },

  googleButton: {

    backgroundColor: '#FFFFFF',

    paddingVertical: 16,

    borderRadius: 12,

    alignItems: 'center',

    flexDirection: 'row',

    justifyContent: 'center',

    borderWidth: 2,

    borderColor: '#2C2C2C',

    shadowColor: '#000',

    shadowOffset: { width: 0, height: 2 },

    shadowOpacity: 0.1,

    shadowRadius: 4,

    elevation: 3,

  },

  googleIcon: {

    marginRight: 8,

  },

  googleButtonText: {

    color: '#2C2C2C',

    fontSize: 16,

    fontWeight: 'bold',

  },

  footer: {

    alignItems: 'center',

    marginTop: 20,

    paddingBottom: 20,

  },

  footerText: {

    fontSize: 14,

    color: '#2C2C2C',

  },

  signUpText: {

    color: '#2C2C2C',

    fontWeight: 'bold',

    textDecorationLine: 'underline',

  },

  disabledText: {

    opacity: 0.5,

  },

  logoImage:{
    width: 150,
    height: 150,
    marginBottom: 16,
  }

});



export default LoginScreen;
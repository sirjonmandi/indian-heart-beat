import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { GlobalStyles } from '../../styles/globalStyles';
import { Constants } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Header from '../../components/common/Header';
import { validateEmail, validatePhone, validateName, validatePassword } from '../../utils/validation';
import { authAPI } from '@/services/api/authAPI';
import { ApiResponse, ApiError } from '@/services/api';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  referralCode: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  password_confirmation?: string;
  referralCode?: string;
}
interface validatePasswordErrors{
  errors:string[];
  isValid?:boolean;
}
const RegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password:'',
    password_confirmation:'',
    referralCode: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = 'Please enter a valid first name';
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!validateName(formData.lastName)) {
      newErrors.lastName = 'Please enter a valid last name';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if(!formData.password.trim()){
      newErrors.password = 'Password is required';
    }else if(!formData.password_confirmation){
      newErrors.password_confirmation = 'Password confirmation is required';
    }else if(formData.password !== formData.password_confirmation){
      newErrors.password = 'password is not match';
      newErrors.password_confirmation = 'password is not match';
    }else {
      const res:validatePasswordErrors = validatePassword(formData.password);
      if (!res.isValid) {
        newErrors.password = res.errors[0];
      }
    }

    // Terms acceptance
    if (!termsAccepted) {
      Alert.alert('Terms Required', 'Please accept the Terms & Conditions to continue');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({}); // clear previous errors if any

    try {
      const res: ApiResponse = await authAPI.register(formData);
      const data = res.data;

      if (data.success && data.data?.phone) {
        navigation.navigate(Constants.SCREENS.OTP_VERIFICATION, {
          phoneNumber: data.data.phone,
          isRegistration: true,
          userData: data.data
        });
      } else {
        console.error("Registration API error:", data);
        throw new Error(data.message || 'Registration failed');
      }
    } catch (error: any) {
      if (error?.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const newErrors: FormErrors = {};

        Object.keys(apiErrors).forEach((field) => {
          newErrors[field as keyof FormErrors] = apiErrors[field][0];
        });

        setErrors(newErrors);
      } else {
        const apiMessage =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)?.[0]?.[0] ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
        Alert.alert('Registration Failed', apiMessage || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigation.navigate(Constants.SCREENS.LOGIN);
  };

  const handleShopRegistration = () => {
    navigation.navigate(Constants.SCREENS.SHOP_REGISTER);
  };

  const handleDeliveryPartnerRegistration = () => {
    navigation.navigate(Constants.SCREENS.DELIVERY_PARTNER_REGISTER);
  };

  const handleTermsPress = () => {
    // Navigate to Terms & Conditions screen
    Alert.alert('Terms & Conditions', 'Terms & Conditions screen would open here');
  };

  const handlePrivacyPress = () => {
    // Navigate to Privacy Policy screen
    Alert.alert('Privacy Policy', 'Privacy Policy screen would open here');
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <Header 
        title="Create Account"
        showBack
        onBackPress={() => navigation.goBack()}
        backgroundColor={Colors.white}
        textColor={Colors.textPrimary}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.logoText}>BeerGo</Text>
                </View>
              </View>
              <Text style={GlobalStyles.heading2}>Join BeerGo</Text>
              <Text style={[GlobalStyles.bodyTextSecondary, styles.subtitle]}>
                Get your favorite drinks delivered in 10 minutes
              </Text>
            </View>

            {/* Registration Type Selection */}
            <View style={styles.registrationTypeSection}>
              <Text style={styles.sectionTitle}>I want to register as:</Text>
              <View style={styles.typeButtonsContainer}>
                <TouchableOpacity style={[styles.typeButton, styles.selectedTypeButton]}>
                  <Icon name="person" size={24} color={Colors.primary} />
                  <Text style={[styles.typeButtonText, styles.selectedTypeButtonText]}>
                    Customer
                  </Text>
                  <Text style={styles.typeButtonDescription}>
                    Order drinks & get delivery
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.typeButton}
                  onPress={handleShopRegistration}
                >
                  <Icon name="store" size={24} color={Colors.textSecondary} />
                  <Text style={styles.typeButtonText}>Shop Owner</Text>
                  <Text style={styles.typeButtonDescription}>
                    Sell drinks & manage orders
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.typeButton}
                  onPress={handleDeliveryPartnerRegistration}
                >
                  <Icon name="sports-motorsports" size={24} color={Colors.textSecondary} />
                  <Text style={styles.typeButtonText}>Delivery Partner</Text>
                  <Text style={styles.typeButtonDescription}>
                    Deliver drinks & earn money
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              {/* Name Fields */}
              <View style={styles.nameRow}>
                <Input
                  label="First Name"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChangeText={(text) => handleInputChange('firstName', text)}
                  error={errors.firstName}
                  style={[styles.nameInput, { marginRight: Spacing.sm }]}
                  autoCapitalize="words"
                />
                <Input
                  label="Last Name"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChangeText={(text) => handleInputChange('lastName', text)}
                  error={errors.lastName}
                  style={[styles.nameInput, { marginLeft: Spacing.sm }]}
                  autoCapitalize="words"
                />
              </View>

              {/* Email Field */}
              <Input
                label="Email Address"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={(text) => handleInputChange('email', text)}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              {/* Phone Field */}
              <Input
                label="Phone Number"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChangeText={(text) => handleInputChange('phone', text)}
                error={errors.phone}
                keyboardType="phone-pad"
                maxLength={10}
                autoComplete="tel"
              />

              {/* Password */}
              <View style={{flex:1}}>
              <Input
                label="Password"
                placeholder="Enter Password"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
                error={errors.password}
                secureTextEntry={!showPassword}
                />
                {/* <TouchableOpacity   
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Icon 
                    name={showPassword ? 'visibility-off' : 'visibility'} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity> */}
              </View>

              {/* Password Confirmation */}
              <Input
                label="Password Confirmation"
                placeholder="Enter Password Confirmation"
                value={formData.password_confirmation}
                onChangeText={(text) => handleInputChange('password_confirmation', text)}
                error={errors.password_confirmation}
                secureTextEntry={!showPassword}
              />

              {/* Referral Code Field */}
              <Input
                label="Referral Code (Optional)"
                placeholder="Enter referral code"
                value={formData.referralCode}
                onChangeText={(text) => handleInputChange('referralCode', text)}
                error={errors.referralCode}
                autoCapitalize="characters"
              />

              {/* Checkboxes */}
              <View style={styles.checkboxSection}>
                {/* Terms & Conditions */}
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                >
                  <View style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxChecked
                  ]}>
                    {termsAccepted && (
                      <Icon name="check" size={16} color={Colors.white} />
                    )}
                  </View>
                  <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxText}>
                      I agree to the{' '}
                      <Text style={styles.linkText} onPress={handleTermsPress}>
                        Terms & Conditions
                      </Text>
                      {' '}and{' '}
                      <Text style={styles.linkText} onPress={handlePrivacyPress}>
                        Privacy Policy
                      </Text>
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Marketing Consent */}
                <TouchableOpacity 
                  style={styles.checkboxRow}
                  onPress={() => setMarketingConsent(!marketingConsent)}
                >
                  <View style={[
                    styles.checkbox,
                    marketingConsent && styles.checkboxChecked
                  ]}>
                    {marketingConsent && (
                      <Icon name="check" size={16} color={Colors.white} />
                    )}
                  </View>
                  <View style={styles.checkboxTextContainer}>
                    <Text style={styles.checkboxText}>
                      I want to receive promotional offers and updates
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Age Verification Notice */}
              <View style={styles.ageNotice}>
                <Icon name="info" size={20} color={Colors.warning} />
                <Text style={styles.ageNoticeText}>
                  You must be {Constants.MINIMUM_AGE}+ years old to use this app. 
                  Age verification will be required after registration.
                </Text>
              </View>

              {/* Register Button */}
              <Button
                title="Create Customer Account"
                onPress={handleRegister}
                loading={loading}
                disabled={!termsAccepted}
                style={styles.registerButton}
              />

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={GlobalStyles.bodyTextSecondary}>
                  Already have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleLogin}>
                  <Text style={styles.loginText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  logoContainer: {
    marginBottom: Spacing.lg,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  registrationTypeSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  typeButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  typeButton: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  selectedTypeButton: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  selectedTypeButtonText: {
    color: Colors.primary,
  },
  typeButtonDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  formSection: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.sm,
  },
  nameInput: {
    flex: 1,
  },
  checkboxSection: {
    marginVertical: Spacing.lg,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  checkboxText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },
  ageNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '10',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    marginBottom: Spacing.lg,
  },
  ageNoticeText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  registerButton: {
    marginBottom: Spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  loginText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
});

export default RegisterScreen;
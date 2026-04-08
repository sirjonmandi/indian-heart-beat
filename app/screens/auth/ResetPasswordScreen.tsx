import { Colors } from '@/styles/colors';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authAPI } from '@/services/api/authAPI';
import CustomAlert from '@/components/common/CustomAlert';

// Define proper types
type RootStackParamList = {
  OTPVerification: { phoneNumber: string; token: string };
};
type OTPVerificationRouteProp = RouteProp<RootStackParamList, 'OTPVerification'>;
const PasswordResetPage = () => {

  const navigation = useNavigation();
  const route = useRoute<OTPVerificationRouteProp>();
  const { phoneNumber, token } = route.params;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
    };
  };

  const handlePasswordChange = (password) => {
    setNewPassword(password);
    const validation = validatePassword(password);
    
    if (password && !validation.isValid) {
      setErrors(prev => ({ ...prev, newPassword: 'Password does not meet requirements' }));
    } else {
      setErrors(prev => ({ ...prev, newPassword: '' }));
    }

    // Check confirm password match if it exists
    if (confirmPassword && confirmPassword !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleConfirmPasswordChange = (password) => {
    setConfirmPassword(password);
    
    if (password !== newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
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

  const handleResetPassword = async () => {
    // Validate inputs
    let newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword).isValid) {
      newErrors.newPassword = 'Password does not meet requirements';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await authAPI.resetPassword({
        phone: phoneNumber,
        key: token, //Use the actual key/token from your flow
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      
      if (!response.data.success) {
        console.log(response);
        throw new Error(response.data.message || 'Reset failed. Please try again.');
      }

      // Clear form
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      
      Alert.alert(
        'Success',
        (response.data.message || 'Your password has been reset successfully.') + ' Please log in with your new password.',
        [{ text: 'OK', onPress: () => {
          navigation.dispatch(CommonActions.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          }));
        }}]
      );
      
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      Alert.alert('Verification Failed', errorMessage);
      console.error('OTP verification error:', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(newPassword);

  return (
    <>
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {token ? (<ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Icon name="lock" size={48} color={Colors.primary} />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your new password below</Text>
        </View>

        <View style={styles.form}>
          {/* New Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={[styles.passwordContainer, errors.newPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter new password"
                placeholderTextColor="#8E8E93"
                value={newPassword}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <Icon name="visibility-off" size={20} color="#8E8E93" />
                ) : (
                  <Icon name="visibility" size={20} color="#8E8E93" />
                )}
              </TouchableOpacity>
            </View>
            {errors.newPassword ? (
              <Text style={styles.errorText}>{errors.newPassword}</Text>
            ) : null}
          </View>

          {/* Password Requirements */}
          {newPassword ? (
            <View style={styles.requirementsContainer}>
              <Text style={styles.requirementsTitle}>Password Requirements:</Text>
              <RequirementItem 
                text="At least 8 characters" 
                met={passwordValidation.minLength} 
              />
              <RequirementItem 
                text="One uppercase letter" 
                met={passwordValidation.hasUpperCase} 
              />
              <RequirementItem 
                text="One lowercase letter" 
                met={passwordValidation.hasLowerCase} 
              />
              <RequirementItem 
                text="One number" 
                met={passwordValidation.hasNumbers} 
              />
              <RequirementItem 
                text="One special character" 
                met={passwordValidation.hasSpecialChar} 
              />
            </View>
          ) : null}

          {/* Confirm Password Field */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={[styles.passwordContainer, errors.confirmPassword ? styles.inputError : null]}>
              <TextInput
                style={styles.textInput}
                placeholder="Confirm new password"
                placeholderTextColor="#8E8E93"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <Icon name="visibility-off" size={20} color="#8E8E93" />
                ) : (
                  <Icon name="visibility" size={20} color="#8E8E93" />
                )}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={[
              styles.resetButton,
              (!newPassword || !confirmPassword || Object.values(errors).some(error => error)) && styles.resetButtonDisabled
            ]}
            onPress={handleResetPassword}
            disabled={isLoading || !newPassword || !confirmPassword || Object.values(errors).some(error => error)}
          >
            <Text style={[
              styles.resetButtonText,
              (!newPassword || !confirmPassword || Object.values(errors).some(error => error)) && styles.resetButtonTextDisabled
            ]}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>) : (
        <View style={styles.header}>
          <Text style={styles.title}>Invalid Token</Text>
          <Text style={styles.subtitle}>The password reset link is invalid or has expired.</Text>
        </View>
        )}
    </KeyboardAvoidingView>
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

const RequirementItem = ({ text, met }) => (
  <View style={styles.requirementItem}>
    {met ? (
      <Icon name="check-circle" size={16} color="#34C759" />
    ) : (
      <Icon name="cancel" size={16} color="#FF3B30" />
    )}
    <Text style={[styles.requirementText, met && styles.requirementTextMet]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    // elevation: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    minHeight: 48,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1C1E',
  },
  eyeButton: {
    padding: 12,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginTop: 6,
  },
  requirementsContainer: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
    color: '#8E8E93',
    marginLeft: 8,
  },
  requirementTextMet: {
    color: '#34C759',
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  resetButtonDisabled: {
    backgroundColor: Colors.primaryLight,
    shadowOpacity: 0,
    elevation: 0,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButtonTextDisabled: {
    color: Colors.primaryBg,
  },
});

export default PasswordResetPage;
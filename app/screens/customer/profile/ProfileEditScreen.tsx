import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { customerAPI } from '@/services/api/customerAPI';
import { ApiResponse } from '@/services/api';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
import Header from '@/components/common/Header';
import { Colors } from '@/styles/colors';
import { useAlert } from '@/components/context/AlertContext';

interface Profile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
}

const ProfileEditScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const { showAlert } = useAlert();

  const localAlert = (title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      buttons: [
        {
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor:Colors.btnTextPrimary,
          onPress: onPress || (() => {}),
        },
      ],
    });
  };
  const [formData, setFormData] = useState<Profile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const isFocused = useIsFocused();

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'phone' ? (value ? parseInt(value) : 0) : value
    }));
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.firstName?.trim()) {
      localAlert('Validation Error', 'First name is required');
      return false;
    }
    if (!formData.lastName?.trim()) {
      localAlert('Validation Error', 'Last name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      localAlert('Validation Error', 'Email is required');
      return false;
    }
    if (!validateEmail(formData.email)) {
      localAlert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const res: ApiResponse = await customerAPI.updateProfile(formData);
      const { success, message, data } = res.data;
      if (success && message) {
        await updateUser(data);
        localAlert('Success', message, () => navigation.goBack());
      }
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)?.[0]?.[0] ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update profile. Please try again.';
      localAlert('Error', apiMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const updateUser = async (data: any) => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData !== null) {
        const user = JSON.parse(userData);
        user.firstName = data.profile.first_name;
        user.lastName = data.profile.last_name;
        user.name = data.name;
        user.email = data.email;
        await AsyncStorage.setItem('user', JSON.stringify(user));
        dispatch(setUser(user));
        console.log('User updated successfully');
      }
    } catch (error) {
      console.error('Error updating user in AsyncStorage', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res: ApiResponse = await customerAPI.getProfile();
        const { success, data } = res.data;
        if (success && data) {
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone ? String(data.phone) : '',
            dateOfBirth: data.dateOfBirth || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [isFocused]);

  const renderInput = ({
    label,
    field,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'words',
    editable = true,
    icon,
    note
  }: {
    label: string;
    field: keyof Profile;
    placeholder: string;
    keyboardType?: any;
    autoCapitalize?: any;
    editable?: boolean;
    icon: string;
    note?: string;
  }) => {
    const isFieldFocused = focusedField === field;
    const hasValue = formData[field] && String(formData[field]).length > 0;

    return (
      <View style={styles.inputContainer}>
        <View style={styles.labelContainer}>
          <Icon name={icon} size={20} color="#999" />
          <Text style={styles.inputLabel}>
            {label} {editable ? '*' : ''}
          </Text>
        </View>
        <View style={[
          styles.inputWrapper,
          isFieldFocused && styles.inputWrapperFocused,
          !editable && styles.inputWrapperDisabled,
        ]}>
          <TextInput
            style={[styles.input, !editable && styles.inputDisabled]}
            placeholder={placeholder}
            placeholderTextColor="#666"
            value={String(formData[field] || '')}
            onChangeText={(text) => updateField(field, text)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
          />
          {hasValue && editable && (
            <TouchableOpacity
              onPress={() => updateField(field, '')}
              style={styles.clearButton}
            >
              <Icon name="clear" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        {note && (
          <Text style={styles.inputNote}>{note}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      {/* <Header title="Edit Profile" /> */}
      <LinearGradient
        colors={[Colors.background, Colors.background]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#ba181b', '#e5383b']}
                style={styles.avatar}
              >
                <Icon name="person" size={48} color={Colors.textWhite} />
              </LinearGradient>
              <TouchableOpacity style={styles.cameraButton}>
                <Icon name="camera-alt" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.avatarText}>
              Tap to change profile picture
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            {renderInput({
              label: 'First Name',
              field: 'firstName',
              placeholder: 'Enter your first name',
              icon: 'person-outline'
            })}

            {renderInput({
              label: 'Last Name',
              field: 'lastName',
              placeholder: 'Enter your last name',
              icon: 'person-outline'
            })}

            {renderInput({
              label: 'Email Address',
              field: 'email',
              placeholder: 'Enter your email address',
              keyboardType: 'email-address',
              autoCapitalize: 'none',
              icon: 'email'
            })}

            {renderInput({
              label: 'Phone Number',
              field: 'phone',
              placeholder: 'Your phone number',
              editable: false,
              icon: 'phone',
              note: 'Phone number cannot be changed. Contact support if needed.'
            })}

            {renderInput({
              label: 'Date of Birth',
              field: 'dateOfBirth',
              placeholder: 'DD/MM/YYYY',
              editable: false,
              icon: 'cake',
              autoCapitalize: 'none'
            })}
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Icon name="info-outline" size={20} color="#999" />
              <Text style={styles.infoText}>
                Changes to your profile will be reflected across all your orders and communications.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.disabledButton]}
            onPress={saveProfile}
            disabled={isSaving}
          >
            <View style={styles.saveButtonContent}>
              {isSaving && <Icon name="hourglass-empty" size={20} color="#fff" />}
              <Text style={[styles.saveButtonText, isSaving && { marginLeft: 8 }]}>
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textColor,
  },

  // ScrollView
  content: {
    flex: 1,
  },

  // Avatar
  avatarSection: {
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    paddingVertical: 32,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#16191d',
  },
  avatarText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },

  // Form card
  formSection: {
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textWhite,
    marginBottom: 20,
  },

  // Input
  inputContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textColor,
    marginLeft: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2d33',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundSecondary,
  },
  inputWrapperFocused: {
    borderColor: Colors.primary,
  },
  inputWrapperDisabled: {
    backgroundColor: Colors.background,
    borderColor: '#1a1d21',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.textColor,
  },
  inputDisabled: {
    color: '#666',
  },
  clearButton: {
    padding: 4,
  },
  inputNote: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontStyle: 'italic',
  },

  // Info card
  infoSection: {
    // backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    // elevation: 2,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.3,
    // shadowRadius: 4,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#999',
    lineHeight: 20,
    marginLeft: 12,
  },

  // Bottom save bar
  bottomContainer: {
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ProfileEditScreen;
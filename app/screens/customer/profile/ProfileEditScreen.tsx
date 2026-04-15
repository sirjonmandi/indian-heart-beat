import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { customerAPI } from '@/services/api/customerAPI';
import { ApiResponse } from '@/services/api';
import { useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/slices/authSlice';
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
          textColor: Colors.btnTextPrimary,
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
      [field]: field === 'phone' ? (value ? parseInt(value) : 0) : value,
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
        (error?.response?.data?.errors &&
          Object.values(error.response.data.errors)?.[0]?.[0]) ||
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
            dateOfBirth: data.dateOfBirth || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, [isFocused]);

  const fullName = [formData.firstName, formData.lastName].filter(Boolean).join(' ');
  const handle = fullName
    ? '@' + fullName.toLowerCase().replace(/\s+/g, '')
    : '@user';

  const renderInput = ({
    label,
    field,
    placeholder,
    keyboardType = 'default',
    autoCapitalize = 'words',
    editable = true,
  }: {
    label: string;
    field: keyof Profile;
    placeholder: string;
    keyboardType?: any;
    autoCapitalize?: any;
    editable?: boolean;
  }) => {
    const isFieldFocused = focusedField === field;
    const hasValue = formData[field] && String(formData[field]).length > 0;

    return (
      <View
        style={[
          styles.inputBox,
          isFieldFocused && styles.inputBoxFocused,
          !editable && styles.inputBoxDisabled,
        ]}
      >
        <Text style={[styles.floatingLabel, !editable && styles.floatingLabelDisabled]}>
          {label}
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, !editable && styles.inputDisabled]}
            placeholder={placeholder}
            placeholderTextColor="#C0C0B8"
            value={String(formData[field] || '')}
            onChangeText={text => updateField(field, text)}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            editable={editable}
          />
          {hasValue && editable && (
            <TouchableOpacity onPress={() => updateField(field, '')} style={styles.clearBtn}>
              <Icon name="clear" size={18} color="#AAAAAA" />
            </TouchableOpacity>
          )}
          {!editable && (
            <Icon name="lock-outline" size={16} color="#CCCCCC" style={styles.lockIcon} />
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="keyboard-arrow-left" size={20} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 34 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Icon name="person" size={44} color="#fff" />
              </View>
              <TouchableOpacity style={styles.cameraBtn}>
                <Icon name="camera-alt" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.displayName}>{fullName || 'Your Name'}</Text>
            <Text style={styles.displayHandle}>{formData.dateOfBirth || 'N/A'}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {renderInput({
              label: 'Full name',
              field: 'firstName',
              placeholder: 'Parves Ahamad',
            })}

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                {renderInput({
                  label: 'Gender',
                  field: 'lastName',
                  placeholder: 'Male',
                })}
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                {renderInput({
                  label: 'Birthday',
                  field: 'dateOfBirth',
                  placeholder: '05-01-2001',
                  editable: false,
                  autoCapitalize: 'none',
                })}
              </View>
            </View>

            {renderInput({
              label: 'Phone number',
              field: 'phone',
              placeholder: '(+880) 1759263000',
              editable: false,
              keyboardType: 'phone-pad',
            })}

            {renderInput({
              label: 'Email',
              field: 'email',
              placeholder: 'example@email.com',
              keyboardType: 'email-address',
              autoCapitalize: 'none',
            })}

            {/* <View
              style={[
                styles.inputBox,
                styles.inputBoxDisabled,
              ]}
            >
              <Text style={[styles.floatingLabel, styles.floatingLabelDisabled]}>
                User name
              </Text>
              <View style={styles.inputRow}>
                <Text style={[styles.input, styles.inputDisabled]}>{handle}</Text>
                <Icon name="lock-outline" size={16} color="#CCCCCC" style={styles.lockIcon} />
              </View>
            </View> */}
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
            onPress={saveProfile}
            disabled={isSaving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundSecondary,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#E8E8E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.2,
  },

  /* Scroll */
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  /* Avatar */
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 6,
  },
  avatarWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarCircle: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: '#A8A8A0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F0',
  },
  displayName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  displayHandle: {
    fontSize: 13,
    color: '#888880',
  },

  /* Form */
  form: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
  },

  /* Input Box — floating label style */
  inputBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E2',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 64,
    justifyContent: 'center',
  },
  inputBoxFocused: {
    borderColor: '#1A1A1A',
  },
  inputBoxDisabled: {
    backgroundColor: '#FAFAFA',
    borderColor: '#EFEFEB',
  },
  floatingLabel: {
    fontSize: 12,
    color: '#AAAAAA',
    fontWeight: '400',
    marginBottom: 2,
  },
  floatingLabelDisabled: {
    color: '#C8C8C0',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  inputDisabled: {
    color: '#AAAAAA',
  },
  clearBtn: {
    paddingLeft: 8,
  },
  lockIcon: {
    marginLeft: 6,
  },

  /* Bottom Bar */
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 0.5,
    borderTopColor: '#E8E8E2',
  },
  saveBtn: {
    backgroundColor: Colors.primaryBg,
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: '#F5F5F0',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default ProfileEditScreen;
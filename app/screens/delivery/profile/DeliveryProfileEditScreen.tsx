import { deliveryAPI } from '@/services/api/deliveryAPI';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '@/store/slices/deliverySlice';
const dummyProfile = {
  user:{
    first_name:'',
    last_name:'',
    phone:'',
    email:'',
    date_of_birth:'',
    avatar:'',
  }
};

interface RootState {
  delivery: {
    profile?: typeof dummyProfile;
  };
}
const DeliveryProfileEditScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [isSaving, setIsSaving] = useState(false);
  const deliveryState = useSelector((state: RootState) => state.delivery);
  const { profile:userProfile } = deliveryState || {};
  const [profile, setProfile] = useState({
    firstName: userProfile?.user?.first_name || '',
    lastName: userProfile?.user?.last_name || '',
    phone: userProfile?.user?.phone || '',
    email: userProfile?.user?.email || '',
    dateOfBirth: userProfile?.user?.date_of_birth || '',
    profileImage: userProfile?.user?.avatar || null,
  });

  const handleImageUpload = () => {
    Alert.alert('notice',"This feature is comming soon !");
    // In real app, use expo-image-picker or react-native-image-picker
    // Alert.alert(
    //   'Change Profile Picture',
    //   'Choose an option',
    //   [
    //     { text: 'Take Photo', onPress: () => console.log('Camera opened') },
    //     { text: 'Choose from Gallery', onPress: () => console.log('Gallery opened') },
    //     { text: 'Cancel', style: 'cancel' },
    //   ]
    // );
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () =>{
    if (!profile.firstName?.trim()) {
          Alert.alert('Validation Error', 'First name is required');
          return false;
        }
        if (!profile.lastName?.trim()) {
          Alert.alert('Validation Error', 'Last name is required');
          return false;
        }
        if (!profile.email?.trim()) {
          Alert.alert('Validation Error', 'Email is required');
          return false;
        }
        if (!validateEmail(profile.email)) {
          Alert.alert('Validation Error', 'Please enter a valid email address');
          return false;
        }
        return true;
  }

  const handleSave = async() => {

    
    // console.log('Saved profile:', profile);

    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const response = await deliveryAPI.updateProfile({
        first_name:profile.firstName,
        last_name:profile.lastName,
      })
      // console.log('====================================');
      // console.log(JSON.stringify(response,null,2));
      // console.log('====================================');
      if (!response.data.status) {
        console.log('================ Error while updating profile ====================');
        console.log(JSON.stringify(response,null,2));
        console.log('====================================');
      }
      await dispatch(fetchProfile()).unwrap();
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error:any) {
      const apiMessage =
              error?.response?.data?.errors &&
              Object.values(error.response.data.errors)?.[0]?.[0] ||
              error?.response?.data?.message ||
              error?.message ||
              'Failed to update profile. Please try again.';
            Alert.alert('Error', apiMessage);
    } finally{
      setIsSaving(false);
    }
    // setTimeout(() => {
    //   setIsSaving(false);
    // }, 2000);
    
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() },
      ]
    );
  };  

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Edit Profile 
            </Text>
            <Text style={styles.partnerCode}>
              Update your personal information
            </Text>
          </View>
        </View>

      <View style={styles.content}>
        {/* Header */}
        {/* <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
        </View> */}
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {profile.profileImage ? (
              <Image
                source={{ uri: profile.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Icon name="person" size={60} color="#fff" />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleImageUpload}
            >
              <Icon name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.imageHint}>Tap to change photo</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="person-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(text) =>
                  setProfile({ ...profile, firstName: text })
                }
                placeholder="Enter first name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <View style={styles.inputWrapper}>
              <Icon
                name="person-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              /> 
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(text) =>
                  setProfile({ ...profile, lastName: text })
                }
                placeholder="Enter last name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() =>
                Alert.alert('Email Change', 'Email cannot be changed. Contact support if needed.')
              }
            >
              <Icon
                name="mail-outline"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(text) =>
                  setProfile({ ...profile, email: text })
                }
                placeholder="Enter email"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={false}
              />
            </TouchableOpacity>
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() =>
                Alert.alert('Phone Noumber Change', 'Phone number cannot be changed. Contact support if needed.')
              }
            >
              <Icon
                name="call"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={profile.phone}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                editable={false}
              />
            </TouchableOpacity>
          </View>

          {/* Date of Birth */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            <TouchableOpacity
              style={styles.inputWrapper}
              onPress={() =>
                Alert.alert('Date Change', 'Date of Birth cannot be changed. Contact support if needed.')
              }
            >
              <Icon
                name="event"
                size={20}
                color="#9CA3AF"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={profile.dateOfBirth}
                editable={false}
                placeholder="Select date of birth"
                placeholderTextColor="#9CA3AF"
              />
              <Icon
                name="keyboard-arrow-down"
                size={20}
                color="#9CA3AF"
                style={styles.inputIconRight}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveButton,
              isSaving && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
    paddingVertical: 16,
  },
  header: {
    marginBottom: 30,
    marginTop: Platform.OS === 'ios' ? 50 : 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  imageHint: {
    fontSize: 14,
    color: '#6B7280',
  },
  formContainer: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputIconRight: {
    marginLeft: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#1F2937',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },

  profileHeader: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    textTransform: 'capitalize',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  partnerCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default DeliveryProfileEditScreen;
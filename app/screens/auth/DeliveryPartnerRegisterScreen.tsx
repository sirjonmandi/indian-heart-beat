import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Image,
} from 'react-native';
import Button from '../../components/common/Button';
import Header from '../../components/common/Header';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';
import { GlobalStyles } from '@/styles/globalStyles';
import { validateEmail, validatePhone, validateName, validatePassword } from '../../utils/validation';
// Import image picker
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import FreeMapLocationPicker from '@/components/common/FreeMapLocationPicker';
import { authAPI } from '@/services/api/authAPI';
const DeliveryPartnerRegistration = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: User Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    password: '',
    password_confirmation: '',
    
    // Step 2: Vehicle Details
    vehicle_type: '',
    vehicle_number: '',
    vehicle_model: '',
    vehicle_color: '',
    vehicle_rc_image: null,
    vehicle_insurance_images: [],
    
    // Step 3: User Documents
    aadhar_number: '',
    aadhar_images: [],
    driving_license_number: '',
    driving_license_images: [],
    latitude: '',
    longitude: '',
    shift: '',

    referral_code: '',

    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',

    liveImage:null,
  });

  interface validatePasswordErrors{
  errors:string[];
  isValid?:boolean;
  }
  
  const [errors, setErrors] = useState(formData);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showShiftPicker, setShowShiftPicker] = useState(false);
  const [showVehicleTypePicker, setShowVehicleTypePicker] = useState(false);
  const [loading,setLoading] = useState<boolean>(false);
  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  function validateDate(dateStr) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(dateStr);
    return (
      date.getFullYear() === year &&
      date.getMonth() + 1 === month &&
      date.getDate() === day
    );
  }

  function getAge(dateStr) {
    const birthDate = new Date(dateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!validateName(formData.firstName)) {
      newErrors.firstName = 'Please enter a valid first name';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!validateName(formData.lastName)) {
          newErrors.lastName = 'Please enter a valid last name';
    }

    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    else if (!validatePhone(formData.phone)) {
          newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date_of_birth)) newErrors.date_of_birth = 'Date of birth must be in YYYY-MM-DD format';
    else if (!validateDate(formData.date_of_birth)) {
      newErrors.date_of_birth = 'Please enter a valid date of birth';
    }
    else {
      const age = getAge(formData.date_of_birth);
      if (age < 0){
        newErrors.date_of_birth = 'Please enter a valid date of birth';
      } else if (age < 18) {
        newErrors.date_of_birth = 'You must be at least 18 years old';
      } else if (age > 60) {
         if (age > 100){
          newErrors.date_of_birth = 'Please enter a valid date of birth';
        } else {
          newErrors.date_of_birth = 'You must be less than 60 years old';
          }
        }
    }

    if (!formData.gender) newErrors.gender = 'Gender is required';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (!formData.password_confirmation) newErrors.password_confirmation = 'Confirm password is required';
    else if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';
    else {
          const res:validatePasswordErrors = validatePassword(formData.password);
          if (!res.isValid) {
            newErrors.password = res.errors[0];
          }
      }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.vehicle_type) newErrors.vehicle_type = 'Vehicle type is required';
    if (!formData.vehicle_number.trim()) newErrors.vehicle_number = 'Vehicle number is required';
    if (!formData.vehicle_model.trim()) newErrors.vehicle_model = 'Vehicle model is required';
    if (!formData.vehicle_color.trim()) newErrors.vehicle_color = 'Vehicle color is required';
    if (!formData.vehicle_rc_image) newErrors.vehicle_rc_image = 'Vehicle RC image is required';
    if (formData.vehicle_insurance_images.length === 0) newErrors.vehicle_insurance_images = 'At least one insurance image is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};

    if (!formData.aadhar_number.trim()) newErrors.aadhar_number = 'Aadhar number is required';
    else if (!/^\d{12}$/.test(formData.aadhar_number)) newErrors.aadhar_number = 'Aadhar number must be 12 digits';
    if (formData.aadhar_images.length === 0) newErrors.aadhar_images = 'Aadhar images are required';
    else if (formData.aadhar_images.length < 2) newErrors.aadhar_images = 'upload both side of your aadhar card 2 images required';
    if (!formData.driving_license_number.trim()) newErrors.driving_license_number = 'Driving license number is required';
    else if (!/^\d{15}$/.test(formData.driving_license_number)) newErrors.driving_license_number = 'Driving license number must be 15 digits';
    if (formData.driving_license_images.length === 0) newErrors.driving_license_images = 'Driving license images are required';
    else if (formData.driving_license_images.length < 2) newErrors.driving_license_images = 'upload both side of your driving license 2 images required';

    if (!formData.latitude || !formData.longitude) newErrors.latitude = 'Service location is required';
    if (!formData.shift) newErrors.shift = 'Shift selection is required';
    else if (!['day', 'flexible', 'night'].includes(formData.shift)) newErrors.shift = 'Invalid shift selected';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep4 = () => {
    const newErrors = {};
    if (!formData.emergency_contact_name.trim()) newErrors.emergency_contact_name = 'Emergency contact name is required';
    if (!formData.emergency_contact_phone.trim()) newErrors.emergency_contact_phone = 'Emergency contact number is required';
    else if (!/^\d{10}$/.test(formData.emergency_contact_phone)) newErrors.emergency_contact_phone = 'Emergency contact number must be 10 digits';
    if (!formData.emergency_contact_relation.trim()) newErrors.emergency_contact_relation = 'Relation with emergency contact is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const validateStep5 = () => {
    const newErrors = {};
    if (!formData.liveImage) newErrors.liveImage = 'Live image is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleNext = () => {
    let isValid = false;
    
    if (currentStep === 1) {
      isValid = validateStep1();
    } else if (currentStep === 2) {
      isValid = validateStep2();
    } else if (currentStep === 3) {
      isValid = validateStep3();
    } else if (currentStep === 4) {
      isValid = validateStep4();
    } else if (currentStep === 5) {
      isValid = validateStep5();
    }
    
    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (isValid && currentStep === 5) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLocationChange = (lat: string, lng: string) => {
    updateFormData('latitude', lat);
    updateFormData('longitude', lng);
  };

  const handleSubmit = () => {
    setLoading(true);
    // Create FormData object
    const submitFormData = new FormData();
    // Add regular form fields
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      
      // Skip image fields - we'll handle them separately
      if ([
        'vehicle_rc_image',
        'vehicle_insurance_images',
        'aadhar_images',
        'driving_license_images',
        'liveImage'
      ].includes(key)) {
        return;
      }
      
      // Add non-image fields
      if (value !== null && value !== undefined && value !== '') {
          submitFormData.append(key, value.toString());
        }
      });
      
      // Handle single image fields
      if (formData.vehicle_rc_image) {
        const image = formData.vehicle_rc_image;
        submitFormData.append('vehicle_rc_image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || 'vehicle_rc_image.jpg'
        } as any);
      }
      
      if (formData.liveImage) {
        const image = formData.liveImage;
        submitFormData.append('liveImage', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || 'live_image.jpg'
        } as any);
      }
      
      // Handle multiple image fields
      if (formData.vehicle_insurance_images && formData.vehicle_insurance_images.length > 0) {
        formData.vehicle_insurance_images.forEach((image, index) => {
          submitFormData.append(`vehicle_insurance_images[${index}]`, {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.name || `vehicle_insurance_${index}.jpg`
          } as any);
        });
      }
      
      if (formData.aadhar_images && formData.aadhar_images.length > 0) {
        formData.aadhar_images.forEach((image, index) => {
          submitFormData.append(`aadhar_images[${index}]`, {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.name || `aadhar_${index}.jpg`
          } as any);
        });
      }
      
      if (formData.driving_license_images && formData.driving_license_images.length > 0) {
        formData.driving_license_images.forEach((image, index) => {
          submitFormData.append(`driving_license_images[${index}]`, {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.name || `driving_license_${index}.jpg`
          } as any);
        });
      }
      
      console.log('FormData prepared for submission');
      
      // Submit with proper headers
      authAPI.deliveryRegister(submitFormData)
        .then(response => {
          console.log('Registration successful:', response.data);
          const { message } = response.data;
          const { phone } = response.data.data;
          navigation.navigate('OTPVerification', {
            phoneNumber: phone
          });
          Alert.alert('Success', message || 'Registration submitted successfully!');
        })
        .catch(error => {
          console.error('Registration failed:', error);
          // Handle specific error cases
          const errorMessage = getErrorMessage(error);
          Alert.alert('Registration Failed', errorMessage);
        });
    setLoading(false);
  };

  const getErrorMessage = (error: unknown): string => {
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error;
        return (
          (apiError.response?.data?.errors && 
           Object.values(apiError.response.data.errors)?.[0]?.[0]) ||
          apiError.response?.data?.message ||
          'Something went wrong. Please try again.'
        );
      }
      
      return 'Something went wrong. Please try again.';
    };

  const getImageLimits = (field) => {
    switch(field) {
      case 'vehicle_rc_image': return { max: 1, current: formData.vehicle_rc_image ? 1 : 0 };
      case 'vehicle_insurance_images': return { max: 5, current: formData.vehicle_insurance_images.length };
      case 'aadhar_images': return { max: 2, current: formData.aadhar_images.length };
      case 'driving_license_images': return { max: 2, current: formData.driving_license_images.length };
      case 'liveImage': return { max: 1, current: formData.liveImage ? 1 : 0 };
      default: return { max: 1, current: 0 };
    }
  };

  const showImagePicker = (field, multiple) => {
  console.log('====================================');
  console.log('image picker is opened for field:', field);
  console.log('====================================');
  const limits = getImageLimits(field);
  if (limits.current >= limits.max) {
    Alert.alert('Limit Reached', `You can only upload ${limits.max} image(s) for this field.`);
    return;
  }

  // For live image, only show camera option
  if (field === 'liveImage') {
    openCamera(field, multiple);
    return;
    }

    Alert.alert(
      'Select Image',
      'Choose an option to add image',
      [
        { text: 'Camera', onPress: () => openCamera(field, multiple) },
        { text: 'Gallery', onPress: () => openGallery(field, multiple) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Request camera permission for Android
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Open camera
  const openCamera = async (field, multiple) => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    launchCamera(options, (response) => handleImageResponse(response, field, multiple));
  };

  // Open gallery
  const openGallery = (field, multiple) => {
    const limits = getImageLimits(field);
    const remainingSlots = limits.max - limits.current;

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: multiple ? remainingSlots : 1,
    };

    launchImageLibrary(options, (response) => handleImageResponse(response, field, multiple));
  };

  // Handle image picker response
  const handleImageResponse = (response: ImagePickerResponse,field: string, multiple: boolean) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const newImages = response.assets
        .filter(asset => asset.uri)
        .map(asset => ({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `${field}_${Date.now()}.jpg`,
          size: asset.fileSize
        }));


      if (multiple) {
        // For multiple image fields
        const currentImages = formData[field] || [];
        const updatedImages = [...currentImages, ...newImages];
        updateFormData(field, updatedImages);
        Alert.alert('Success', `${newImages.length} image(s) added successfully`);
      } else {
        // For single image fields
        updateFormData(field, newImages[0]);
        Alert.alert('Success', `Image selected successfully`);
      }
    }
  };

  const handleFileUpload = (field, multiple = false) => {

    // Check limits using the passed field parameter (not state)
    const limits = getImageLimits(field);
    if (limits.current >= limits.max) {
      Alert.alert('Limit Reached', `You can only upload ${limits.max} image(s) for this field.`);
      return;
    }

    showImagePicker(field, multiple);
  };

  const removeImage = (field, index = null) => {
    if (index !== null) {
      // Remove specific image from array
      const currentImages = formData[field] || [];
      const updatedImages = currentImages.filter((_, i) => i !== index);
      updateFormData(field, updatedImages);
    } else {
      // Remove single image
      updateFormData(field, null);
    }
    Alert.alert('Success', 'Image removed successfully');
  };

  const replaceImage = (field, index = null) => {
    
    if (field === 'liveImage') {
      openCamera(field, false);
      return;
    }

    Alert.alert(
      'Replace Image',
      'Choose an option to replace image',
      [
        { text: 'Camera', onPress: () => {
          if (index !== null) {
            // Replace specific image in array
            const currentImages = [...formData[field]];
            launchCamera({
              mediaType: 'photo',
              quality: 0.8,
              maxWidth: 1024,
              maxHeight: 1024,
            }, (response) => {
              if (response.assets && response.assets.length > 0) {
                currentImages[index] = {
                  name: `${field}_${Date.now()}.jpg`,
                  uri: response.assets[0].uri
                };
                updateFormData(field, currentImages);
                Alert.alert('Success', 'Image replaced successfully');
              }
            });
          } else {
            openCamera(field, false);
          }
        }},
        { text: 'Gallery', onPress: () => {
          if (index !== null) {
            // Replace specific image in array
            const currentImages = [...formData[field]];
            launchImageLibrary({
              mediaType: 'photo',
              quality: 0.8,
              maxWidth: 1024,
              maxHeight: 1024,
              selectionLimit: 1,
            }, (response) => {
              if (response.assets && response.assets.length > 0) {
                currentImages[index] = {
                  name: `${field}_${Date.now()}.jpg`,
                  uri: response.assets[0].uri
                };
                updateFormData(field, currentImages);
                Alert.alert('Success', 'Image replaced successfully');
              }
            });
          } else {
            openGallery(field, false);
          }
        }},
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const renderImageList = (field, images) => {
    if (!images || images.length === 0) return null;
    
    return (
      <View style={{ marginTop: 10 }}>
        {images.map((image, index) => {
          const imageUri = typeof image === 'string' ? image : image.uri;
          
          return (
            <View key={index} style={{ 
              flexDirection: 'row', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              padding: 10,
              marginBottom: 5,
              borderRadius: 5
            }}>
              <Image source={{ uri: imageUri }} style={{ width: 50, height: 50 }} />
              <Text style={{ flex: 1, fontSize: 12, color:'#059669' }}>{image.name}</Text>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  onPress={() => replaceImage(field, index)}
                  style={{ padding: 5, marginRight: 5 }}
                >
                  <Icon name="edit" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => removeImage(field, index)}
                  style={{ padding: 5 }}
                >
                  <Icon name="delete" size={16} color={Colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSingleImage = (field, image) => {
    if (!image) return null;
    
    return (
      <View style={{ marginTop: 10 }}>
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          padding: 10,
          borderRadius: 5
        }}>
          <Image source={{ uri: image.uri }} style={{ width: 50, height: 50 }} />
          <Text style={{ flex: 1, fontSize: 12, color:'#059669'}}>{image.name}</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity 
              onPress={() => replaceImage(field)}
              style={{ padding: 5, marginRight: 5 }}
            >
              <Icon name="edit" size={16} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => removeImage(field)}
              style={{ padding: 5 }}
            >
              <Icon name="delete" size={16} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const steps = [
    { title: 'Personal Details', icon: 'person' },
    { title: 'Vehicle Information', icon: 'motorcycle' },
    { title: 'Document & Location', icon: 'folder' },
    { title: 'Emergency Contact', icon: 'verified-user' },
    { title: 'Capture Your Live Image', icon: 'photo' },
  ];
  
  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressSteps}>
        {steps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={[
              styles.stepCircle,
              currentStep >= index + 1 ? styles.stepCircleActive : styles.stepCircleInactive
            ]}>
              <Text style={[
                styles.stepNumber,
                currentStep >= index + 1 ? styles.stepNumberActive : styles.stepNumberInactive
              ]}>
                <Icon 
                    name={step.icon} 
                    size={16} 
                    color={index + 1 <= currentStep ? Colors.primaryBg : Colors.textSecondary} 
                />
              </Text>
            </View>
            {index < 4 && (
              <View style={[
                styles.stepLine,
                currentStep > index + 1 ? styles.stepLineActive : styles.stepLineInactive
              ]} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.stepTitleContainer}>
        <Text style={styles.stepTitle}>
          {steps[currentStep - 1].title}
        </Text>
        <Text style={styles.stepSubtitle}>Step {currentStep} of 5</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>First Name *</Text>
          <TextInput
            style={[styles.input, errors.firstName && styles.inputError]}
            value={formData.firstName}
            onChangeText={(value) => updateFormData('firstName', value)}
            placeholder="Enter first name"
            placeholderTextColor={'#9E9E9E'}
          />
          {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Last Name *</Text>
          <TextInput
            style={[styles.input, errors.lastName && styles.inputError]}
            value={formData.lastName}
            onChangeText={(value) => updateFormData('lastName', value)}
            placeholder="Enter last name"
            placeholderTextColor={'#9E9E9E'}
          />
          {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email *</Text>
        <View style={[styles.inputWithIcon, errors.email && styles.inputError]}>
          <Text style={styles.inputIcon}>
            <Icon 
                name="email" 
                size={16} 
                color={Colors.textSecondary} 
            />
          </Text>
          <TextInput
            style={[styles.inputWithIconField,]}
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor={'#9E9E9E'}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone Number *</Text>
        <View style={[styles.inputWithIcon, errors.phone && styles.inputError]}>
          <Text style={styles.inputIcon}>
            <Icon 
                name="phone" 
                size={16} 
                color={Colors.textSecondary} 
            />
          </Text>
          <TextInput
            style={[styles.inputWithIconField,]}
            value={formData.phone}
            onChangeText={(value) => updateFormData('phone', value)}
            placeholder="Enter 10-digit phone number"
            keyboardType="phone-pad"
            maxLength={10}
            placeholderTextColor={'#9E9E9E'}
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Date of Birth *</Text>
        <View style={[styles.inputWithIcon, errors.date_of_birth && styles.inputError]}>
          <Text style={styles.inputIcon}>
            <Icon 
                name="calendar-month" 
                size={16} 
                color={Colors.textSecondary} 
            />
          </Text>
          <TextInput
            value={formData.date_of_birth}
            style={[styles.inputWithIconField,]}
            onChangeText={(value) =>{
              // Remove any non-digit characters
              let cleaned = value.replace(/\D/g, '');

              // Auto-insert hyphens as user types
              if (cleaned.length > 4 && cleaned.length <= 6) {
                cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4);
              } else if (cleaned.length > 6) {
                cleaned = cleaned.slice(0, 4) + '-' + cleaned.slice(4, 6) + '-' + cleaned.slice(6, 8);
              }

              // Limit to YYYY-MM-DD format
              if (cleaned.length > 10) {
                cleaned = cleaned.slice(0, 10);
              }

              updateFormData('date_of_birth', cleaned);
            }}
            keyboardType="numeric"
            placeholder="YYYY-MM-DD"
            placeholderTextColor={'#9E9E9E'}
          />
        </View>
        {errors.date_of_birth && <Text style={styles.errorText}>{errors.date_of_birth}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Gender *</Text>
        <TouchableOpacity 
          style={[styles.picker, errors.gender && styles.inputError]}
          onPress={() => setShowGenderPicker(!showGenderPicker)}
        >
          {/* <Icon 
                name="person" 
                size={16} 
                color={Colors.textSecondary} 
            /> */}
          <Text style={formData.gender ? styles.pickerText : styles.pickerPlaceholder}>
            {formData.gender || 'Select gender'}
          </Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {showGenderPicker && (
          <View style={styles.pickerOptions}>
            {['Male', 'Female', 'Other'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerOption}
                onPress={() => {
                  updateFormData('gender', option.toLowerCase());
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
      </View>
    
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password *</Text>
        <View style={[styles.inputWithIcon, errors.password && styles.inputError]}>
          <Text style={styles.inputIcon}>
            <Icon 
                name="lock" 
                size={16} 
                color={Colors.textSecondary} 
            />
          </Text>
          <TextInput
            style={[styles.inputWithIconField]}
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            placeholder="Enter password (min. 8 characters)"
            secureTextEntry
            placeholderTextColor={'#9E9E9E'}
          />
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password *</Text>
        <View style={[styles.inputWithIcon, errors.password_confirmation && styles.inputError]}>
          <Text style={styles.inputIcon}>
            <Icon 
                name="lock" 
                size={16} 
                color={Colors.textSecondary} 
            />
          </Text>
          <TextInput
            style={[styles.inputWithIconField,]}
            value={formData.password_confirmation}
            onChangeText={(value) => updateFormData('password_confirmation', value)}
            placeholder="Confirm your password"
            secureTextEntry
            placeholderTextColor={'#9E9E9E'}
          />
        </View>
        {errors.password_confirmation && <Text style={styles.errorText}>{errors.password_confirmation}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Referral Code (Optional)</Text>
        <TextInput
          style={[styles.input, errors.referral_code && styles.inputError]}
          value={formData.referral_code}
          onChangeText={(value) => updateFormData('referral_code', value)}
          placeholder="Enter referral code"
          placeholderTextColor={'#9E9E9E'}
        />
        {errors.referral_code && <Text style={styles.errorText}>{errors.referral_code}</Text>}
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vehicle Type *</Text>
        <TouchableOpacity
          style={[styles.picker, errors.vehicle_type && styles.inputError]}
          onPress={() => setShowVehicleTypePicker(!showVehicleTypePicker)}
        >
          <Text style={formData.vehicle_type ? styles.pickerText : styles.pickerPlaceholder}>
            {formData.vehicle_type || 'Select vehicle type'}
          </Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {showVehicleTypePicker && (
          <View style={styles.pickerOptions}>
            {['Bicycle', 'Motorcycle', 'Scooter', 'Car','Van'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerOption}
                onPress={() => {
                  updateFormData('vehicle_type', option.toLowerCase());
                  setShowVehicleTypePicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.vehicle_type && <Text style={styles.errorText}>{errors.vehicle_type}</Text>}
      </View>

      <View style={styles.row}>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Vehicle Number *</Text>
          <TextInput
            style={[styles.input, errors.vehicle_number && styles.inputError]}
            value={formData.vehicle_number}
            onChangeText={(value) => updateFormData('vehicle_number', value.toUpperCase())}
            placeholder="e.g., MH12AB1234"
            autoCapitalize="characters"
            placeholderTextColor={'#9E9E9E'}
          />
          {errors.vehicle_number && <Text style={styles.errorText}>{errors.vehicle_number}</Text>}
        </View>
        <View style={styles.halfWidth}>
          <Text style={styles.label}>Vehicle Model *</Text>
          <TextInput
            style={[styles.input, errors.vehicle_model && styles.inputError]}
            value={formData.vehicle_model}
            onChangeText={(value) => updateFormData('vehicle_model', value)}
            placeholder="e.g., Honda Activa"
            placeholderTextColor={'#9E9E9E'}
          />
          {errors.vehicle_model && <Text style={styles.errorText}>{errors.vehicle_model}</Text>}
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vehicle Color *</Text>
        <TextInput
          style={[styles.input, errors.vehicle_color && styles.inputError]}
          value={formData.vehicle_color}
          onChangeText={(value) => updateFormData('vehicle_color', value)}
          placeholder="e.g., Red, Blue, Black"
          placeholderTextColor={'#9E9E9E'}
        />
        {errors.vehicle_color && <Text style={styles.errorText}>{errors.vehicle_color}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vehicle RC Image * (1 image)</Text>
        <TouchableOpacity
          style={[styles.uploadArea, errors.vehicle_rc_image && styles.uploadAreaError]}
          onPress={() => handleFileUpload('vehicle_rc_image', false)}
        >
          <Text style={styles.uploadIcon}>
              <Icon 
                  name="camera-enhance" 
                  size={40} 
                  color={Colors.textSecondary} 
              />
          </Text>
          {formData.vehicle_rc_image ? (
            <Text style={styles.uploadSuccessText}>✓ {formData.vehicle_rc_image.uri}</Text>
          ) : (
            <Text style={styles.uploadText}>Tap to upload vehicle RC image</Text>
          )}
        </TouchableOpacity>
        {renderSingleImage('vehicle_rc_image', formData.vehicle_rc_image)}
        {errors.vehicle_rc_image && <Text style={styles.errorText}>{errors.vehicle_rc_image}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Vehicle Insurance Images * (up to 5 images)</Text>
        <TouchableOpacity
          style={[styles.uploadArea, errors.vehicle_insurance_images && styles.uploadAreaError]}
          onPress={() => handleFileUpload('vehicle_insurance_images', true)}
        >
          <Text style={styles.uploadIcon}>
            <Icon 
              name="upload" 
              size={40} 
              color={Colors.textSecondary} 
            />
          </Text>
          {formData.vehicle_insurance_images.length > 0 ? (
            <Text style={styles.uploadSuccessText}>✓ {formData.vehicle_insurance_images.length}/5 image(s) uploaded</Text>
          ) : (
            <Text style={styles.uploadText}>Tap to upload insurance images (up to 5 files)</Text>
          )}
        </TouchableOpacity>
        {renderImageList('vehicle_insurance_images', formData.vehicle_insurance_images)}
        {errors.vehicle_insurance_images && <Text style={styles.errorText}>{errors.vehicle_insurance_images}</Text>}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Aadhar Number *</Text>
        <TextInput
          style={[styles.input, errors.aadhar_number && styles.inputError]}
          value={formData.aadhar_number}
          onChangeText={(value) => updateFormData('aadhar_number', value.replace(/\D/g, ''))}
          placeholder="Enter 12-digit Aadhar number"
          keyboardType="numeric"
          maxLength={12}
          placeholderTextColor={'#9E9E9E'}
        />
        {errors.aadhar_number && <Text style={styles.errorText}>{errors.aadhar_number}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Aadhar Images * (2 images - front & back)</Text>
        <TouchableOpacity
          style={[styles.uploadArea, errors.aadhar_images && styles.uploadAreaError]}
          onPress={() => handleFileUpload('aadhar_images', true)}
        >
          <Text style={styles.uploadIcon}>
            <Icon 
                  name="camera-enhance" 
                  size={40} 
                  color={Colors.textSecondary} 
              />
          </Text>
          {formData.aadhar_images.length > 0 ? (
            <Text style={styles.uploadSuccessText}>✓ {formData.aadhar_images.length}/2 image(s) uploaded</Text>
          ) : (
            <Text style={styles.uploadText}>Tap to upload Aadhar front & back images</Text>
          )}
        </TouchableOpacity>
        {renderImageList('aadhar_images', formData.aadhar_images)}
        {errors.aadhar_images && <Text style={styles.errorText}>{errors.aadhar_images}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Driving License Number *</Text>
        <TextInput
          style={[styles.input, errors.driving_license_number && styles.inputError]}
          value={formData.driving_license_number}
          onChangeText={(value) => updateFormData('driving_license_number', value.toUpperCase())}
          placeholder="Enter driving license number"
          autoCapitalize="characters"
           maxLength={15}
           placeholderTextColor={'#9E9E9E'}
        />
        {errors.driving_license_number && <Text style={styles.errorText}>{errors.driving_license_number}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Driving License Images * (2 images - front & back)</Text>
        <TouchableOpacity
          style={[styles.uploadArea, errors.driving_license_images && styles.uploadAreaError]}
          onPress={() => handleFileUpload('driving_license_images', true)}
        >
          <Text style={styles.uploadIcon}>
            <Icon 
                  name="camera-enhance" 
                  size={40} 
                  color={Colors.textSecondary} 
              />
          </Text>
          {formData.driving_license_images.length > 0 ? (
            <Text style={styles.uploadSuccessText}>✓ {formData.driving_license_images.length}/2 image(s) uploaded</Text>
          ) : (
            <Text style={styles.uploadText}>Tap to upload Driving License front & back images</Text>
          )}
        </TouchableOpacity>
        {renderImageList('driving_license_images', formData.driving_license_images)}
        {errors.driving_license_images && <Text style={styles.errorText}>{errors.driving_license_images}</Text>}
      </View>

      <View style={styles.inputContainer}>
          <FreeMapLocationPicker
            mapTitle = "Set Your Service Location"
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
            label="Set Your Service Location"
          />
        {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Slect Shift *</Text>
        <TouchableOpacity 
          style={[styles.picker, errors.shift && styles.inputError]}
          onPress={() => setShowShiftPicker(!showShiftPicker)}
        >
          <Text style={formData.shift ? styles.pickerText : styles.pickerPlaceholder}>
            {formData.shift || 'Select shift'}
          </Text>
          <Text style={styles.pickerArrow}>▼</Text>
        </TouchableOpacity>
        {showShiftPicker && (
          <View style={styles.pickerOptions}>
            {['Flexible', 'Day', 'Night'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.pickerOption}
                onPress={() => {
                  updateFormData('shift', option.toLowerCase());
                  setShowShiftPicker(false);
                }}
              >
                <Text style={styles.pickerOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {errors.shift && <Text style={styles.errorText}>{errors.shift}</Text>}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>Document Requirements:</Text>
        <Text style={styles.infoBoxText}>• Aadhar card images should be clear and readable</Text>
        <Text style={styles.infoBoxText}>• Upload both front and back of Aadhar card</Text>
        <Text style={styles.infoBoxText}>• Driving license must be valid and not expired</Text>
        <Text style={styles.infoBoxText}>• All documents should be in JPG or PNG format</Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Emergency Contact Name *</Text>
        <TextInput
          style={[styles.input, errors.emergency_contact_name && styles.inputError]}
          value={formData.emergency_contact_name}
          onChangeText={(value) => updateFormData('emergency_contact_name', value)}
          placeholder="Enter emergency contact name"
          placeholderTextColor={'#9E9E9E'}
        />
        {errors.emergency_contact_name && <Text style={styles.errorText}>{errors.emergency_contact_name}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Emergency Contact Number *</Text>
        <TextInput
          style={[styles.input, errors.emergency_contact_phone && styles.inputError]}
          value={formData.emergency_contact_phone}
          onChangeText={(value) => updateFormData('emergency_contact_phone', value.replace(/\D/g, ''))}
          placeholder="Enter 10-digit emergency contact number"
          keyboardType="phone-pad"
          maxLength={10}
          placeholderTextColor={'#9E9E9E'}
        />
        {errors.emergency_contact_phone && <Text style={styles.errorText}>{errors.emergency_contact_phone}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Relation With Emergency Contact *</Text>
        <TextInput
          style={[styles.input, errors.emergency_contact_relation && styles.inputError]}
          value={formData.emergency_contact_relation}
          onChangeText={(value) => updateFormData('emergency_contact_relation', value)}
          placeholder="Enter relation with emergency contact"
          placeholderTextColor={'#9E9E9E'}
        />
        {errors.emergency_contact_relation && <Text style={styles.errorText}>{errors.emergency_contact_relation}</Text>}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoBoxTitle}>Emergency Contact Information:</Text>
        <Text style={styles.infoBoxText}>• Provide a reliable contact person in case of emergencies</Text>
        <Text style={styles.infoBoxText}>• Ensure the contact number is reachable at all times</Text>
      </View>
    </View>
  );

  const renderStep5 = () => (
    <View style={styles.stepContent}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Capture Your Live Image *</Text>
        <TouchableOpacity
          style={[styles.uploadArea, errors.liveImage && styles.uploadAreaError]}
          onPress={() => handleFileUpload('liveImage', false)}
        >
          <Text style={styles.uploadIcon}>
            <Icon 
                  name="camera-enhance" 
                  size={40} 
                  color={Colors.textSecondary} 
              />
          </Text>
          {formData.liveImage ? (
            <Text style={styles.uploadSuccessText}>✓ Live image uploaded</Text>
          ) : (
            <Text style={styles.uploadText}>Tap to capture Live Image</Text>
          )}
        </TouchableOpacity>
        {renderSingleImage('liveImage', formData.liveImage)}
        {errors.liveImage && <Text style={styles.errorText}>{errors.liveImage}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <Header 
      title="Delivery Partner Registration"
      showBack
      onBackPress={() => navigation.goBack()}
      backgroundColor={Colors.white}
      textColor={Colors.textPrimary}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderProgressBar()}
        
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.formContainer}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
              {currentStep === 5 && renderStep5()}
            </View>
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationSection}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <Button
                title="Previous"
                onPress={handleBack}
                style={[styles.navButton, styles.previousButton]}
                textStyle={styles.previousButtonText}
                variant="outline"
              />
            )}
            <Button
              title={currentStep === 5 ? "Submit" : (loading ? 'Submiting...' : "Next")}
              onPress={handleNext}
              disabled={loading}
              style={[styles.navButton, styles.nextButton]}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
   backgroundColor: '#ffffff'
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressSteps: {
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleInactive: {
    backgroundColor: 'transparent',
    borderColor: '#d1d5db',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: '#ffffff',
  },
  stepNumberInactive: {
    color: '#6b7280',
  },
  stepLine: {
    width: 40,
    height: 2,
    // marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  stepLineInactive: {
    backgroundColor: '#d1d5db',
  },
  stepTitleContainer: {
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginBottom: 24,
  },
  stepContent: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    color:'#374151',

    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    color:'#374151',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    paddingLeft: 12,
    fontSize: 16,
  },
  inputWithIconField: {
    color:'#374151',
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  pickerText: {
    fontSize: 16,
    color: '#1f2937',
  },
  pickerPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  pickerOptions: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#1f2937',
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  uploadAreaError: {
    borderColor: '#ef4444',
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  uploadSuccessText: {
    fontSize: 14,
    color: '#059669',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  infoBoxTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoBoxText: {
    fontSize: 12,
    color: '#1e40af',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  backButton: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    // paddingHorizontal: 24,
    // paddingVertical: 12,
    // borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  navigationSection: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
  },
  previousButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  previousButtonText: {
    color: Colors.textSecondary,
  },
});

export default DeliveryPartnerRegistration;
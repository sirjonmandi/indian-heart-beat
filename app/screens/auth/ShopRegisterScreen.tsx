// screens/auth/ShopRegisterScreen.tsx
import React, { useState, useEffect } from 'react';
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
import FreeMapLocationPicker from '../../components/common/FreeMapLocationPicker';
import { validateEmail, validatePhone, validateName } from '../../utils/validation';
import { authAPI, shopHelpers } from '@/services/api/authAPI';
import { ApiResponse, ApiError } from '@/services/api/types';

interface ShopFormData {
  // Owner Information
  ownerFirstName: string;
  ownerLastName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerDateOfBirth: string;
  ownerGender: 'male' | 'female' | 'other' | '';
  password: string;
  confirmPassword: string;
  
  // Shop Information
  shopName: string;
  shopDescription: string;
  shopPhone: string;
  shopEmail: string;
  whatsappNumber: string;
  licenseNumber: string;
  gstNumber: string;
  panNumber: string;
  fssaiLicense: string;
  
  // Address Information
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  pincode: string;
  cityId: string;
  latitude: string;
  longitude: string;
  
  // Business Information
  businessType: string;
  establishmentYear: string;
  openingTime: string;
  closingTime: string;
  is24Hours: boolean;
  workingDays: number[];
  minimumOrderAmount: string;
  deliveryRadius: string;
}

interface FormErrors {
  [key: string]: string;
}

interface City {
  id: number;
  name: string;
  state: string;
}

const ShopRegisterScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  
  const [formData, setFormData] = useState<ShopFormData>({
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerDateOfBirth: '',
    ownerGender: '',
    password: '',
    confirmPassword: '',
    shopName: '',
    shopDescription: '',
    shopPhone: '',
    shopEmail: '',
    whatsappNumber: '',
    licenseNumber: '',
    gstNumber: '',
    panNumber: '',
    fssaiLicense: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    pincode: '',
    cityId: '1',
    latitude: '',
    longitude: '',
    businessType: 'retail',
    establishmentYear: '',
    openingTime: '09:00',
    closingTime: '22:00',
    is24Hours: false,
    workingDays: [1, 2, 3, 4, 5, 6, 7],
    minimumOrderAmount: '0',
    deliveryRadius: '5',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});

  // Load cities on component mount
  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      setLoadingCities(true);
      const response = await authAPI.getCities();
      if (response.data) {
        setCities(response.data);
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
      // Set some default cities
      setCities([
        { id: 1, name: 'Delhi', state: 'Delhi' },
        { id: 2, name: 'Mumbai', state: 'Maharashtra' },
        { id: 3, name: 'Bangalore', state: 'Karnataka' },
        { id: 4, name: 'Chennai', state: 'Tamil Nadu' },
        { id: 5, name: 'Kolkata', state: 'West Bengal' },
      ]);
    } finally {
      setLoadingCities(false);
    }
  };

  const steps = [
    { title: 'Owner Details', icon: 'person' },
    { title: 'Shop Information', icon: 'store' },
    { title: 'Address & Location', icon: 'location-on' },
    { title: 'Business Details', icon: 'business' },
  ];

  const businessTypes = [
    { value: 'retail', label: 'Retail Store' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'bar', label: 'Bar/Pub' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe', label: 'Cafe' },
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ];

  const workingDayOptions = [
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
    { value: 7, label: 'Sunday' },
  ];

  const handleInputChange = (field: keyof ShopFormData, value: string | boolean | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationChange = (lat: string, lng: string) => {
    handleInputChange('latitude', lat);
    handleInputChange('longitude', lng);
  };

  // Check email/phone availability
  const checkAvailability = async (email?: string, phone?: string) => {
    try {
      const response = await authAPI.checkAvailability({ email, phone });
      return response.data;
    } catch (error) {
      console.error('Availability check failed:', error);
      return null;
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: FormErrors = {};

    switch (step) {
      case 1: // Owner Details
        if (!formData.ownerFirstName.trim()) newErrors.ownerFirstName = 'First name is required';
        if (!formData.ownerLastName.trim()) newErrors.ownerLastName = 'Last name is required';
        
        if (!formData.ownerEmail.trim()) {
          newErrors.ownerEmail = 'Email is required';
        } else if (!validateEmail(formData.ownerEmail)) {
          newErrors.ownerEmail = 'Invalid email format';
        } else {
          // Check email availability
          const availability = await checkAvailability(formData.ownerEmail);
          if (availability && !availability.email_available) {
            newErrors.ownerEmail = `Email already registered as ${availability.existing_user_type}`;
          }
        }
        
        if (!formData.ownerPhone.trim()) {
          newErrors.ownerPhone = 'Phone number is required';
        } else if (!validatePhone(formData.ownerPhone)) {
          newErrors.ownerPhone = 'Invalid phone number';
        } else {
          // Check phone availability
          const availability = await checkAvailability(undefined, formData.ownerPhone);
          if (availability && !availability.phone_available) {
            newErrors.ownerPhone = `Phone already registered as ${availability.existing_user_type}`;
          }
        }
        
        if (!formData.ownerDateOfBirth) newErrors.ownerDateOfBirth = 'Date of birth is required';
        if (!formData.ownerGender) newErrors.ownerGender = 'Gender is required';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        break;

      case 2: // Shop Information
        if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required';
        if (!formData.shopDescription.trim()) newErrors.shopDescription = 'Shop description is required';
        if (!formData.shopPhone.trim()) newErrors.shopPhone = 'Shop phone is required';
        if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
        break;

      case 3: // Address & Location
        if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
        if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
        break;

      case 4: // Business Details
        if (!formData.establishmentYear) newErrors.establishmentYear = 'Establishment year is required';
        if (!termsAccepted) {
          Alert.alert('Terms Required', 'Please accept the Terms & Conditions to continue');
          return false;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateStep(4);
    if (!isValid) return;

    setLoading(true);
    try {
      // Format data for API
      const apiData = shopHelpers.formatShopRegistrationData(formData);
      
      console.log('Form data before formatting:', {
        ownerFirstName: formData.ownerFirstName,
        password: formData.password ? '***' : 'MISSING',
        confirmPassword: formData.confirmPassword ? '***' : 'MISSING',
        shopName: formData.shopName,
        licenseNumber: formData.licenseNumber,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        establishmentYear: formData.establishmentYear,
        deliveryRadius: formData.deliveryRadius,
        cityId: formData.cityId
      });

      // Validate data before sending
      const validation = shopHelpers.validateShopData(apiData);
      if (!validation.isValid) {
        console.log('Client-side validation errors:', validation.errors);
        setErrors(validation.errors);
        Alert.alert('Validation Error', 'Please check the highlighted fields');
        return;
      }

      console.log('API data being sent:', {
        ...apiData,
        password: '***',
        password_confirmation: '***'
      });

      // Call shop registration API
      const response = await authAPI.shopRegister(apiData);
      
      if (response.data.success) {
        Alert.alert(
          '🎉 Registration Successful!',
          `Welcome to BeerGo, ${formData.ownerFirstName}!\n\n` +
          `Your shop "${formData.shopName}" has been registered successfully.\n\n` +
          `📱 Shop Code: ${response.data.data.shop_code}\n` +
          `📍 Location: ${formData.latitude && formData.longitude ? 'Set' : 'Not specified'}\n\n` +
          'You will receive an OTP for verification, and our team will review your application within 24-48 hours.',
          [
            {
              text: 'Continue to Verification',
              onPress: () => {
                navigation.navigate(Constants.SCREENS.OTP_VERIFICATION, {
                  phoneNumber: formData.ownerPhone,
                  isRegistration: true,
                  isShopRegistration: true,
                  userData: response.data.data
                });
              }
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', response.data.message || 'Please try again');
      }
    } catch (error: any) {
      console.error('Shop registration error:', error);
      
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        // console.log('====================================');
        // console.log(JSON.stringify(error.response.data.message,null,2));
        // console.log('====================================');
        const message = error.response.data.message;
        const newErrors: FormErrors = {};
        
        // Map API errors to form fields
        Object.keys(apiErrors).forEach((field) => {
          const errorMessages = Array.isArray(apiErrors[field]) ? apiErrors[field] : [apiErrors[field]];
          newErrors[field] = errorMessages[0]; // Take first error message
        });
        
        console.log('API validation errors:', newErrors);
        setErrors(newErrors);
        
        // Show user-friendly error message
        const errorCount = Object.keys(newErrors).length;
        Alert.alert(
          'Registration Failed', 
          ` ${message}!`
        );
        // Please fix ${errorCount} error${errorCount > 1 ? 's' : ''} in the form and try again.
      } else {
        Alert.alert('Registration Failed', error.message || 'Please try again later');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={[
            styles.stepCircle,
            index + 1 <= currentStep ? styles.stepCircleActive : styles.stepCircleInactive
          ]}>
            <Icon 
              name={step.icon} 
              size={16} 
              color={index + 1 <= currentStep ? Colors.white : Colors.textSecondary} 
            />
          </View>
          <Text style={[
            styles.stepText,
            index + 1 === currentStep ? styles.stepTextActive : styles.stepTextInactive
          ]}>
            {step.title}
          </Text>
          {index < steps.length - 1 && (
            <View style={[
              styles.stepLine,
              index + 1 < currentStep ? styles.stepLineActive : styles.stepLineInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Owner Information</Text>
      <Text style={styles.stepDescription}>Please provide your personal details as the shop owner</Text>
      
      <View style={styles.nameRow}>
        <Input
          label="First Name"
          placeholder="Enter first name"
          value={formData.ownerFirstName}
          onChangeText={(text) => handleInputChange('ownerFirstName', text)}
          error={errors.ownerFirstName}
          style={[styles.nameInput, { marginRight: Spacing.sm }]}
          autoCapitalize="words"
        />
        <Input
          label="Last Name"
          placeholder="Enter last name"
          value={formData.ownerLastName}
          onChangeText={(text) => handleInputChange('ownerLastName', text)}
          error={errors.ownerLastName}
          style={[styles.nameInput, { marginLeft: Spacing.sm }]}
          autoCapitalize="words"
        />
      </View>

      <Input
        label="Email Address"
        placeholder="Enter your email"
        value={formData.ownerEmail}
        onChangeText={(text) => handleInputChange('ownerEmail', text)}
        error={errors.ownerEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Phone Number"
        placeholder="Enter 10-digit phone number"
        value={formData.ownerPhone}
        onChangeText={(text) => handleInputChange('ownerPhone', text)}
        error={errors.ownerPhone}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <Input
        label="Date of Birth"
        placeholder="YYYY-MM-DD"
        value={formData.ownerDateOfBirth}
        onChangeText={(text) => handleInputChange('ownerDateOfBirth', text)}
        error={errors.ownerDateOfBirth}
      />

      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Gender</Text>
        <View style={styles.radioOptions}>
          {genderOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioOption}
              onPress={() => handleInputChange('ownerGender', option.value)}
            >
              <View style={[
                styles.radioCircle,
                formData.ownerGender === option.value && styles.radioCircleSelected
              ]}>
                {formData.ownerGender === option.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
              <Text style={styles.radioText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.ownerGender && <Text style={styles.errorText}>{errors.ownerGender}</Text>}
      </View>

      <Input
        label="Password"
        placeholder="Enter password (min 8 characters)"
        value={formData.password}
        onChangeText={(text) => handleInputChange('password', text)}
        error={errors.password}
        secureTextEntry
      />

      <Input
        label="Confirm Password"
        placeholder="Re-enter password"
        value={formData.confirmPassword}
        onChangeText={(text) => handleInputChange('confirmPassword', text)}
        error={errors.confirmPassword}
        secureTextEntry
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Shop Information</Text>
      <Text style={styles.stepDescription}>Tell us about your shop and business</Text>
      
      <Input
        label="Shop Name"
        placeholder="Enter your shop name"
        value={formData.shopName}
        onChangeText={(text) => handleInputChange('shopName', text)}
        error={errors.shopName}
        autoCapitalize="words"
      />

      <Input
        label="Shop Description"
        placeholder="Describe your shop and what you sell"
        value={formData.shopDescription}
        onChangeText={(text) => handleInputChange('shopDescription', text)}
        error={errors.shopDescription}
        multiline
        numberOfLines={3}
      />

      <Input
        label="Shop Phone Number"
        placeholder="Shop contact number"
        value={formData.shopPhone}
        onChangeText={(text) => handleInputChange('shopPhone', text)}
        error={errors.shopPhone}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <Input
        label="Shop Email (Optional)"
        placeholder="Shop email address"
        value={formData.shopEmail}
        onChangeText={(text) => handleInputChange('shopEmail', text)}
        error={errors.shopEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="WhatsApp Number (Optional)"
        placeholder="WhatsApp contact number"
        value={formData.whatsappNumber}
        onChangeText={(text) => handleInputChange('whatsappNumber', text)}
        error={errors.whatsappNumber}
        keyboardType="phone-pad"
        maxLength={10}
      />

      <Input
        label="License Number"
        placeholder="Business license number"
        value={formData.licenseNumber}
        onChangeText={(text) => handleInputChange('licenseNumber', text)}
        error={errors.licenseNumber}
        autoCapitalize="characters"
      />

      <Input
        label="GST Number (Optional)"
        placeholder="GST registration number"
        value={formData.gstNumber}
        onChangeText={(text) => handleInputChange('gstNumber', text)}
        error={errors.gstNumber}
        autoCapitalize="characters"
      />

      <Input
        label="PAN Number (Optional)"
        placeholder="PAN card number"
        value={formData.panNumber}
        onChangeText={(text) => handleInputChange('panNumber', text)}
        error={errors.panNumber}
        autoCapitalize="characters"
        maxLength={10}
      />

      <Input
        label="FSSAI License (Optional)"
        placeholder="Food license number"
        value={formData.fssaiLicense}
        onChangeText={(text) => handleInputChange('fssaiLicense', text)}
        error={errors.fssaiLicense}
        autoCapitalize="characters"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Address & Location</Text>
      <Text style={styles.stepDescription}>Where is your shop located?</Text>
      
      <Input
        label="Address Line 1"
        placeholder="Street address, building number"
        value={formData.addressLine1}
        onChangeText={(text) => handleInputChange('addressLine1', text)}
        error={errors.addressLine1}
      />

      <Input
        label="Address Line 2 (Optional)"
        placeholder="Area, locality"
        value={formData.addressLine2}
        onChangeText={(text) => handleInputChange('addressLine2', text)}
        error={errors.addressLine2}
      />

      <Input
        label="Landmark (Optional)"
        placeholder="Nearby landmark"
        value={formData.landmark}
        onChangeText={(text) => handleInputChange('landmark', text)}
        error={errors.landmark}
      />

      <Input
        label="Pincode"
        placeholder="6-digit pincode"
        value={formData.pincode}
        onChangeText={(text) => handleInputChange('pincode', text)}
        error={errors.pincode}
        keyboardType="numeric"
        maxLength={6}
      />

      {/* City Selection */}
      <View style={styles.citySection}>
        <Text style={styles.radioLabel}>City</Text>
        {loadingCities ? (
          <Text style={styles.loadingText}>Loading cities...</Text>
        ) : (
          <View style={styles.cityGrid}>
            {cities.slice(0, 6).map((city) => (
              <TouchableOpacity
                key={city.id}
                style={[
                  styles.cityCard,
                  formData.cityId === city.id.toString() && styles.cityCardSelected
                ]}
                onPress={() => handleInputChange('cityId', city.id.toString())}
              >
                <Text style={[
                  styles.cityText,
                  formData.cityId === city.id.toString() && styles.cityTextSelected
                ]}>
                  {city.name}
                </Text>
                <Text style={styles.cityState}>{city.state}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* FREE MAP LOCATION PICKER */}
      <FreeMapLocationPicker
        latitude={formData.latitude}
        longitude={formData.longitude}
        onLocationChange={handleLocationChange}
        label="Shop Location"
        error={errors.latitude || errors.longitude}
      />

      <View style={styles.mapFeaturesNote}>
        <Icon name="check-circle" size={16} color={Colors.success} />
        <Text style={styles.mapFeaturesText}>
          ✨ Free interactive map • Click to select • Drag markers • GPS location
        </Text>
      </View>

      <View style={styles.locationNote}>
        <Icon name="info" size={20} color={Colors.primary} />
        <Text style={styles.locationNoteText}>
          Setting your exact location helps customers find you easily and improves delivery accuracy. 
          Our free map lets you click anywhere to set precise coordinates!
        </Text>
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Business Details</Text>
      <Text style={styles.stepDescription}>Final details about your business operations</Text>
      
      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Business Type</Text>
        <View style={styles.businessTypeGrid}>
          {businessTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.businessTypeCard,
                formData.businessType === type.value && styles.businessTypeCardSelected
              ]}
              onPress={() => handleInputChange('businessType', type.value)}
            >
              <Text style={[
                styles.businessTypeText,
                formData.businessType === type.value && styles.businessTypeTextSelected
              ]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Input
        label="Establishment Year"
        placeholder="YYYY"
        value={formData.establishmentYear}
        onChangeText={(text) => handleInputChange('establishmentYear', text)}
        error={errors.establishmentYear}
        keyboardType="numeric"
        maxLength={4}
      />

      <View style={styles.timeRow}>
        <Input
          label="Opening Time"
          placeholder="HH:MM"
          value={formData.openingTime}
          onChangeText={(text) => handleInputChange('openingTime', text)}
          style={[styles.timeInput, { marginRight: Spacing.sm }]}
        />
        <Input
          label="Closing Time"
          placeholder="HH:MM"
          value={formData.closingTime}
          onChangeText={(text) => handleInputChange('closingTime', text)}
          style={[styles.timeInput, { marginLeft: Spacing.sm }]}
        />
      </View>

      <TouchableOpacity 
        style={styles.checkboxRow}
        onPress={() => handleInputChange('is24Hours', !formData.is24Hours)}
      >
        <View style={[
          styles.checkbox,
          formData.is24Hours && styles.checkboxChecked
        ]}>
          {formData.is24Hours && (
            <Icon name="check" size={16} color={Colors.white} />
          )}
        </View>
        <Text style={styles.checkboxText}>Open 24 hours</Text>
      </TouchableOpacity>

      <View style={styles.workingDaysSection}>
        <Text style={styles.radioLabel}>Working Days</Text>
        <View style={styles.workingDaysGrid}>
          {workingDayOptions.map((day) => (
            <TouchableOpacity
              key={day.value}
              style={[
                styles.dayCard,
                formData.workingDays.includes(day.value) && styles.dayCardSelected
              ]}
              onPress={() => {
                const newWorkingDays = formData.workingDays.includes(day.value)
                  ? formData.workingDays.filter(d => d !== day.value)
                  : [...formData.workingDays, day.value];
                handleInputChange('workingDays', newWorkingDays);
              }}
            >
              <Text style={[
                styles.dayText,
                formData.workingDays.includes(day.value) && styles.dayTextSelected
              ]}>
                {day.label.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.workingDaysHelp}>
          {shopHelpers.formatWorkingDays(formData.workingDays)}
        </Text>
      </View>

      <View style={styles.nameRow}>
        <Input
          label="Minimum Order (₹)"
          placeholder="0"
          value={formData.minimumOrderAmount}
          onChangeText={(text) => handleInputChange('minimumOrderAmount', text)}
          style={[styles.nameInput, { marginRight: Spacing.sm }]}
          keyboardType="numeric"
        />
        <Input
          label="Delivery Radius (km)"
          placeholder="5"
          value={formData.deliveryRadius}
          onChangeText={(text) => handleInputChange('deliveryRadius', text)}
          style={[styles.nameInput, { marginLeft: Spacing.sm }]}
          keyboardType="numeric"
        />
      </View>

      {/* Terms & Conditions */}
      <View style={styles.termsSection}>
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
              <Text style={styles.linkText}>Terms & Conditions</Text>
              {' '}and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.reviewNote}>
        <Icon name="schedule" size={20} color={Colors.warning} />
        <Text style={styles.reviewNoteText}>
          Your shop registration will be reviewed by our team within 24-48 hours. You'll receive updates via SMS and email.
        </Text>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      default: return renderStep1();
    }
  };

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <Header 
        title="Shop Registration"
        showBack
        onBackPress={() => navigation.goBack()}
        backgroundColor={Colors.white}
        textColor={Colors.textPrimary}
      />
      
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderStepIndicator()}
        
        <ScrollView 
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {renderCurrentStep()}
          </View>
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.navigationSection}>
          <View style={styles.buttonRow}>
            {currentStep > 1 && (
              <Button
                title="Previous"
                onPress={handlePrevious}
                style={[styles.navButton, styles.previousButton]}
                textStyle={styles.previousButtonText}
                variant="outline"
              />
            )}
            <Button
              title={currentStep === 4 ? "Register Shop" : "Next"}
              onPress={handleNext}
              loading={loading}
              style={[styles.navButton, styles.nextButton]}
              disabled={currentStep === 4 && !termsAccepted}
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
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  
  // Step Indicator Styles
  stepIndicator: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
  },
  stepCircleInactive: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  stepText: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  stepTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  stepTextInactive: {
    color: Colors.textSecondary,
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 1,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  stepLineInactive: {
    backgroundColor: Colors.border,
  },

  // Step Content Styles
  stepContent: {
    paddingTop: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  stepDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // Form Styles
  nameRow: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.sm,
  },
  nameInput: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    marginHorizontal: -Spacing.sm,
  },
  timeInput: {
    flex: 1,
  },

  // Radio Group Styles
  radioGroup: {
    marginBottom: Spacing.lg,
  },
  radioLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  radioOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textPrimary,
  },

  // City Selection Styles
  citySection: {
    marginBottom: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: Spacing.md,
  },
  cityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cityCard: {
    flex: 1,
    minWidth: '30%',
    maxWidth: '48%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cityCardSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  cityText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  cityTextSelected: {
    color: Colors.primary,
  },
  cityState: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Business Type Styles
  businessTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  businessTypeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  businessTypeCardSelected: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary,
  },
  businessTypeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  businessTypeTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Working Days Styles
  workingDaysSection: {
    marginBottom: Spacing.lg,
  },
  workingDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dayCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 6,
    padding: Spacing.sm,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  dayTextSelected: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semibold,
  },
  workingDaysHelp: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },

  // Checkbox Styles
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
  checkboxText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  checkboxTextContainer: {
    flex: 1,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
    textDecorationLine: 'underline',
  },

  // Map features note
  mapFeaturesNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '10',
    padding: Spacing.sm,
    borderRadius: 6,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  mapFeaturesText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.success,
    fontWeight: Typography.fontWeight.medium,
  },

  // Terms and Notes Styles
  termsSection: {
    marginVertical: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  locationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.primary + '10',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    marginTop: Spacing.md,
  },
  locationNoteText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  reviewNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '10',
    padding: Spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.warning,
    marginTop: Spacing.lg,
  },
  reviewNoteText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },

  // Navigation Styles
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
  nextButton: {
    // Default button styling
  },

  // Error Text
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

export default ShopRegisterScreen;
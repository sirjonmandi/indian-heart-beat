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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../utils/constants';
import FreeMapLocationPicker from '@/components/common/FreeMapLocationPicker';
import { Colors } from '@/styles/colors';
import { validateName, validatePhone } from '@/utils/validation';
import { customerAPI } from '@/services/api/customerAPI';
import { ApiResponse } from '@/services/api';
import { useAlert } from '@/components/context/AlertContext';
interface FormData {
  type: string;
  name?: string;
  phone?: string; // Changed from number to string
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  pincode?: string; // Changed from number to string
  city?: string;
  latitude?: number;
  longitude?: number;
  state: string;
  isDefault?: boolean;
}

interface FormErrors {
    name?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    pincode?: string;
    city?: string;
    latitude?:string;
    longitude?:string;
    state?:string; 
}

interface RouteParams {
  item?:{
    type: string;
    name: string;
    phone: number;
    addressLine1: string;
    addressLine2: string;
    landmark: string;
    pincode:number;
    city: string;
    latitude:number;
    longitude:number;
    state: string;
    isDefault: boolean;
  };
}
const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { item:userAddress } = (route.params as RouteParams) || {};
  // console.log(' userAddress ' + JSON.stringify(userAddress));
  const [formData, setFormData] = useState<FormData>({
    type: 'home',
    state: 'West Bengal',
  });
  const [formErrors,setFromErrors] = useState<FormErrors>({});
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const addressTypes = ['home', 'office', 'other'];

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(()=>{
    if (userAddress) {
    setFormData({
      type: userAddress.type,
      name: userAddress.name,
      phone: userAddress.phone ? userAddress.phone.toString() : '', // Convert number to string
      addressLine1: userAddress.addressLine1,
      addressLine2: userAddress.addressLine2,
      landmark: userAddress.landmark,
      city: userAddress.city,
      state: userAddress.state,
      pincode: userAddress.pincode ? userAddress.pincode.toString() : '', // Convert number to string
      latitude: userAddress.latitude,
      longitude: userAddress.longitude,
      isDefault: userAddress.isDefault,
    });
    if (userAddress.isDefault) {
      setIsDefault(true);
    }
  }
  },[userAddress])


  const handleLocationChange = (lat: string, lng: string) => {
    updateField('latitude', lat);
    updateField('longitude', lng);
  };
  
  const validateForm = () => {
    const newError: FormErrors = {};
    
    // Name validation
    if (!formData.name || !formData.name.trim()) {
      newError.name = "Name is required";
    } else if (!validateName(formData.name)) {
      newError.name = "Please enter a valid name";
    }
    
    // Phone validation
    if (!formData.phone || !formData.phone.trim()) {
      newError.phone = "Phone number is required";
    } else if (formData.phone.length !== 10) {
      newError.phone = "Please enter a 10-digit phone number";
    } else if (!validatePhone(formData.phone)) {
      newError.phone = "Please enter a valid phone number";
    }
    
    // Address validation
    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      newError.addressLine1 = "Address line 1 is required";
    }
    
    // Pincode validation
    if (!formData.pincode || !formData.pincode.trim()) {
      newError.pincode = "Pincode is required";
    } else if (formData.pincode.length !== 6) {
      newError.pincode = "Please enter a valid 6-digit pincode";
    }
    
    // Set errors in state
    setFromErrors(newError);
    
    // Return validation result
    const hasErrors = Object.keys(newError).length > 0;
    
    if (hasErrors) {
      showAlert({
        title: 'Validation Error',
        message: 'Please Fill all the required fields ',
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }],
      });
      return false;
    }
    
    return true;
  }

  const saveAddress = async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      // Convert string values back to numbers for API call
      const apiData = {
        ...formData,
        phone: formData.phone ? parseInt(formData.phone, 10) : undefined,
        pincode: formData.pincode ? parseInt(formData.pincode, 10) : undefined,
      };

      if (userAddress) {
        console.log('formdata user address' + JSON.stringify(apiData));
        const userId = userAddress.id;
        const res: ApiResponse = await customerAPI.updateAddress(userId, apiData);
        const { success, message } = res.data;
        if (success) {
          console.log('Address updated success Response' + JSON.stringify(res.data));
          setIsSaving(false);
          navigation.navigate(Constants.SCREENS.ADDRESSES, { refresh: true });
        }
      } else {
        const res = await customerAPI.addAddress(apiData);
        const { success, message } = res.data;
        if (success) {
          console.log('Address created success Response' + JSON.stringify(res, null, 2));
          setIsSaving(false);
          navigation.navigate(Constants.SCREENS.ADDRESSES, { refresh: true });
        }
      }
    } catch (error: any) {
      const apiMessage =
        error?.response?.data?.errors &&
        Object.values(error.response.data.errors)?.[0]?.[0] ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      console.error('Address save error response ' + apiMessage);
      // Alert.alert('Error', apiMessage);
      showAlert({
        title: 'Error',
        message: apiMessage,
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }],
      })
      setIsSaving(false);
    }
  };
  
  const handlesetIsDefault = (val:boolean)=>{
      setIsDefault(val) 
      setFormData(prev => ({
      ...prev,
      ['isDefault']: val
    }));
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.background, Colors.background]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={Colors.textColor} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Address Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Type</Text>
          <View style={styles.typeSelector}>
            {addressTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeChip,
                  formData.type === type && styles.typeChipSelected
                ]}
                onPress={() => updateField('type', type)}
              >
                <Icon
                  name={type === 'home' ? 'home' : type === 'office' ? 'work' : 'location-on'}
                  size={16}
                  color={formData.type === type ? '#FFFFFF' : '#666'}
                />
                <Text style={[
                  styles.typeText,
                  formData.type === type && styles.typeTextSelected
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={Colors.textSecondary}
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              error={formErrors.name}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              error={formErrors.phone}
              style={styles.input}
              placeholder="Enter 10-digit phone number"
              placeholderTextColor={Colors.textSecondary}
              value={formData.phone}
              onChangeText={(text) => updateField('phone', text.replace(/[^0-9]/g, ''))}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Address Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address Line 1 *</Text>
            <TextInput
              error={formErrors.addressLine1}
              style={styles.input}
              placeholder="House/Flat/Block No."
              placeholderTextColor={Colors.textSecondary}
              value={formData.addressLine1}
              onChangeText={(text) => updateField('addressLine1', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Address Line 2</Text>
            <TextInput
              style={styles.input}
              placeholder="Road/Area/Colony (Optional)"
              placeholderTextColor={Colors.textSecondary}
              value={formData.addressLine2}
              onChangeText={(text) => updateField('addressLine2', text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Landmark</Text>
            <TextInput
              style={styles.input}
              placeholder="Nearby landmark (Optional)"
              placeholderTextColor={Colors.textSecondary}
              value={formData.landmark}
              onChangeText={(text) => updateField('landmark', text)}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                error={formErrors.pincode}
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={Colors.textSecondary}
                value={formData.pincode}
                onChangeText={(text) => updateField('pincode', text.replace(/[^0-9]/g, ''))}
                keyboardType="numeric"
                maxLength={6}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfWidth]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={Colors.textSecondary}
                value={formData.city}
                onChangeText={(text) => updateField('city', text)}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>State</Text>
            <TextInput
              style={styles.input}
              placeholder="State"
              placeholderTextColor={Colors.textSecondary}
              value={formData.state}
              onChangeText={(text) => updateField('state', text)}
            />
          </View>
        <View>
          <FreeMapLocationPicker
          mapTitle = "Select Your Location"
          latitude={formData.latitude}
          longitude={formData.longitude}
          onLocationChange={handleLocationChange}
          label="Set Location on Map"
          />
        </View>

        </View>


        {/* Default Address */}
        <TouchableOpacity
          style={styles.defaultContainer}
          onPress={() => handlesetIsDefault(!isDefault)}
        >
          <Icon
            name={isDefault ? 'check-box' : 'check-box-outline-blank'}
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.sectionTitle}> Set as default address</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={saveAddress}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Address'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ===============================================
// STYLES FOR ALL SCREENS
// ===============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textColor,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: Colors.backgroundSecondary,
    // marginBottom: 12,
    margin:12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius:8,

  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textColor,
  },
  changeText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  clearText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  // Search Screen Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  popularChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  chipText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  resultsList: {
    padding: 16,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resultImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resultEmoji: {
    fontSize: 24,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  resultBrand: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Address Styles
  addressCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  defaultBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    color: Colors.textPrimary,
    fontWeight: 'bold',
  },
  addressName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  defaultButton: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  defaultButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  selectedIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  addressList: {
    padding: 16,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 8,
  },
  addAddressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Add Address Form Styles
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop:8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  typeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  inputContainer: {
    // marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textColor,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    // borderColor: Colors.backgroundSecondary,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textWhite,
    backgroundColor: Colors.backgroundSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.background,
    marginBottom: 12,
  },
  bottomContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.background,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  // Checkout Styles
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});


export default AddAddressScreen;
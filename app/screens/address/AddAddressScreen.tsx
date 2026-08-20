import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
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

const ADDRESS_TYPES = [
  { key: 'home',   icon: 'home',        label: 'Home' },
  { key: 'office', icon: 'work',        label: 'Office' },
  { key: 'other',  icon: 'location-on', label: 'Other' },
];
 
const SectionHeader = ({ step, title }: { step: string; title: string }) => (
  <View style={styles.sectionHead}>
    <View style={styles.stepBadge}>
      <Text style={styles.stepNum}>{step}</Text>
    </View>
    <Text style={styles.sectionLabel}>{title}</Text>
  </View>
);
 
const FieldLabel = ({ label, required }: { label: string; required?: boolean }) => (
  <Text style={styles.fieldLabel}>
    {label.toUpperCase()}
    {required && <Text style={styles.req}> *</Text>}
  </Text>
);


const AddAddressScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { showAlert } = useAlert();
  const { item: userAddress } = (route.params as RouteParams) || {};
 
  const [formData, setFormData] = useState<FormData>({
    type: 'home',
    state: 'West Bengal',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
 
  useEffect(() => {
    if (userAddress) {
      setFormData({
        type: userAddress.type,
        name: userAddress.name,
        phone: userAddress.phone ? userAddress.phone.toString() : '',
        addressLine1: userAddress.addressLine1,
        addressLine2: userAddress.addressLine2,
        landmark: userAddress.landmark,
        city: userAddress.city,
        state: userAddress.state,
        pincode: userAddress.pincode ? userAddress.pincode.toString() : '',
        latitude: userAddress.latitude,
        longitude: userAddress.longitude,
        isDefault: userAddress.isDefault,
      });
      if (userAddress.isDefault) setIsDefault(true);
    }
  }, [userAddress]);
 
  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
 
  const handleLocationChange = (lat: string, lng: string) => {
    updateField('latitude', lat);
    updateField('longitude', lng);
  };
 
  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    else if (!validateName(formData.name)) errors.name = 'Please enter a valid name';
 
    if (!formData.phone?.trim()) errors.phone = 'Phone number is required';
    else if (formData.phone.length !== 10) errors.phone = 'Please enter a 10-digit phone number';
    else if (!validatePhone(formData.phone)) errors.phone = 'Please enter a valid phone number';
 
    if (!formData.addressLine1?.trim()) errors.addressLine1 = 'Address line 1 is required';
 
    if (!formData.pincode?.trim()) errors.pincode = 'Pincode is required';
    else if (formData.pincode.length !== 6) errors.pincode = 'Please enter a valid 6-digit pincode';
 
    setFormErrors(errors);
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      showAlert({
        title: 'Validation Error',
        message: 'Please fill all required fields',
        buttons: [{ text: 'OK', color: Colors.btnColorPrimary, textColor: Colors.btnTextPrimary }],
      });
    }
    return !hasErrors;
  };
 
  const saveAddress = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const apiData = {
        ...formData,
        phone: formData.phone ? parseInt(formData.phone, 10) : undefined,
        pincode: formData.pincode ? parseInt(formData.pincode, 10) : undefined,
      };
      if (userAddress) {
        const res: ApiResponse = await customerAPI.updateAddress(userAddress.id, apiData);
        if (res.data.success) navigation.navigate(Constants.SCREENS.ADDRESSES, { refresh: true });
      } else {
        const res = await customerAPI.addAddress(apiData);
        if (res.data.success) navigation.navigate(Constants.SCREENS.ADDRESSES, { refresh: true });
      }
    } catch (error: any) {
      const msg =
        (error?.response?.data?.errors && Object.values(error.response.data.errors)?.[0]?.[0]) ||
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong. Please try again.';
      showAlert({
        title: 'Error',
        message: msg,
        buttons: [{ text: 'OK', color: Colors.btnColorPrimary, textColor: Colors.btnTextPrimary }],
      });
    } finally {
      setIsSaving(false);
    }
  };
 
  const handleToggleDefault = () => {
    const next = !isDefault;
    setIsDefault(next);
    updateField('isDefault', next);
  };
 
  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="dark-content" backgroundColor="#ffffff" /> */}
 
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Icon name="keyboard-arrow-left" size={22} color="#1a1a1a" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>
            {userAddress ? 'Edit address' : 'Add new address'}
          </Text>
          <Text style={styles.headerSub}>Fill in your delivery details</Text>
        </View>
      </View>
 
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Section 1: Address Type ── */}
        <View style={styles.sectionCard}>
          <SectionHeader step="1" title="Address type" />
          <View style={styles.typeRow}>
            {ADDRESS_TYPES.map(({ key, icon, label }) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeChip, formData.type === key && styles.typeChipActive]}
                onPress={() => updateField('type', key)}
                activeOpacity={0.85}
              >
                <Icon
                  name={icon}
                  size={15}
                  color={formData.type === key ? '#fff' : '#999'}
                />
                <Text style={[styles.typeChipText, formData.type === key && styles.typeChipTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
 
        {/* ── Section 2: Contact Details ── */}
        <View style={styles.sectionCard}>
          <SectionHeader step="2" title="Contact details" />
          <View style={styles.sectionBody}>
            <View style={styles.fieldWrap}>
              <FieldLabel label="Full name" required />
              <TextInput
                style={[styles.input, !!formErrors.name && styles.inputError]}
                placeholder="Enter your full name"
                placeholderTextColor="#ccc"
                value={formData.name}
                onChangeText={t => updateField('name', t)}
              />
              {!!formErrors.name && <Text style={styles.errorText}>{formErrors.name}</Text>}
            </View>
 
            <View style={styles.fieldWrap}>
              <FieldLabel label="Phone number" required />
              <TextInput
                style={[styles.input, !!formErrors.phone && styles.inputError]}
                placeholder="10-digit phone number"
                placeholderTextColor="#ccc"
                value={formData.phone}
                onChangeText={t => updateField('phone', t.replace(/[^0-9]/g, ''))}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {!!formErrors.phone && <Text style={styles.errorText}>{formErrors.phone}</Text>}
            </View>
          </View>
        </View>
 
        {/* ── Section 3: Address Details ── */}
        <View style={styles.sectionCard}>
          <SectionHeader step="3" title="Address details" />
          <View style={styles.sectionBody}>
            <View style={styles.fieldWrap}>
              <FieldLabel label="Address line 1" required />
              <TextInput
                style={[styles.input, !!formErrors.addressLine1 && styles.inputError]}
                placeholder="House / Flat / Block No."
                placeholderTextColor="#ccc"
                value={formData.addressLine1}
                onChangeText={t => updateField('addressLine1', t)}
              />
              {!!formErrors.addressLine1 && <Text style={styles.errorText}>{formErrors.addressLine1}</Text>}
            </View>
 
            <View style={styles.fieldWrap}>
              <FieldLabel label="Address line 2" />
              <TextInput
                style={styles.input}
                placeholder="Road / Area / Colony (Optional)"
                placeholderTextColor="#ccc"
                value={formData.addressLine2}
                onChangeText={t => updateField('addressLine2', t)}
              />
            </View>
 
            <View style={styles.fieldWrap}>
              <FieldLabel label="Landmark" />
              <TextInput
                style={styles.input}
                placeholder="Nearby landmark (Optional)"
                placeholderTextColor="#ccc"
                value={formData.landmark}
                onChangeText={t => updateField('landmark', t)}
              />
            </View>
 
            <View style={styles.row2}>
              <View style={[styles.fieldWrap, styles.flex1]}>
                <FieldLabel label="Pincode" required />
                <TextInput
                  style={[styles.input, !!formErrors.pincode && styles.inputError]}
                  placeholder="000000"
                  placeholderTextColor="#ccc"
                  value={formData.pincode}
                  onChangeText={t => updateField('pincode', t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  maxLength={6}
                />
                {!!formErrors.pincode && <Text style={styles.errorText}>{formErrors.pincode}</Text>}
              </View>
 
              <View style={[styles.fieldWrap, styles.flex1]}>
                <FieldLabel label="City" />
                <TextInput
                  style={styles.input}
                  placeholder="City"
                  placeholderTextColor="#ccc"
                  value={formData.city}
                  onChangeText={t => updateField('city', t)}
                />
              </View>
            </View>
 
            <View style={styles.fieldWrap}>
              <FieldLabel label="State" />
              <TextInput
                style={styles.input}
                placeholder="State"
                placeholderTextColor="#ccc"
                value={formData.state}
                onChangeText={t => updateField('state', t)}
              />
            </View>
 
            {/* Map picker */}
            <FreeMapLocationPicker
              mapTitle="Select your location"
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={handleLocationChange}
              label="Pin location on map"
            />
          </View>
        </View>
 
        {/* ── Set as Default ── */}
        <TouchableOpacity
          style={styles.defaultRow}
          onPress={handleToggleDefault}
          activeOpacity={0.85}
        >
          <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
            {isDefault && <Icon name="check" size={12} color="#fff" />}
          </View>
          <View>
            <Text style={styles.defaultTitle}>Set as default address</Text>
            <Text style={styles.defaultSub}>Used automatically at checkout</Text>
          </View>
        </TouchableOpacity>
 
        {/* ── Save Button ── */}
        <TouchableOpacity
          style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
          onPress={saveAddress}
          disabled={isSaving}
          activeOpacity={0.85}
        >
          <Icon name="save" size={16} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.saveBtnText}>
            {isSaving ? 'Saving...' : 'Save address'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

// ===============================================
// STYLES FOR ALL SCREENS
// ===============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
 
  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f7f7f7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.2,
  },
  headerSub: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 1,
  },
 
  // ── Scroll / Body ──
  scroll: { flex: 1 },
  body: {
    padding: 16,
    gap: 14,
    paddingBottom: 32,
  },
 
  // ── Section card ──
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    overflow: 'hidden',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  sectionBody: {
    padding: 14,
    gap: 12,
  },
 
  // ── Address type chips ──
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 14,
  },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    backgroundColor: '#fafafa',
  },
  typeChipActive: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primaryBg,
  },
  typeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#777',
  },
  typeChipTextActive: {
    color: '#fff',
  },
 
  // ── Fields ──
  fieldWrap: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#bbb',
    letterSpacing: 0.8,
  },
  req: {
    color: '#e24b4a',
  },
  input: {
    height: 44,
    borderWidth: 1.5,
    borderColor: '#ebebeb',
    borderRadius: 10,
    backgroundColor: '#fafafa',
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1a1a1a',
  },
  inputError: {
    borderColor: '#e24b4a',
    backgroundColor: '#fff8f8',
  },
  errorText: {
    fontSize: 11,
    color: '#e24b4a',
    marginTop: 2,
  },
  row2: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: { flex: 1 },
 
  // ── Default toggle ──
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ebebeb',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.primaryBg,
    borderColor: Colors.primaryBg,
  },
  defaultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  defaultSub: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 1,
  },
 
  // ── Save button ──
  saveBtn: {
    height: 50,
    backgroundColor: Colors.primaryBg,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});


export default AddAddressScreen;
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBankDetails,UpdateBankDetails } from '@/store/slices/shopSlice';
import { useNavigation } from '@react-navigation/native';
interface RootState {
    shop:{
        shop:any;
        bankDetails: any;
    }
}
const ShopBankDetailsScreen: React.FC  = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const shopState = useSelector((state: RootState) => state.shop);
    const { shop, bankDetails } = shopState || {};

    const [formData, setFormData] = useState({
        shop_id:null,
        account_holder_name: '',
        account_number: '',
        ifsc_code: '',
        bank_name: '',
        branch_name: '',
        account_type: 'current',
        beneficiary_name: '',
        verification_status: 'pending',
    });
    
    useEffect(() => {
        fetchShopBankDetails();
    }, []);

    // Update formData when bankDetails changes
    useEffect(() => {
    if (bankDetails) {
        setFormData({
        shop_id:shop.id,
        account_holder_name: bankDetails.account_holder_name || '',
        account_number: bankDetails.account_number || '',
        ifsc_code: bankDetails.ifsc_code || '',
        bank_name: bankDetails.bank_name || '',
        branch_name: bankDetails.branch_name || '',
        account_type: bankDetails.account_type || 'current',
        beneficiary_name: bankDetails.beneficiary_name || '',
        verification_status: bankDetails.verification_status || 'pending',
        });
        setIsEditing(false);
    } else {
        setIsEditing(true);
    }

    if(shop){
      console.log('shop_id added');
      
      updateField('shop_id',shop.id)
    }

    }, [bankDetails,shop]);

    const fetchShopBankDetails = async () => {
        setLoading(true);
        try {
        
         await dispatch(fetchBankDetails()).unwrap();

        } catch (error) {
          console.error('Error fetching bank details:', error);
          Alert.alert('Error', 'Failed to fetch bank details');
        } finally {
            setLoading(false);
        }
      };
    
    const getErrorMessage = (error: unknown): string => {
      if (error && typeof error === 'object') {
        const apiError = error;
        return (
          (apiError?.errors && 
           Object.values(apiError.errors)?.[0]?.[0]) ||
          apiError.message ||
          'Something went wrong. Please try again.'
        );
      }
      return 'Something went wrong. Please try again.';
    };

    const handleSave = async () => {
        if (!formData.account_holder_name.trim()) {
          Alert.alert('Validation Error', 'Account holder name is required');
          return;
        }
        if (!formData.account_number.trim()) {
          Alert.alert('Validation Error', 'Account number is required');
          return;
        }
        if (!/^\d+$/.test(formData.account_number.trim())) {
          Alert.alert('Validation Error', 'Account number must contain only numbers');
          return;
        }
    
        if (formData.account_number.trim().length < 9 || formData.account_number.trim().length > 18) {
          Alert.alert('Validation Error', 'Enter a valid Account Number');
          return;
        }
    
        if (!formData.ifsc_code.trim()) {
          Alert.alert('Validation Error', 'IFSC code is required');
          return;
        }
    
        if (formData.ifsc_code.trim().length < 7 || formData.ifsc_code.trim().length > 11) {
          Alert.alert('Validation Error', 'Enter a valid IFSC code');
          return;
        }
    
        setSaving(true);
        try {
          await dispatch(UpdateBankDetails({data:formData})).unwrap();
          Alert.alert('Success',"Bank Details Updated Successfully");
        } catch (error) {
          console.error('Error saving bank details:', error);
          const errorMessage = getErrorMessage(error)
          Alert.alert('Error', errorMessage);
        } finally {
          setSaving(false);
          setIsEditing(false);
        }
      };
    
    const handleRefresh = async () => {
        setLoading(true);
        await fetchShopBankDetails();
      };
    
    const handleEdit = () => {
        setIsEditing(true);
      };
    
    const handleCancel = () => {
        if (bankDetails) {
          setFormData({
            shop_id:shop.id || null,
            account_holder_name: bankDetails.account_holder_name || '',
            account_number: bankDetails.account_number || '',
            ifsc_code: bankDetails.ifsc_code || '',
            bank_name: bankDetails.bank_name || '',
            branch_name: bankDetails.branch_name || '',
            account_type: bankDetails.account_type || 'current',
            beneficiary_name: bankDetails.beneficiary_name || '',
            verification_status: bankDetails.verification_status || 'pending',
          });
          setIsEditing(false);
        } else {
          navigation.goBack();
        }
      };
    
    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
      };
    
    const getStatusConfig = (status) => {
        switch (status) {
          case 'verified':
            return { 
              colors: ['#10b981', '#059669'], 
              icon: '✓',
              text: 'VERIFIED'
            };
          case 'failed':
            return { 
              colors: ['#ef4444', '#dc2626'], 
              icon: '✕',
              text: 'FAILED'
            };
          case 'resubmit_required':
            return { 
              colors: ['#f59e0b', '#d97706'], 
              icon: '⟳',
              text: 'RESUBMIT REQUIRED'
            };
          default:
            return { 
              colors: ['#8b5cf6', '#7c3aed'], 
              icon: '⏱',
              text: 'PENDING'
            };
        }
      };

    if (loading) {
            return (
            <View style={styles.centerContainer}>
                <View style={styles.loadingCard}>
                <ActivityIndicator size="large" color="#6366f1" />
                <Text style={styles.loadingText}>Loading bank details...</Text>
                </View>
            </View>
            );
        }

    const statusConfig = getStatusConfig(formData.verification_status);


    return (
        <View style={styles.container}>
          <ScrollView
            style={styles.content}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
            }
          >
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  Bank Details 
                </Text>
                <Text style={styles.partnerCode}>
                  Shop Name: {shop.name ?? 'N/A'}
                </Text>
              </View>
            </View>
    
            {/* Performance Stats */}
            <View style={styles.statsContainer}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View>
                      {/* Modern Status Header */}
                      {bankDetails && (
                        <View style={styles.statusCard}>
                          <View style={styles.statusHeader}>
                            <Text style={styles.statusTitle}>Verification Status</Text>
                            {bankDetails.verified_at && (
                              <Text style={styles.verifiedDate}>
                                {new Date(bankDetails.verified_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </Text>
                            )}
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: statusConfig.colors[0] }]}>
                            <Text style={styles.statusIcon}>{statusConfig.icon}</Text>
                            <Text style={styles.statusText}>{statusConfig.text}</Text>
                          </View>
                        </View>
                      )}
    
                      {/* Form Section */}
                      <View style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Account Information</Text>
                        
                        {/* Account Holder Name */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>
                            Account Holder Name <Text style={styles.required}>*</Text>
                          </Text>
                          <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                            <TextInput
                              style={styles.input}
                              value={formData.account_holder_name}
                              onChangeText={(text) => updateField('account_holder_name', text)}
                              placeholder="Enter account holder name"
                              placeholderTextColor="#9ca3af"
                              editable={isEditing}
                            />
                          </View>
                        </View>
    
                        {/* Account Number */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>
                            Account Number <Text style={styles.required}>*</Text>
                          </Text>
                          <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                            <TextInput
                              style={styles.input}
                              value={formData.account_number}
                              onChangeText={(text) => {
                                 const cleaned = text.replace(/[^0-9]/g, ''); // remove non-numeric chars
                                  if (cleaned.length <= 18) {
                                    updateField('account_number', cleaned);
                                  }
                              }}
                              placeholder="Enter account number"
                              placeholderTextColor="#9ca3af"
                              keyboardType="numeric"
                              editable={isEditing}
                            />
                          </View>
                        </View>
    
                        {/* IFSC Code */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>
                            IFSC Code <Text style={styles.required}>*</Text>
                          </Text>
                          <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                            <TextInput
                              style={styles.input}
                              value={formData.ifsc_code}
                              onChangeText={(text) => updateField('ifsc_code', text.toUpperCase())}
                              placeholder="Enter IFSC code"
                              placeholderTextColor="#9ca3af"
                              autoCapitalize="characters"
                              editable={isEditing}
                            />
                          </View>
                        </View>
    
                        <View style={styles.divider} />
    
                        {/* Bank Details */}
                        <Text style={styles.sectionTitle}>Bank Details</Text>
    
                        {/* Bank Name */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Bank Name</Text>
                          <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                            <TextInput
                              style={styles.input}
                              value={formData.bank_name}
                              onChangeText={(text) => updateField('bank_name', text)}
                              placeholder="Enter bank name"
                              placeholderTextColor="#9ca3af"
                              editable={isEditing}
                            />
                          </View>
                        </View>
    
                        {/* Branch Name */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Branch Name</Text>
                          <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                            <TextInput
                              style={styles.input}
                              value={formData.branch_name}
                              onChangeText={(text) => updateField('branch_name', text)}
                              placeholder="Enter branch name"
                              placeholderTextColor="#9ca3af"
                              editable={isEditing}
                            />
                          </View>
                        </View>
    
                        {/* Account Type */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Account Type</Text>
                          <View style={[styles.pickerWrapper, !isEditing && styles.inputDisabled]}>
                            <Picker
                              selectedValue={formData.account_type}
                              onValueChange={(value) => updateField('account_type', value)}
                              enabled={isEditing}
                              style={styles.picker}
                            >
                              <Picker.Item label="💰 Savings" value="savings" />
                              <Picker.Item label="🏢 Current" value="current" />
                            </Picker>
                          </View>
                        </View>
    
                        <View style={styles.divider} />
    
                        {/* Additional Information */}
                        <Text style={styles.sectionTitle}>Additional Information</Text>
    
                        {/* Beneficiary Name */}
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Beneficiary Name</Text>
                          <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                            <TextInput
                              style={styles.input}
                              value={formData.beneficiary_name}
                              onChangeText={(text) => updateField('beneficiary_name', text)}
                              placeholder="Enter beneficiary name"
                              placeholderTextColor="#9ca3af"
                              editable={isEditing}
                            />
                          </View>
                        </View>
                      </View>
    
                      {/* Additional Info Card */}
                      {/* {bankDetails && (
                        <View style={styles.infoCard}>
                          <Text style={styles.infoTitle}>Verification Details</Text>
                          <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Attempts</Text>
                            <Text style={styles.infoValue}>{bankDetails.verification_attempts}</Text>
                          </View>
                          {bankDetails.razorpay_fund_account_id && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Razorpay Fund Account</Text>
                              <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                                {bankDetails.razorpay_fund_account_id}
                              </Text>
                            </View>
                          )}
                          {bankDetails.verification_notes && (
                            <View style={styles.notesContainer}>
                              <Text style={styles.notesLabel}>Notes</Text>
                              <Text style={styles.notesText}>{bankDetails.verification_notes}</Text>
                            </View>
                          )}
                        </View>
                      )} */}
    
                      {/* Action Buttons */}
                      <View style={styles.buttonContainer}>
                        {isEditing ? (
                          <>
                            <TouchableOpacity
                              style={[styles.button, styles.cancelButton]}
                              onPress={handleCancel}
                              disabled={saving}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.button, styles.saveButton]}
                              onPress={handleSave}
                              disabled={saving}
                              activeOpacity={0.8}
                            >
                              {saving ? (
                                <ActivityIndicator color="#fff" size="small" />
                              ) : (
                                <>
                                  <Text style={styles.saveButtonText}>Save Changes</Text>
                                </>
                              )}
                            </TouchableOpacity>
                          </>
                        ) : (
                          <TouchableOpacity
                            style={[styles.button, styles.editButton]}
                            onPress={handleEdit}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.editButtonText}>✏️ Edit Details</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </ScrollView>
            </View>
          </ScrollView>
        </View>
      );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  profileHeader: {
    backgroundColor: '#4CAF50',
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
  statsContainer: {
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
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  inputWrapper: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    padding: 12,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  pickerWrapper: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#90CAF9',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  editButton: {
    backgroundColor: '#2196F3',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
export default ShopBankDetailsScreen
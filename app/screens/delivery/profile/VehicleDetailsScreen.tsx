import React,{useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { fetchProfile } from '@/store/slices/deliverySlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { deliveryAPI } from '@/services/api/deliveryAPI';
const dummyProfile = {
  user:{
    first_name:'',
    last_name:'',
    phone:'',
    email:'',
    date_of_birth:'',
    avatar:'',
  },
  delivery_partner:{
      partner_code:'',
      vehicle_type:'',
      vehicle_number:'',
      vehicle_model:'',
      vehicle_color:'',
  }
};

interface RootState {
  delivery: {
    profile?: typeof dummyProfile;
  };
}

const VehicleDetailsScreen: React.FC = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const deliveryState = useSelector((state: RootState) => state.delivery);
    const { profile } = deliveryState || {};

    const [formData, setFormData] = useState({
      vehicle_type: profile?.delivery_partner.vehicle_type || '',
      vehicle_number: profile?.delivery_partner.vehicle_number || '',
      vehicle_model: profile?.delivery_partner.vehicle_model || '',
      vehicle_color: profile?.delivery_partner.vehicle_color || '',
    });

    console.log('====================================');
    console.log(JSON.stringify(profile,null,2));
    console.log('====================================');
    const fetchPartnerDetails = async () => {
      setLoading(true);
      try {
        await dispatch(fetchProfile()).unwrap();
      } catch (error) {
        console.error('Error fetching bank details:', error);
        Alert.alert('Error', 'Failed to fetch bank details');
      } finally {
          setLoading(false);
      }
    };
    const handleRefresh = async () => {
      setLoading(true);
      await fetchPartnerDetails();
    };

    const validateForm = () =>{
      if (!formData.vehicle_type.trim()) {
        Alert.alert('Validation Error', 'Vehicle Type is required');
        return false;
      }
      if (!formData.vehicle_model.trim()) {
        Alert.alert('Validation Error', 'Vehicle Model is required');
        return false;
      }
      if (!formData.vehicle_color.trim()) {
        Alert.alert('Validation Error', 'Vehicle color is required');
        return false;
      }
      if (!formData.vehicle_number.trim()) {
        Alert.alert('Validation Error', 'Vehicle Number is required');
        return false;
      }
      return true;
    }
    
    const handleSave = async () => {
      if (!validateForm()) return;

      setSaving(true);

      try {
        const response = await deliveryAPI.updateProfile({
          vehicle_type:formData.vehicle_type,
          vehicle_model:formData.vehicle_model,
          vehicle_color:formData.vehicle_color,
          vehicle_number:formData.vehicle_number,
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
        setSaving(false);
      }
    }

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        // navigation.goBack();
    };

    const updateField = (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
      <ScrollView
       style={styles.container}
       showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
       >

        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              Vehicle Details
            </Text>
            <Text style={styles.partnerCode}>
              Update your Vehicle information
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formCard}>
              <Text style={styles.sectionTitle}>Vehicle Information</Text>
              {/* vehivle Type */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vehicle Type</Text>
                <View style={[styles.pickerWrapper, !isEditing && styles.inputDisabled]}>
                  <Picker
                    selectedValue={formData.vehicle_type}
                    onValueChange={(value) => updateField('vehicle_type', value)}
                    enabled={isEditing}
                    style={styles.picker}
                  >
                    <Picker.Item label="Bicycle" value="bicycle" />
                    <Picker.Item label="Motorcycle" value="motorcycle" />
                    <Picker.Item label="Scooter" value="scooter" />
                    <Picker.Item label="Car" value="car" />
                    <Picker.Item label="Van" value="van" />
                  </Picker>
                </View>
              </View>

              {/* Vehicle Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Vehicle Number <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                    <TextInput
                      style={styles.input}
                      value={formData.vehicle_number}
                      onChangeText={(text) => updateField('vehicle_number', text)}
                      placeholder="Enter vehicle number"
                      placeholderTextColor="#9ca3af"
                      editable={isEditing}
                    />
                  </View>
                </View>

              {/* Vehicle Model */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Vehicle Model <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                    <TextInput
                      style={styles.input}
                      value={formData.vehicle_model}
                      onChangeText={(text) => updateField('vehicle_model', text)}
                      placeholder="Enter vehicle model"
                      placeholderTextColor="#9ca3af"
                      editable={isEditing}
                    />
                  </View>
                </View>

              {/* Vehicle Color */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>
                    Vehicle Color <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                    <TextInput
                      style={styles.input}
                      value={formData.vehicle_color}
                      onChangeText={(text) => updateField('vehicle_color', text)}
                      placeholder="Enter vehicle color"
                      placeholderTextColor="#9ca3af"
                      editable={isEditing}
                    />
                  </View>
                </View>
            </View>
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
          </ScrollView>
        </View>
      </ScrollView>
    )
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
export default VehicleDetailsScreen;
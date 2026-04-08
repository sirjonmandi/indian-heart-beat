import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchProfile } from '@/store/slices/deliverySlice';
import { deliveryAPI } from '@/services/api/deliveryAPI';

const { width } = Dimensions.get('window');

const dummyProfile = {
  user: {
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    date_of_birth: '',
    avatar: '',
  },
  delivery_partner: {
    driving_license_number: '',
    driving_license_images: [],
    vehicle_rc_images: [],
    vehicle_insurance_images: [],
    aadhar_number: '',
    aadhar_images: [],
    background_check_status: 'pending',
    license_verification_status: 'pending',
    vehicle_verification_status: 'pending',
    insurance_verification_status: 'pending',
    aadhar_verification_status: 'pending',
    face_verification_status: 'pending',
  }
};

interface RootState {
  delivery: {
    profile?: typeof dummyProfile;
  };
}

const DocumentDetailsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const deliveryState = useSelector((state: RootState) => state.delivery);
  const { profile } = deliveryState || {};

  const [formData, setFormData] = useState({
    driving_license_number: profile?.delivery_partner.driving_license_number || '',
    aadhar_number: profile?.delivery_partner.aadhar_number || '',
  });

  useEffect(() => {
    if (profile?.delivery_partner) {
      setFormData({
        driving_license_number: profile.delivery_partner.driving_license_number || '',
        aadhar_number: profile.delivery_partner.aadhar_number || '',
      });
    }
  }, [profile]);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRefresh = async () => {
    setLoading(true);
    await dispatch(fetchProfile() as any);
    setLoading(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      driving_license_number: profile?.delivery_partner.driving_license_number || '',
      aadhar_number: profile?.delivery_partner.aadhar_number || '',
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await deliveryAPI.updateProfile({
        driving_license_number:formData.driving_license_number,
        aadhar_number:formData.aadhar_number,
      });
      if (!response.data.status) {
        console.log('================ Error while updating profile ====================');
        console.log(JSON.stringify(response,null,2));
        console.log('====================================');
      }
      await dispatch(fetchProfile()).unwrap();
      Alert.alert('Success', 'Documents updated successfully!');
      navigation.goBack();
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update document details.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'rejected':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return '✓';
      case 'pending':
        return '⏱';
      case 'rejected':
        return '✕';
      default:
        return '?';
    }
  };

  const renderImageGallery = (images: string[] | { url: string | null }, title: string) => {
    let imageUrls: string[] = [];
    
    if (Array.isArray(images)) {
      imageUrls = images;
    } else if (images && typeof images === 'object' && images.url) {
      imageUrls = [images.url];
    }

    if (imageUrls.length === 0) {
      return (
        <View style={styles.noImagesContainer}>
          <Text style={styles.noImagesText}>No images uploaded</Text>
        </View>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.imageGallery}
      >
        {imageUrls.map((imageUrl, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.imageContainer}
            activeOpacity={0.8}
          >
            <Image 
              source={{ uri: imageUrl }} 
              style={styles.documentImage}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageNumber}>{index + 1}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderVerificationStatus = (status: string, label: string) => {
    return (
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{label}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) }]}>
          <Text style={styles.statusIcon}>{getStatusIcon(status)}</Text>
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
        </View>
      </View>
    );
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
          <Text style={styles.profileName}>Documents Details</Text>
          <Text style={styles.partnerCode}>
            Manage your verification documents
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {/* Verification Status Overview */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>📋 Verification Status</Text>
            {renderVerificationStatus(
              profile?.delivery_partner.background_check_status || 'pending',
              'Background Check'
            )}
            {renderVerificationStatus(
              profile?.delivery_partner.license_verification_status || 'pending',
              'Driving License'
            )}
            {renderVerificationStatus(
              profile?.delivery_partner.vehicle_verification_status || 'pending',
              'Vehicle RC'
            )}
            {renderVerificationStatus(
              profile?.delivery_partner.insurance_verification_status || 'pending',
              'Vehicle Insurance'
            )}
            {renderVerificationStatus(
              profile?.delivery_partner.aadhar_verification_status || 'pending',
              'Aadhar Card'
            )}
            {renderVerificationStatus(
              profile?.delivery_partner.face_verification_status || 'pending',
              'Face Verification'
            )}
          </View>

          {/* Driving License Section */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>🚗 Driving License</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                License Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                <TextInput
                  style={styles.input}
                  value={formData.driving_license_number}
                  onChangeText={(value) => updateField('driving_license_number', value)}
                  placeholder="Enter license number"
                  editable={isEditing}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>License Images</Text>
              {renderImageGallery(
                profile?.delivery_partner.driving_license_images || [],
                'Driving License'
              )}
            </View>
          </View>

          {/* Vehicle RC Section */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>📄 Vehicle Registration (RC)</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>RC Images</Text>
              {renderImageGallery(
                profile?.delivery_partner.vehicle_rc_images || [],
                'Vehicle RC'
              )}
            </View>
          </View>

          {/* Vehicle Insurance Section */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>🛡️ Vehicle Insurance</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Insurance Images</Text>
              {renderImageGallery(
                profile?.delivery_partner.vehicle_insurance_images || [],
                'Vehicle Insurance'
              )}
            </View>
          </View>

          {/* Aadhar Card Section */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>🆔 Aadhar Card</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Aadhar Number <Text style={styles.required}>*</Text>
              </Text>
              <View style={[styles.inputWrapper, !isEditing && styles.inputDisabled]}>
                <TextInput
                  style={styles.input}
                  value={formData.aadhar_number}
                  onChangeText={(value) => updateField('aadhar_number', value)}
                  placeholder="Enter aadhar number"
                  keyboardType="numeric"
                  maxLength={12}
                  editable={isEditing}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Aadhar Images</Text>
              {renderImageGallery(
                profile?.delivery_partner.aadhar_images || [],
                'Aadhar Card'
              )}
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>ℹ️ Important Information</Text>
            <Text style={styles.infoText}>
              • All documents must be clear and readable{'\n'}
              • Ensure all details match your official documents{'\n'}
              • Verification typically takes 24-48 hours{'\n'}
              • You'll be notified once verification is complete
            </Text>
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
                    <Text style={styles.saveButtonText}>Save Changes</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  partnerCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusIcon: {
    fontSize: 12,
    color: '#fff',
    marginRight: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  imageGallery: {
    flexDirection: 'row',
    marginTop: 8,
  },
  imageContainer: {
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentImage: {
    width: width * 0.4,
    height: width * 0.25,
    backgroundColor: '#f0f0f0',
  },
  imageOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageNumber: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  noImagesContainer: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 8,
  },
  noImagesText: {
    color: '#999',
    fontSize: 14,
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
  },
  infoText: {
    fontSize: 13,
    color: '#1565C0',
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

export default DocumentDetailsScreen
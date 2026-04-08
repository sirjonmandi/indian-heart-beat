import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  PermissionsAndroid,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../utils/constants';
import  apiClient  from '../../services/api/apiClient';
import { setUser } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';

const AgeVerificationScreen: React.FC = () => {

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentImage, setDocumentImage] = useState(null);
  const [facePhoto, setFacePhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleDocumentSelect = (type: string) => {
    setDocumentType(type);
    setDocumentNumber('');
    setDocumentImage(null);
    setFacePhoto(null);
  };

  const selectImage = (callback: Function) => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera(callback) },
        { text: 'Gallery', onPress: () => openGallery(callback) },
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

  const openCamera = async(callback: Function) => {

    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return;
    }

    launchCamera({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets[0]) {
        const images = response.assets
          .filter(asset => asset.uri)
          .map(asset => ({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `photo_${Date.now()}.jpg`,
            size: asset.fileSize
          }));
        callback(images[0]); // Pass the first image object
      }
    });
  };

  const openGallery = (callback: Function) => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.assets && response.assets[0]) {
        const images = response.assets
          .filter(asset => asset.uri)
          .map(asset => ({
            uri: asset.uri,
            type: asset.type || 'image/jpeg',
            name: asset.fileName || `photo_${Date.now()}.jpg`,
            size: asset.fileSize
          }));
        callback(images[0]); // Pass the first image object
      }
    });
  };

  const getErrorMessage = (error: unknown): string => {  
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error;
      return (
        (apiError.response?.data?.errors && 
          Object.values(apiError.response.data.errors)?.[0]?.[0]) ||
        apiError.response?.data?.message || apiError.errors ||
        'Something went wrong. Please try again.'
      );
    }
    
    return 'Something went wrong. Please try again.';
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

  const handleSubmit = async () => {
    if (!dateOfBirth ||!documentType || !documentImage || !facePhoto) {
      Alert.alert('Error', 'Please complete all verification steps');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)){
      Alert.alert('Error', 'Date of Birth must be in YYYY-MM-DD format');
      return;
    }
    if (!validateDate(dateOfBirth)) {
      Alert.alert('Error', 'Please enter a valid Date of Birth');
      return;
    }
    const age = getAge(dateOfBirth);
    if (age < 0){
      Alert.alert('Error', 'Please enter a valid date of birth');
      return;
    } else if (age < 18) {
      Alert.alert('Error', 'You must be at least 18 years old to verify your age');
      return;
    } else if (age > 60) {
      if (age > 100){
        Alert.alert('Error', 'Please enter a valid date of birth');
        return;
      } else {
        Alert.alert('Notice', 'For users above 60, additional verification may be required.');
      }
    }
    setIsUploading(true);
    
    try {
      // API call to submit verification documents
      console.log('====================================');
      console.log(documentType,documentImage,facePhoto);
      console.log('====================================');
      const formData =  new FormData();
      formData.append('date_of_birth',dateOfBirth);
      formData.append('document_number',documentNumber);
      formData.append('document_type',documentType);
      const docImg = documentImage;
      formData.append('document_image',{
        uri:docImg.uri,
        type:docImg.type,
        name:docImg.name,
      });
      const image = facePhoto;
      formData.append('live_image',{
        uri:image.uri,
        type:image.type,
        name:image.name,
      });

      const response = await apiClient.post('/customer/age-verifiy', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      console.log('====================================');
      console.log(JSON.stringify(response,null,2));
      console.log('====================================');

      // setTimeout(() => {
      //   setIsUploading(false);
      //   // navigation.navigate(Constants.SCREENS.LOCATION_PERMISSION);
      // }, 2000);
      if (response.status === 200) {
        dispatch(setUser(response.data.data.user));
        Alert.alert('success',
          response.data.message || 'Your Documents has submited, Application status will be notified with in 2 to 3 bussiness days',
          [{text:'Okay',onPress:()=>{navigation.goBack()}}]
        );
      }

    } catch (error:any) {
      setIsUploading(false);
      console.log('====================================');
      console.log(JSON.stringify(error.response?.data,null,2));
      console.log('====================================');
       const errorMessage = getErrorMessage(error);
      Alert.alert('Error', errorMessage || 'Verification submission failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2C2C2C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Age Verification</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>🔒</Text>
          <Text style={styles.infoTitle}>Secure Verification</Text>
          <Text style={styles.infoText}>
            We need to verify you're 21+ to purchase alcohol. Your documents are processed securely.
          </Text>
        </View>

        {/* Document Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Document Type</Text>
          <View style={styles.documentGrid}>
            {Constants.DOCUMENT_TYPES.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={[
                  styles.documentCard,
                  documentType === doc.id && styles.documentCardSelected
                ]}
                onPress={() => handleDocumentSelect(doc.id)}
              >
                <Text style={styles.documentIcon}>{doc.icon}</Text>
                <Text style={styles.documentName}>{doc.name}</Text>
                {documentType === doc.id && (
                  <Icon name="check-circle" size={20} color="#4CAF50" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Document Upload */}
        {documentType && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Date Of Birth</Text>
              <View style={styles.uploadCard}>
                <TextInput 
                  style={styles.textInput}
                  value={dateOfBirth}
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

                  // updateFormData('date_of_birth', cleaned);
                  setDateOfBirth(cleaned);
                }}
                keyboardType="numeric"
                placeholder="YYYY-MM-DD"
                placeholderTextColor={'#9E9E9E'}
                />
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Document Number</Text>
              <View style={styles.uploadCard}>
              <Text style={styles.infoText}>
                Please enter the document number of your selected {Constants.DOCUMENT_TYPES.find(d => d.id === documentType)?.name}.
              </Text>
                <TextInput 
                  style={styles.textInput}
                  value={documentNumber}
                  onChangeText={setDocumentNumber}
                  placeholder="Enter Document Number"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upload Document</Text>
              <TouchableOpacity
                style={styles.uploadCard}
                onPress={() => selectImage(setDocumentImage)}
              >
                {documentImage ? (
                  <View style={styles.uploadedImageContainer}>
                    <Image source={{ uri: documentImage.uri }} style={styles.uploadedImage} />
                    <Text style={styles.uploadSuccessText}>Document uploaded ✓</Text>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Icon name="cloud-upload" size={48} color="#4CAF50" />
                    <Text style={styles.uploadText}>Tap to upload document</Text>
                    <Text style={styles.uploadSubtext}>
                      Clear photo of your {Constants.DOCUMENT_TYPES.find(d => d.id === documentType)?.name}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Face Photo */}
        {documentImage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Take a Selfie</Text>
            <TouchableOpacity
              style={styles.uploadCard}
              onPress={() => openCamera(setFacePhoto)}
            >
              {facePhoto ? (
                <View style={styles.uploadedImageContainer}>
                  <Image source={{ uri: facePhoto.uri }} style={styles.uploadedImage} />
                  <Text style={styles.uploadSuccessText}>Selfie uploaded ✓</Text>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <Icon name="face" size={48} color="#4CAF50" />
                  <Text style={styles.uploadText}>Take a clear selfie</Text>
                  <Text style={styles.uploadSubtext}>Look directly at the camera</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Guidelines */}
        <View style={styles.guidelinesCard}>
          <Text style={styles.guidelinesTitle}>Photo Guidelines:</Text>
          {[
            'Ensure good lighting',
            'All text should be clearly visible',
            'No blur or glare',
            'Document should be flat'
          ].map((guideline, index) => (
            <View key={index} style={styles.guideline}>
              <Icon name="check" size={16} color="#4CAF50" />
              <Text style={styles.guidelineText}>{guideline}</Text>
            </View>
          ))}
        </View>

        {/* Submit Button */}
        {documentType && documentImage && facePhoto && (
          <TouchableOpacity
            style={[styles.submitButton, isUploading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isUploading}
          >
            <Text style={styles.submitButtonText}>
              {isUploading ? 'Submitting...' : 'Submit for Verification'}
            </Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  infoIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  documentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  documentCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  documentCardSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8F4',
  },
  documentIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4CAF50',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  uploadPlaceholder: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 12,
  },
  uploadSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  uploadedImageContainer: {
    alignItems: 'center',
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  uploadSuccessText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 12,
  },
  guidelinesCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 12,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  guidelineText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    fontSize: 16,
    color: '#2C2C2C',
  },
});

export default AgeVerificationScreen;

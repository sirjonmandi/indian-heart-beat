import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Switch,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import image picker
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

// Import Redux actions
import { addProduct } from '@store/slices/shopSlice';

interface ProductForm {
  name: string;
  brand: string;
  category: string;
  price: string;
  mrp: string;
  stock: string;
  description: string;
  alcoholPercentage: string;
  volume: string;
  images: string[];
  isActive: boolean;
}

interface RootState {
  shop?: {
    inventoryLoading: boolean;
  };
}

const AddProductScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Get loading state from Redux
  const loading = useSelector((state: RootState) => state.shop?.inventoryLoading || false);

  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    brand: '',
    category: '',
    price: '',
    mrp: '',
    stock: '',
    description: '',
    alcoholPercentage: '',
    volume: '',
    images: [],
    isActive: true,
  });

  const categories = [
    'Beer', 'Wine', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Brandy', 'Tequila', 'Other'
  ];

  const updateField = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // Show image picker options
  const showImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option to add product images',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Open camera
  const openCamera = async () => {
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

    launchCamera(options, handleImageResponse);
  };

  // Open gallery
  const openGallery = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
      selectionLimit: 5 - formData.images.length, // Limit based on current images
    };

    launchImageLibrary(options, handleImageResponse);
  };

  // Handle image picker response
  const handleImageResponse = (response: ImagePickerResponse) => {
    if (response.didCancel || response.errorMessage) {
      return;
    }

    if (response.assets && response.assets.length > 0) {
      const newImages = response.assets
        .filter(asset => asset.uri)
        .map(asset => asset.uri!);
      
      updateField('images', [...formData.images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateField('images', newImages);
  };

  const validateForm = () => {
    const required = ['name', 'brand', 'category', 'price', 'stock'];
    const missing = required.filter(field => !formData[field as keyof ProductForm]);
    
    if (missing.length > 0) {
      Alert.alert('Error', `Please fill in: ${missing.join(', ')}`);
      return false;
    }

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Price must be a valid number greater than 0');
      return false;
    }

    if (isNaN(stock) || stock < 0) {
      Alert.alert('Error', 'Stock must be a valid number (0 or greater)');
      return false;
    }

    if (formData.mrp && parseFloat(formData.mrp) < price) {
      Alert.alert('Error', 'MRP cannot be less than selling price');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      console.log('Submitting product data:', {
        ...formData,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : parseFloat(formData.price),
        stock: parseInt(formData.stock),
        alcoholPercentage: formData.alcoholPercentage ? parseFloat(formData.alcoholPercentage) : undefined,
        volume: formData.volume ? parseInt(formData.volume) : undefined,
        imagesCount: formData.images.length,
      });

      const productData = {
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : undefined,
        stock: parseInt(formData.stock),
        alcoholPercentage: formData.alcoholPercentage ? parseFloat(formData.alcoholPercentage) : undefined,
        volume: formData.volume ? parseInt(formData.volume) : undefined,
        images: formData.images.length > 0 ? formData.images : undefined,
        isActive: formData.isActive,
        lowStockThreshold: 5, // Default threshold
      };

      await dispatch(addProduct(productData)).unwrap();

      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Add product error:', error);
      
      // Handle validation errors
      if (error?.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        Alert.alert('Validation Error', errorMessages);
      } else {
        Alert.alert('Error', error || 'Failed to add product. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <View style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image }} style={styles.productImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                  activeOpacity={0.8}
                >
                  <Icon name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            
            {formData.images.length < 5 && (
              <TouchableOpacity 
                style={styles.addImageButton} 
                onPress={showImagePicker}
                activeOpacity={0.8}
              >
                <Icon name="add-a-photo" size={32} color="#4CAF50" />
                <Text style={styles.addImageText}>Add Image</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.imageHint}>
            Add up to 5 product images. First image will be the main product photo.
          </Text>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter product name (e.g., Premium Whiskey 750ml)"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter brand name (e.g., Royal Stag)"
              value={formData.brand}
              onChangeText={(text) => updateField('brand', text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryButton,
                    formData.category === category && styles.selectedCategory
                  ]}
                  onPress={() => updateField('category', category)}
                  activeOpacity={0.8}
                >
                  <Text style={[
                    styles.categoryText,
                    formData.category === category && styles.selectedCategoryText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Enter product description, special features, etc."
              value={formData.description}
              onChangeText={(text) => updateField('description', text)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* Pricing & Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Selling Price * (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.price}
                onChangeText={(text) => updateField('price', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>MRP (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.mrp}
                onChangeText={(text) => updateField('mrp', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Stock Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter available stock quantity"
              value={formData.stock}
              onChangeText={(text) => updateField('stock', text)}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {formData.price && formData.mrp && parseFloat(formData.mrp) > parseFloat(formData.price) && (
            <View style={styles.discountInfo}>
              <Icon name="local-offer" size={16} color="#4CAF50" />
              <Text style={styles.discountText}>
                {Math.round(((parseFloat(formData.mrp) - parseFloat(formData.price)) / parseFloat(formData.mrp)) * 100)}% discount
              </Text>
            </View>
          )}
        </View>

        {/* Product Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Alcohol % (ABV)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.0"
                value={formData.alcoholPercentage}
                onChangeText={(text) => updateField('alcoholPercentage', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Volume (ml)</Text>
              <TextInput
                style={styles.input}
                placeholder="750"
                value={formData.volume}
                onChangeText={(text) => updateField('volume', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.label}>Make Product Available</Text>
              <Text style={styles.switchDescription}>
                Customers can order this product when it's active
              </Text>
            </View>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => updateField('isActive', value)}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={formData.isActive ? '#fff' : '#f4f3f4'}
              ios_backgroundColor="#767577"
            />
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Product:</Text>
              <Text style={styles.summaryValue}>
                {formData.name || 'Product name'} {formData.brand && `by ${formData.brand}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Category:</Text>
              <Text style={styles.summaryValue}>{formData.category || 'Not selected'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Price:</Text>
              <Text style={styles.summaryValue}>₹{formData.price || '0'}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Stock:</Text>
              <Text style={styles.summaryValue}>{formData.stock || '0'} units</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Images:</Text>
              <Text style={styles.summaryValue}>{formData.images.length} added</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Status:</Text>
              <Text style={[
                styles.summaryValue,
                { color: formData.isActive ? '#4CAF50' : '#F44336' }
              ]}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Icon name="add" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding Product...' : 'Add Product'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  imageItem: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#F44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fdf8',
  },
  addImageText: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 4,
    textAlign: 'center',
  },
  imageHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  selectedCategory: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  discountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  discountText: {
    fontSize: 12,
    color: '#2E7D32',
    marginLeft: 6,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  summaryContainer: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AddProductScreen;
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';

// Import Redux actions
import { 
  updateProduct, 
  deleteProduct, 
  getInventoryProduct,
  // clearCurrentProduct,
  clearError
} from '@store/slices/shopSlice';

interface ProductForm {
  name: string;
  brand: string;
  category: string;
  description: string;
  price: string;
  stock: string;
  alcoholPercentage: string;
  volume: string;
  images: string[];
  isActive: boolean;
  lowStockThreshold: string;
  notes: string;
}

interface RootState {
  shop: {
    currentProduct: any;
    inventoryLoading: boolean;
    inventoryError: string | null;
  };
}

const EditProductScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { productId } = route.params as { productId: string };
  
  // Get state from Redux
  const currentProduct = useSelector((state: RootState) => state.shop.currentProduct);
  const loading = useSelector((state: RootState) => state.shop.inventoryLoading);
  const error = useSelector((state: RootState) => state.shop.inventoryError);

  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    stock: '',
    alcoholPercentage: '',
    volume: '',
    images: [],
    isActive: true,
    lowStockThreshold: '',
    notes: '',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const categories = [
    'Beer', 'Wine', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Brandy', 'Tequila', 'Other'
  ];

  useEffect(() => {
    // Load product data when component mounts
    if (productId) {
      dispatch(getInventoryProduct(productId));
    }

    // Clear current product when component unmounts
    // return () => {
    //   dispatch(clearCurrentProduct());
    // };
  }, [dispatch, productId]);

  useEffect(() => {
    // Populate form when product data is loaded
    if (currentProduct) {
      setFormData({
        name: currentProduct.product?.name || '',
        brand: currentProduct.product?.brand || '',
        category: currentProduct.product?.category || '',
        description: currentProduct.product?.description || '',
        price: currentProduct.selling_price?.toString() || '',
        stock: currentProduct.stock?.toString() || '',
        alcoholPercentage: currentProduct.product?.alcohol_percentage?.toString() || '',
        volume: currentProduct.product?.volume_ml?.toString() || '',
        images: currentProduct.product?.images || [],
        isActive: currentProduct.is_available ?? true,
        lowStockThreshold: currentProduct.low_stock_threshold?.toString() || '',
        notes: currentProduct.notes || '',
      });
    }
  }, [currentProduct]);

  useEffect(() => {
    // Handle errors
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const updateField = (field: keyof ProductForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
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
      selectionLimit: 5 - formData.images.length,
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

    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      const updateData: any = {};
      
      // Only include changed fields
      if (formData.name !== currentProduct?.product?.name) {
        updateData.name = formData.name;
      }
      if (formData.brand !== currentProduct?.product?.brand) {
        updateData.brand = formData.brand;
      }
      if (formData.category !== currentProduct?.product?.category) {
        updateData.category = formData.category;
      }
      if (formData.description !== (currentProduct?.product?.description || '')) {
        updateData.description = formData.description;
      }
      if (parseFloat(formData.price) !== currentProduct?.selling_price) {
        updateData.price = parseFloat(formData.price);
      }
      if (parseInt(formData.stock) !== currentProduct?.stock) {
        updateData.stock = parseInt(formData.stock);
      }
      if (formData.alcoholPercentage && parseFloat(formData.alcoholPercentage) !== currentProduct?.product?.alcohol_percentage) {
        updateData.alcoholPercentage = parseFloat(formData.alcoholPercentage);
      }
      if (formData.volume && parseInt(formData.volume) !== currentProduct?.product?.volume_ml) {
        updateData.volume = parseInt(formData.volume);
      }
      if (formData.isActive !== currentProduct?.is_available) {
        updateData.isActive = formData.isActive;
      }
      if (formData.lowStockThreshold && parseInt(formData.lowStockThreshold) !== currentProduct?.low_stock_threshold) {
        updateData.lowStockThreshold = parseInt(formData.lowStockThreshold);
      }
      if (formData.notes !== (currentProduct?.notes || '')) {
        updateData.notes = formData.notes;
      }
      
      // Handle images if they've changed
      const currentImages = currentProduct?.product?.images || [];
      if (JSON.stringify(formData.images) !== JSON.stringify(currentImages)) {
        updateData.images = formData.images;
      }

      console.log('Update data:', updateData);

      await dispatch(updateProduct({
        productId,
        productData: updateData,
      })).unwrap();

      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setHasChanges(false);
    } catch (error: any) {
      console.error('Update product error:', error);
      
      // Handle validation errors
      if (error?.errors) {
        const errorMessages = Object.entries(error.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        Alert.alert('Validation Error', errorMessages);
      } else {
        Alert.alert('Error', error || 'Failed to update product. Please try again.');
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete "${currentProduct?.product?.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteProduct(productId)).unwrap();
              Alert.alert('Success', 'Product deleted successfully!', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error || 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (loading && !currentProduct) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading product...</Text>
      </View>
    );
  }

  if (!currentProduct && !loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Icon name="error" size={64} color="#ccc" />
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Product</Text>
        <TouchableOpacity 
          onPress={handleDelete} 
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Icon name="delete" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Preview */}
        <View style={styles.previewCard}>
          <View style={styles.productImage}>
            {formData.images.length > 0 ? (
              <Image source={{ uri: formData.images[0] }} style={styles.previewImageStyle} />
            ) : (
              <Icon name="local-drink" size={48} color="#4CAF50" />
            )}
          </View>
          <View style={styles.previewInfo}>
            <Text style={styles.previewName}>{formData.name || 'Product Name'}</Text>
            <Text style={styles.previewBrand}>{formData.brand || 'Brand'}</Text>
            <Text style={styles.previewCategory}>{formData.category || 'Category'}</Text>
            {hasChanges && (
              <View style={styles.changedBadge}>
                <Text style={styles.changedText}>• Unsaved changes</Text>
              </View>
            )}
          </View>
        </View>

        {/* Product Images */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Images</Text>
          <View style={styles.imagesContainer}>
            {formData.images.map((image, index) => (
              <View key={index} style={styles.imageItem}>
                <Image source={{ uri: image }} style={styles.productImageStyle} />
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
                <Icon name="add-a-photo" size={24} color="#4CAF50" />
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
              placeholder="Enter product name"
              value={formData.name}
              onChangeText={(text) => updateField('name', text)}
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter brand name"
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
              placeholder="Enter product description"
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
              <Text style={styles.label}>Price * (₹)</Text>
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
              <Text style={styles.label}>Stock *</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                value={formData.stock}
                onChangeText={(text) => updateField('stock', text)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Low Stock Threshold</Text>
            <TextInput
              style={styles.input}
              placeholder="5"
              value={formData.lowStockThreshold}
              onChangeText={(text) => updateField('lowStockThreshold', text)}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any additional notes about this product..."
              value={formData.notes}
              onChangeText={(text) => updateField('notes', text)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.switchContainer}>
            <View style={styles.switchInfo}>
              <Text style={styles.label}>Product Availability</Text>
              <Text style={styles.switchDescription}>
                Toggle to make this product {formData.isActive ? 'unavailable' : 'available'} for customers
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

        {/* Current Statistics */}
        {currentProduct && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Statistics</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Icon name="inventory" size={24} color="#2196F3" />
                <Text style={styles.statValue}>{currentProduct.stock}</Text>
                <Text style={styles.statLabel}>Current Stock</Text>
              </View>
              <View style={styles.statCard}>
                <Icon name="attach-money" size={24} color="#4CAF50" />
                <Text style={styles.statValue}>₹{currentProduct.selling_price}</Text>
                <Text style={styles.statLabel}>Current Price</Text>
              </View>
              <View style={styles.statCard}>
                <Icon 
                  name={currentProduct.is_available ? "check-circle" : "cancel"} 
                  size={24} 
                  color={currentProduct.is_available ? "#4CAF50" : "#F44336"} 
                />
                <Text style={[
                  styles.statValue,
                  { color: currentProduct.is_available ? "#4CAF50" : "#F44336" }
                ]}>
                  {currentProduct.is_available ? "Available" : "Unavailable"}
                </Text>
                <Text style={styles.statLabel}>Status</Text>
              </View>
            </View>
          </View>
        )}

        {/* Warning Section */}
        <View style={styles.warningSection}>
          <View style={styles.warningCard}>
            <Icon name="info" size={20} color="#2196F3" />
            <Text style={styles.warningText}>
              Changes will be reflected immediately in your store. Make sure all information is correct before saving.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.updateButton, (loading || !hasChanges) && styles.updateButtonDisabled]}
          onPress={()=>handleUpdate()}
          disabled={loading || !hasChanges}
          activeOpacity={0.8}
        >
          <Icon name="save" size={20} color="#fff" />
          <Text style={styles.updateButtonText}>
            {loading ? 'Updating...' : hasChanges ? 'Save Changes' : 'No Changes'}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  previewImageStyle: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  previewBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  previewCategory: {
    fontSize: 12,
    color: '#999',
  },
  changedBadge: {
    marginTop: 4,
  },
  changedText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: '500',
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
    width: 70,
    height: 70,
  },
  productImageStyle: {
    width: 70,
    height: 70,
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
    width: 70,
    height: 70,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fdf8',
  },
  addImageText: {
    fontSize: 8,
    color: '#4CAF50',
    marginTop: 2,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  warningSection: {
    marginBottom: 20,
  },
  warningCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningText: {
    fontSize: 12,
    color: '#1976D2',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  updateButton: {
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
  updateButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProductScreen;
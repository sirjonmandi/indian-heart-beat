import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import Redux actions
import {
  fetchInventory,
  updateProductAvailability,
  updateProductStock,
  updateProductPrice,
  clearError,
} from '@store/slices/shopSlice';

interface InventoryItem {
  id: string;
  product: {
    id: string;
    name: string;
    brand: string;
    category: string;
    description?: string;
    images?: string[];
  };
  selling_price: number;
  stock: number;
  low_stock_threshold: number;
  is_available: boolean;
  is_featured?: boolean;
  last_updated: string;
}

interface RootState {
  shop: {
    inventory: InventoryItem[];
    inventoryLoading: boolean;
    inventoryError: string | null;
  };
}

// Edit Modal Component
const EditModal = ({ item, onSave, onCancel }: any) => {
  const [value, setValue] = useState(item.value.toString());

  const handleSave = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      Alert.alert('Error', 'Please enter a valid positive number');
      return;
    }
    onSave(numValue);
  };

  return (
    <Modal visible={true} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            Update {item.type === 'stock' ? 'Stock' : 'Price'}
          </Text>
          <TextInput
            style={styles.modalInput}
            value={value}
            onChangeText={setValue}
            keyboardType="numeric"
            placeholder={item.type === 'stock' ? 'Enter stock quantity' : 'Enter price'}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.modalCancelButton} onPress={onCancel}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalSaveButton} onPress={handleSave}>
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ShopInventoryScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Use direct state selectors instead of imported selectors
  const inventory = useSelector((state: RootState) => state.shop.inventory || []);
  const loading = useSelector((state: RootState) => state.shop.inventoryLoading || false);
  const error = useSelector((state: RootState) => state.shop.inventoryError);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (error) {
      showErrorAlert(error);
    }
  }, [error]);

  const loadInventory = async () => {
    try {
      await dispatch(fetchInventory()).unwrap();
    } catch (error) {
      console.error('Failed to load inventory:', error);
    }
  };

  const showErrorAlert = (errorMessage: string) => {
    Alert.alert(
      'Error',
      errorMessage,
      [
        { 
          text: 'Try Again', 
          onPress: () => {
            dispatch(clearError());
            loadInventory();
          }
        },
        { 
          text: 'OK', 
          onPress: () => dispatch(clearError()),
          style: 'cancel'
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadInventory();
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleToggleAvailability = async (productId: string, isAvailable: boolean) => {
    try {
      await dispatch(updateProductAvailability({
        productId,
        isAvailable,
      })).unwrap();
      
      Alert.alert(
        'Product Updated',
        `Product is now ${isAvailable ? 'available' : 'unavailable'}`
      );
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update product availability');
    }
  };

  const handleUpdateStock = async (productId: string, stock: number) => {
    try {
      await dispatch(updateProductStock({
        productId,
        stock,
      })).unwrap();
      
      Alert.alert('Success', `Stock updated to ${stock}`);
      setEditingItem(null);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update stock');
    }
  };

  const handleUpdatePrice = async (productId: string, price: number) => {
    try {
      await dispatch(updateProductPrice({
        productId,
        price,
      })).unwrap();
      
      Alert.alert('Success', `Price updated to ₹${price}`);
      setEditingItem(null);
    } catch (error: any) {
      Alert.alert('Error', error || 'Failed to update price');
    }
  };

  const handleEditProduct = (productId: string) => {
    navigation.navigate('EditProduct' as never, { productId } as never);
  };

  const filteredInventory = inventory.filter((item: InventoryItem) =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderInventoryItem = ({ item }: { item: InventoryItem }) => (
    <View style={styles.inventoryCard}>
      <View style={styles.productInfo}>
        <View style={styles.productImage}>
          { item.product.images && item.product.images.length > 0 ? (
            <Image source={{ uri: item.product.images[0]}} style={styles.previewImageStyle}/>
          ) : (
            <Icon name="local-drink" size={40} color="#4CAF50" />
          )}
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.productBrand}>{item.product.brand}</Text>
          <Text style={styles.productCategory}>{item.product.category}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditProduct(item.id)}
            activeOpacity={0.7}
          >
            <Icon name="edit" size={16} color="#2196F3" />
          </TouchableOpacity>
          <View style={[
            styles.availabilityBadge,
            item.is_available ? styles.availableBadge : styles.unavailableBadge
          ]}>
            <Text style={[
              styles.availabilityText,
              item.is_available ? styles.availableText : styles.unavailableText
            ]}>
              {item.is_available ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.inventoryInfo}>
        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => setEditingItem({ id: item.id, type: 'stock', value: item.stock })}
          activeOpacity={0.7}
        >
          <Text style={styles.infoLabel}>Stock:</Text>
          <View style={styles.stockContainer}>
            <Text style={[
              styles.stockValue,
              item.stock <= (item.low_stock_threshold || 5) && styles.lowStock
            ]}>
              {item.stock}
            </Text>
            <Icon name="edit" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.infoItem}
          onPress={() => setEditingItem({ id: item.id, type: 'price', value: item.selling_price })}
          activeOpacity={0.7}
        >
          <Text style={styles.infoLabel}>Price:</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceValue}>₹{item.selling_price}</Text>
            <Icon name="edit" size={16} color="#666" />
          </View>
        </TouchableOpacity>

        <View style={styles.availabilityInfo}>
          <Text style={styles.infoLabel}>Available:</Text>
          <Switch
            value={item.is_available}
            onValueChange={(value) => handleToggleAvailability(item.id, value)}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={item.is_available ? '#fff' : '#f4f3f4'}
            ios_backgroundColor="#767577"
          />
        </View>
      </View>

      {item.stock <= (item.low_stock_threshold || 5) && (
        <View style={styles.lowStockWarning}>
          <Icon name="warning" size={16} color="#FF9800" />
          <Text style={styles.warningText}>
            {item.stock === 0 ? 'Out of Stock' : `Low Stock Alert - Only ${item.stock} left`}
          </Text>
        </View>
      )}
    </View>
  );

  // Calculate stats
  const totalProducts = inventory.length;
  const lowStockCount = inventory.filter(item => item.stock <= (item.low_stock_threshold || 5)).length;
  const availableCount = inventory.filter(item => item.is_available).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory Management</Text>
        <Text style={styles.headerSubtitle}>{totalProducts} products in stock</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products, brands, categories..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct' as never)}
          activeOpacity={0.8}
        >
          <Icon name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Inventory Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalProducts}</Text>
          <Text style={styles.statLabel}>Total Products</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, lowStockCount > 0 && styles.warningValue]}>
            {lowStockCount}
          </Text>
          <Text style={styles.statLabel}>Low Stock</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{availableCount}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
      </View>

      <FlatList
        data={filteredInventory}
        renderItem={renderInventoryItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="inventory" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {loading ? 'Loading inventory...' : 
               searchQuery ? 'No products found' : 'No products in inventory'}
            </Text>
            <Text style={styles.emptySubtext}>
              {loading ? 'Please wait...' :
               searchQuery ? 'Try searching with different keywords' : 'Add your first product to get started'}
            </Text>
            {!searchQuery && !loading && (
              <TouchableOpacity 
                style={styles.addFirstButton}
                onPress={() => navigation.navigate('AddProduct' as never)}
                activeOpacity={0.8}
              >
                <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Edit Modal */}
      {editingItem && (
        <EditModal
          item={editingItem}
          onSave={(value) => {
            if (editingItem.type === 'stock') {
              handleUpdateStock(editingItem.id, value);
            } else {
              handleUpdatePrice(editingItem.id, value);
            }
          }}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 8,
    borderRadius: 20,
    marginLeft: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  warningValue: {
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  inventoryCard: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  productImage: {
    width: 60,
    height: 60,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  productCategory: {
    fontSize: 12,
    color: '#999',
  },
  actionButtons: {
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  availabilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  availableBadge: {
    backgroundColor: '#E8F5E8',
  },
  unavailableBadge: {
    backgroundColor: '#FFEBEE',
  },
  availabilityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  availableText: {
    color: '#2E7D32',
  },
  unavailableText: {
    color: '#C62828',
  },
  inventoryInfo: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stockValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lowStock: {
    color: '#FF9800',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  availabilityInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lowStockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 12,
    color: '#E65100',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#666',
    fontWeight: 'bold',
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  previewImageStyle: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
});

export default ShopInventoryScreen;
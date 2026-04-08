import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../../utils/constants';

const { width } = Dimensions.get('window');

const StoreDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { store } = route.params;
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState({});

  const categories = ['All', 'Beer', 'Wine', 'Whiskey', 'Vodka', 'Rum'];
  
  const products = [
    {
      id: 1,
      name: 'Kingfisher Strong',
      brand: 'Kingfisher',
      price: 65,
      mrp: 70,
      volume: '650ml',
      rating: 4.2,
      category: 'Beer',
      inStock: true,
      discount: 7
    },
    {
      id: 2,
      name: 'Absolut Vodka',
      brand: 'Absolut',
      price: 2800,
      mrp: 3200,
      volume: '750ml',
      rating: 4.8,
      category: 'Vodka',
      inStock: true,
      discount: 12
    },
    {
      id: 3,
      name: 'Sula Sauvignon Blanc',
      brand: 'Sula',
      price: 850,
      mrp: 950,
      volume: '750ml',
      rating: 4.5,
      category: 'Wine',
      inStock: false,
      discount: 11
    }
  ];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const addToCart = (product: any) => {
    setCartItems(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
    }));
  };

  const removeFromCart = (product: any) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[product.id] > 1) {
        newCart[product.id] -= 1;
      } else {
        delete newCart[product.id];
      }
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cartItems).reduce((sum: number, count: number) => sum + count, 0);
  };

  const renderCategoryItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(item)}
    >
      <Text style={[
        styles.categoryChipText,
        selectedCategory === item && styles.categoryChipTextActive
      ]}>
        {item}
      </Text>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={[styles.productCard, !item.inStock && styles.productCardOutOfStock]}>
      <View style={styles.productImageContainer}>
        <View style={styles.productImagePlaceholder}>
          {item.category === 'Beer' && <Text style={styles.productEmoji}>🍺</Text>}
          {item.category === 'Wine' && <Text style={styles.productEmoji}>🍷</Text>}
          {item.category === 'Whiskey' && <Text style={styles.productEmoji}>🥃</Text>}
          {item.category === 'Vodka' && <Text style={styles.productEmoji}>🍸</Text>}
          {item.category === 'Rum' && <Text style={styles.productEmoji}>🥤</Text>}
        </View>
        {item.discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{item.discount}% OFF</Text>
          </View>
        )}
        {!item.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productBrand}>{item.brand}</Text>
        <Text style={styles.productVolume}>{item.volume}</Text>
        
        <View style={styles.productRating}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.mrp > item.price && (
            <Text style={styles.productMrp}>₹{item.mrp}</Text>
          )}
        </View>
        
        {item.inStock ? (
          cartItems[item.id] ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => removeFromCart(item)}
              >
                <Icon name="remove" size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{cartItems[item.id]}</Text>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => addToCart(item)}
              >
                <Icon name="add" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity style={styles.notifyButton}>
            <Text style={styles.notifyButtonText}>NOTIFY</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <View style={styles.storeHeaderInfo}>
            <Text style={styles.storeHeaderName}>{store.name}</Text>
            <View style={styles.storeHeaderDetails}>
              <Icon name="star" size={16} color="#2C2C2C" />
              <Text style={styles.storeHeaderRating}>{store.rating}</Text>
              <Text style={styles.storeHeaderSeparator}>•</Text>
              <Text style={styles.storeHeaderTime}>{store.deliveryTime}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate(Constants.SCREENS.CART)}>
            <View style={styles.cartButton}>
              <Icon name="shopping-cart" size={20} color="#2C2C2C" />
              {getTotalItems() > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Products */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.productsList}
        columnWrapperStyle={styles.productRow}
      />

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <TouchableOpacity
          style={styles.cartSummary}
          onPress={() => navigation.navigate(Constants.SCREENS.CART)}
        >
          <View style={styles.cartSummaryLeft}>
            <Text style={styles.cartItemCount}>{getTotalItems()} items</Text>
            <Text style={styles.cartTotal}>₹{
              Object.entries(cartItems).reduce((total, [productId, quantity]) => {
                const product = products.find(p => p.id === parseInt(productId));
                return total + (product?.price || 0) * quantity;
              }, 0)
            }</Text>
          </View>
          <View style={styles.cartSummaryRight}>
            <Text style={styles.viewCartText}>View Cart</Text>
            <Icon name="arrow-forward" size={16} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeHeaderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  storeHeaderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  storeHeaderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  storeHeaderRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  storeHeaderSeparator: {
    marginHorizontal: 6,
    color: '#2C2C2C',
  },
  storeHeaderTime: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#2C2C2C',
    fontWeight: 'bold',
  },
  productsList: {
    padding: 16,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardOutOfStock: {
    opacity: 0.6,
  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productEmoji: {
    fontSize: 32,
  },
  discountBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productVolume: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  productMrp: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityButton: {
    backgroundColor: '#2C2C2C',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginHorizontal: 12,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notifyButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  notifyButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  cartSummaryLeft: {
    flex: 1,
  },
  cartItemCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  cartTotal: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartSummaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default StoreDetailScreen;
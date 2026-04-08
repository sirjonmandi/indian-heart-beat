// ===============================================
// PRODUCT CARD COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';

const { width } = Dimensions.get('window');

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  volume: string;
  volume_unit: string;
  category: string;
  inStock: boolean;
  alcoholContent: string;
  images?: string;
}

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  onAddToCart
}) => {
  // console.log('=============== product is =====================');
  // console.log(JSON.stringify(product,null,2));
  // console.log('====================================');
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const renderProductImage = () => {
    const isSpecialBottle = product.name.includes('Johnnie Walker') || 
                           product.name.includes('whiskey') || 
                           product.name.includes('Whiskey');
    if (product.images && product.images.length > 0) {
      return (
        <View style={[styles.bottleContainer, {height:140 ,width: 140}]}>
          <Image source={{ uri: product.images[0]}} style={styles.previewImageStyle} resizeMode="cover"/>
        </View>
      );
    }
    if (isSpecialBottle) {
      return (
        <View style={[styles.bottleContainer, {height:140 ,width: 140}]}>
          <Image source={require('../../../assets/images/app_logo.png')} style={styles.previewImageStyle} resizeMode="cover"/>
        </View>
      );
    } else {
      return (
        <View style={[styles.bottleContainer, {height:140 ,width: 140}]}>
          <Image source={require('../../../assets/images/app_logo.png')} style={styles.previewImageStyle} resizeMode="cover"/>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => onPress(product)}
    >
      {/* Product Image */}
      <View style={styles.productImageContainer}>
        {renderProductImage()}
        
        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
          </View>
        )}
        
        {/* Add Button */}
        <TouchableOpacity 
          style={[styles.addButton, !product.inStock && styles.addButtonDisabled]}
          onPress={() => onAddToCart(product)}
          disabled={!product.inStock}
        >
          <Text style={styles.addButtonText}>
            {product.inStock ? '+' : 'OUT'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Product Details */}
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productVolume}>{product.variant_name}</Text>
        {/* <Text style={styles.productVolume}>{product.volume} {product.volume_unit}</Text> */}
        
        {/* Rating and Alcohol Content */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingContainer}>
            {/* <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {product.rating}</Text>
            </View> */}
          </View>
          {/* <Text style={styles.alcoholContent}>{product.alcoholContent}% Alcohol</Text> */}
        </View>
        
        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>₹{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: (width - 32) / 2 - 8,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImageContainer: {
    height: 140,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bottleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkBottle: {
    width: 35,
    height: 100,
    backgroundColor: '#2C1810',
    borderRadius: 6,
    position: 'relative',
  },
  bottleLabel: {
    width: 30,
    height: 20,
    backgroundColor: '#D4AF37',
    borderRadius: 3,
    position: 'absolute',
    top: 30,
  },
  beerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  beerBottle: {
    width: 25,
    height: 90,
    backgroundColor: '#8B4513',
    borderRadius: 4,
  },
  beerLabel: {
    width: 20,
    height: 40,
    backgroundColor: '#228B22',
    borderRadius: 2,
    position: 'absolute',
    top: 25,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF4444',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#999',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
    marginBottom: 4,
    lineHeight: 18,
  },
  productVolume: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingContainer: {
    flex: 1,
  },
  ratingBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alcoholContent: {
    fontSize: 10,
    color: Colors.textWhite,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  previewImageStyle: {
    width: '100%',
    height: '100%',
  },
});

export default ProductCard;
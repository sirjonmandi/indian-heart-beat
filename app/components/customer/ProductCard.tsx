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
  Image,
  ImageBackground
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
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
      <ImageBackground source={
        product.images && product.images.length > 0 ?
        {uri:product.images?.[0]}
        : require('../../../assets/images/app_logo.png')
        } style={{ flex: 1 }} imageStyle={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <View style={styles.productImageContainer}>
          {/* Rating Badge */}
          {discountPercentage > 0 && (
            <View style={styles.ratingBadge}>
              <Text style={styles.discountText}>{discountPercentage}% OFF</Text>
            </View>)}
            {/* Favourite */}
            <TouchableOpacity 
            style={[styles.favButton, !product.inStock && styles.addButtonDisabled]}
            onPress={() => onAddToCart(product)}
            disabled={!product.inStock}
            >
              {product.inStock ?
               <Icon name='add' size={17} style={{fontWeight: 'bold'}} color={Colors.success} />
               :
                  <Text style={styles.addButtonText}>
                    {'OUT'}
                  </Text>
                }
              
            </TouchableOpacity>
        </View>
        {/* Card Footer */}
        <View style={styles.foodCardFooter}>
          <View style={{ flex: 1 }}>
            <Text style={styles.foodName}>{product.name}</Text>
            <View style={styles.foodMeta}>
              <Text style={styles.metaText}>{product.variant_name}</Text>
              <View style={{flexDirection: 'row', gap: 6, alignItems: 'center'}}>
                <Text style={[styles.metaText,{ fontWeight: 'bold',color: Colors.success,fontSize: 16}]}>₹ {product.price}</Text>
                {product.originalPrice != product.price && (
                  <Text style={[styles.metaText, { textDecorationLine: 'line-through', fontWeight:700 }]}>₹{product.originalPrice}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};
const ORANGE = Colors.primaryBg;
const BG = '#FFFFFF';
const WHITE = '#f7f6f9ff';
const DARK = '#1A1A1A';
const GRAY = '#888888';
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
    maxHeight: 140,
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
    color: Colors.black,
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
    marginTop: 8,
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alcoholContent: {
    fontSize: 10,
    color: Colors.black,
    textAlign: 'right',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
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

  foodCardFooter: {
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    height: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '800',
    color: DARK,
    marginBottom: 4,
  },
  foodMeta: {
    // flexDirection: 'row',
    // alignItems: 'center',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 11,
    color: GRAY,
  },
  metaDot: {
    fontSize: 11,
    color: GRAY,
    marginHorizontal: 3,
  },
  arrowButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  arrowIcon: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
  },
  favButton: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
});

export default ProductCard;
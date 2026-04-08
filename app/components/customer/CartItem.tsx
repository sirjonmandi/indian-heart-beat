// ===============================================
// CART ITEM COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export interface CartItemData {
  id: string;
  variantId?: string;
  name: string;
  brand: string;
  volume: string;
  image:string[];
  price: number;
  originalPrice?: number;
  quantity: number;
  category: string;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (cartItemKey: string, quantity: number) => void;
  onRemove: (cartItemKey: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({
  item,
  onQuantityChange,
  onRemove
}) => {
  const renderProductImage = () => {
    if (Array.isArray(item.image) && item.image.length > 0) {
      return (
        <>
          <Image source={{uri: item.image[0]}} style={{height:60, width:60, borderRadius:8}} />
        </>
      );
    } else {
      return (
        <View style={styles.beerContainer}>
          <Image source={require('../../../assets/images/app_logo.png')} style={{height:60, width:60, borderRadius:8}} />
        </View>
      );
    }

  };

  const handleQuantityDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.cartItemKey, item.quantity - 1);
    } else {
      onRemove(item.cartItemKey);
    }
  };

  const handleQuantityIncrease = () => {
    onQuantityChange(item.cartItemKey, item.quantity + 1);
  };

  return (
    <View style={styles.cartItem}>
      <View style={styles.productImageContainer}>
        {renderProductImage()}
      </View>
      
      <View style={styles.productDetails}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productVolume}>{item.volume}</Text>
        
        <View style={styles.priceRow}>
          <Text style={styles.currentPrice}>₹ {item.price}</Text>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>₹ {item.originalPrice}</Text>
          )}
        </View>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={handleQuantityDecrease}
          >
            <Icon 
              name={item.quantity === 1 ? "delete" : "remove"} 
              size={16} 
              color={item.quantity === 1 ? "#FF4444" : "#4CAF50"} 
            />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={handleQuantityIncrease}
          >
            <Icon name="add" size={16} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        <Text style={styles.totalPrice}>₹ {item.price * item.quantity}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    padding: 16,
    marginHorizontal: 16,
    marginTop:14,
    marginVertical: 4,
    borderRadius: 8,
    // borderColor:'#e5383b',
    // borderBottomWidth:2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  whiskeyContainer: {
    position: 'relative',
    width: 40,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiskeyBottle: {
    width: 25,
    height: 60,
    backgroundColor: '#2C1810',
    borderRadius: 4,
  },
  whiskeyLabel: {
    width: 20,
    height: 15,
    backgroundColor: '#D4AF37',
    borderRadius: 2,
    position: 'absolute',
    top: 20,
  },
  beerContainer: {
    width: 40,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  beerBottle: {
    width: 20,
    height: 55,
    backgroundColor: '#8B4513',
    borderRadius: 3,
  },
  beerLabel: {
    width: 15,
    height: 25,
    backgroundColor: '#228B22',
    borderRadius: 2,
    position: 'absolute',
    top: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
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
    color: Colors.textWhite,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textWhite,
    minWidth: 20,
    textAlign: 'center',
  },
  rightSection: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
});

export default CartItem;
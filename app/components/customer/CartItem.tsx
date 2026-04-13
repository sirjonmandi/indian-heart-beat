// ===============================================
// CART ITEM COMPONENT — Redesigned
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
  cartItemKey: string;
  variantId?: string;
  name: string;
  brand: string;
  volume: string;
  image: string[];
  price: number;
  originalPrice?: number;
  quantity: number;
  rating?: number;
  category: string;
}

interface CartItemProps {
  item: CartItemData;
  onQuantityChange: (cartItemKey: string, quantity: number) => void;
  onRemove: (cartItemKey: string) => void;
}

const ORANGE = Colors.primaryBg; // primary accent colour — matches the + button and star in the screenshot

const CartItem: React.FC<CartItemProps> = ({ item, onQuantityChange, onRemove }) => {
  const handleDecrease = () => {
    if (item.quantity > 1) {
      onQuantityChange(item.cartItemKey, item.quantity - 1);
    } else {
      onRemove(item.cartItemKey);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(item.cartItemKey, item.quantity + 1);
  };

  const imageSource =
    Array.isArray(item.image) && item.image.length > 0
      ? item.image[0]
      : require('../../../assets/images/app_logo.png');
    // Array.isArray(item.image) && item.image.length > 0
    //   ? { uri: item.image[0] }
    //   : require('../../../assets/images/app_logo.png');

  return (
    <View style={styles.row}>
      {/* ── Left: square food image ── */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* ── Middle: name / brand / price / stepper ── */}
      <View style={styles.middle}>
        {/* top row: name + rating */}
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {/* <View style={styles.ratingPill}>
            <Icon name="star" size={13} color={ORANGE} />
            <Text style={styles.ratingText}>{item.rating ?? 4.5}</Text>
          </View> */}
        </View>

        {/* brand / subtitle */}
        {/* <Text style={styles.brand}>By {item.brand}</Text> */}
        <View style={{ height: 10 }} />
          
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* price */}
          <Text style={styles.price}>₹ {item.price.toFixed(2)}</Text>

          {/* stepper */}
          <View style={styles.stepper}>
            {/* minus — plain circle outline */}
            <TouchableOpacity style={styles.minusBtn} onPress={handleDecrease} activeOpacity={0.7}>
              <Icon
                name={item.quantity === 1 ? 'delete-outline' : 'remove'}
                size={16}
                color={item.quantity === 1 ? Colors.error : '#555'}
              />
            </TouchableOpacity>

            <Text style={styles.qty}>{item.quantity}</Text>

            {/* plus — filled orange circle */}
            <TouchableOpacity style={styles.plusBtn} onPress={handleIncrease} activeOpacity={0.8}>
              <Icon name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderBottomColor: '#EFEFEF',
  },

  // ── Image ──────────────────────────────────────
  image: {
    width: 110,
    height: 100,
    borderRadius: 10,
    marginRight: 14,
    backgroundColor: '#F2F2F2',
  },

  // ── Middle column ──────────────────────────────
  middle: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },

  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },

  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: ORANGE,
  },

  brand: {
    fontSize: 13,
    color: '#9E9E9E',
    marginBottom: 8,
  },

  price: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },

  // ── Stepper ────────────────────────────────────
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },

  minusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qty: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    minWidth: 28,
    textAlign: 'center',
  },

  plusBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default CartItem;
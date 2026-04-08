// ===============================================
// CART FOOTER COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

interface CartFooterProps {
  itemCount: number;
  totalAmount: number;
  onViewCart: () => void;
}

const CartFooter: React.FC<CartFooterProps> = ({
  itemCount,
  totalAmount,
  onViewCart
}) => {
  if (itemCount === 0) return null;

  return (
    <View style={styles.cartFooter}>
      <View style={styles.cartInfo}>
        <Text style={styles.cartItemCount}>
          {itemCount} item{itemCount > 1 ? 's' : ''} | ₹{totalAmount}
        </Text>
      </View>
      
      <TouchableOpacity style={styles.viewCartButton} onPress={onViewCart}>
        <Text style={styles.viewCartText}>VIEW CART</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cartInfo: {
    flex: 1,
  },
  cartItemCount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  viewCartButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  viewCartText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CartFooter;
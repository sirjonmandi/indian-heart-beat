// ===============================================
// PLACE ORDER BUTTON COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';

interface PlaceOrderButtonProps {
  totalAmount: number;
  onPlaceOrder: () => void;
  disabled?: boolean;
  buttonText?: string;
}

const PlaceOrderButton: React.FC<PlaceOrderButtonProps> = ({
  totalAmount,
  onPlaceOrder,
  disabled = false,
  buttonText = "Place Order"
}) => {
  return (
    // <View style={styles.container}>
    //   <TouchableOpacity 
    //     style={[styles.placeOrderButton, disabled && styles.disabledButton]}
    //     onPress={onPlaceOrder}
    //     disabled={disabled}
    //   >
    //     <Text style={styles.placeOrderText}>{buttonText}</Text>
    //   </TouchableOpacity>
    // </View>
    <View style={styles.cartBar}>
      <View style={{flexDirection:'row',alignItems:'center', justifyContent:'space-between', backgroundColor:Colors.primaryBg, borderRadius:50, paddingHorizontal:4, paddingVertical:4, width:'100%'}}>
          <View style={styles.priceBox}>
              <Text style={styles.priceText}>₹ {totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity 
          style={styles.cartBtn} activeOpacity={0.85} onPress={() => console.log('Add to Cart')}>
              <Text style={styles.cartBtnText}>{buttonText}</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    padding: 16,
    // borderTopWidth: 1,
    // borderTopColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  placeOrderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cartBar: {
    // position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    // borderTopWidth: 1,
    // borderTopColor: '#F0F0F0',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: -4 },
    // shadowOpacity: 0.06,
    // shadowRadius: 12,
    // elevation: 10,
  },
  priceBox: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,

  },
  priceText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
  cartBtn: {
    // flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius:50,
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
  },
  cartBtnText: {
    color: '#1A1A1A',
    fontWeight: '500',
    fontSize: 16,
    letterSpacing: 0.3,
  },
});

export default PlaceOrderButton;
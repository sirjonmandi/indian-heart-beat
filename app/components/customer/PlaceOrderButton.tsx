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
  buttonText = "PLACE ORDER"
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.placeOrderButton, disabled && styles.disabledButton]}
        onPress={onPlaceOrder}
        disabled={disabled}
      >
        <Text style={styles.placeOrderText}>{buttonText}</Text>
      </TouchableOpacity>
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
});

export default PlaceOrderButton;
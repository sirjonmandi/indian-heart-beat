// ===============================================
// COUPON SECTION COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';

interface CouponSectionProps {
  appliedCoupon?: string;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
}

const CouponSection: React.FC<CouponSectionProps> = ({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon
}) => {
  const [couponCode, setCouponCode] = useState('');

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }
    onApplyCoupon(couponCode.trim().toUpperCase());
    setCouponCode('');
  };

  if (appliedCoupon) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Have a Coupon ?</Text>
        <View style={styles.appliedCouponContainer}>
          <Text style={styles.appliedCouponText}>Applied: {appliedCoupon}</Text>
          <TouchableOpacity onPress={onRemoveCoupon}>
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Have a Coupon ?</Text>
      
      <View style={styles.couponInputContainer}>
        <TextInput
          style={styles.couponInput}
          placeholder="Enter Coupon Code"
          placeholderTextColor="#999"
          value={couponCode}
          onChangeText={(text)=>{
             setCouponCode(text.toUpperCase());
          }}
          autoCapitalize="characters"
          maxLength={15}
        />
        <TouchableOpacity 
          style={[styles.claimButton, !couponCode.trim() && styles.claimButtonDisabled]}
          onPress={handleApplyCoupon}
          disabled={!couponCode.trim()}
        >
          <Text style={styles.claimButtonText}>CLAIM</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 12,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textColor,
    marginRight: 12,
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
  },
  claimButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  claimButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  appliedCouponContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  appliedCouponText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  removeText: {
    fontSize: 12,
    color: '#FF4444',
    fontWeight: '600',
  },
});

export default CouponSection;
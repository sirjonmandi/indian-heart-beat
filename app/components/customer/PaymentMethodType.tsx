// ===============================================
// PAYMENT METHODS COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

export type PaymentMethodType = 'cod' | 'upi' | 'card' | 'netbanking' | 'wallet';

interface PaymentMethod {
  id: PaymentMethodType;
  title: string;
  subtitle?: string;
  icon: string;
  iconColor: string;
  recommended?: boolean;
}

interface PaymentMethodsProps {
  selectedMethod?: PaymentMethodType;
  onMethodSelect: (method: PaymentMethodType) => void;
}

const PaymentMethods: React.FC<PaymentMethodsProps> = ({
  selectedMethod,
  onMethodSelect
}) => {
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'cod',
      title: 'Cash on Delivery',
      subtitle: 'Pay when you receive',
      icon: 'money',
      iconColor: '#4CAF50',
      recommended: true
    },
    {
      id: 'upi',
      title: 'UPI',
      subtitle: 'GPay, PhonePe, Paytm & more',
      icon: 'account-balance',
      iconColor: '#2196F3'
    },
    {
      id: 'card',
      title: 'Credit/Debit Card',
      subtitle: 'Visa, Mastercard, RuPay',
      icon: 'credit-card',
      iconColor: '#FF9800'
    },
    {
      id: 'netbanking',
      title: 'Net Banking',
      subtitle: 'All major banks',
      icon: 'account-balance',
      iconColor: '#9C27B0'
    },
    {
      id: 'wallet',
      title: 'Wallets',
      subtitle: 'Paytm, Mobikwik & more',
      icon: 'account-balance-wallet',
      iconColor: '#E91E63'
    }
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Choose Payment Method</Text>
      
      {paymentMethods.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.paymentMethod,
            selectedMethod === method.id && styles.selectedMethod
          ]}
          onPress={() => onMethodSelect(method.id)}
        >
          <View style={styles.methodLeft}>
            <View style={[styles.iconContainer, { backgroundColor: method.iconColor + '20' }]}>
              <Icon name={method.icon} size={24} color={method.iconColor} />
            </View>
            
            <View style={styles.methodInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                {method.recommended && (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedText}>RECOMMENDED</Text>
                  </View>
                )}
              </View>
              {method.subtitle && (
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              )}
            </View>
          </View>
          
          <View style={[
            styles.radioButton,
            selectedMethod === method.id && styles.radioButtonSelected
          ]}>
            {selectedMethod === method.id && (
              <View style={styles.radioButtonInner} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedMethod: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  recommendedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  methodSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
});

export default PaymentMethods;
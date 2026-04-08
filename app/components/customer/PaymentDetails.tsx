// ===============================================
// PAYMENT DETAILS COMPONENT
// ===============================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { PaymentMethodType } from './PaymentMethods';

interface PaymentDetailsProps {
  selectedMethod: PaymentMethodType;
  onPaymentDataChange: (data: any) => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({
  selectedMethod,
  onPaymentDataChange
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [upiId, setUpiId] = useState('');

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    setCardNumber(formatted);
    onPaymentDataChange({ cardNumber: cleaned, expiryDate, cvv, cardHolderName });
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 2) {
      formatted = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    setExpiryDate(formatted);
    onPaymentDataChange({ cardNumber: cardNumber.replace(/\s/g, ''), expiryDate: formatted, cvv, cardHolderName });
  };

  const handleUpiIdChange = (text: string) => {
    setUpiId(text);
    onPaymentDataChange({ upiId: text });
  };

  const renderCardDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Card Details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Card Number</Text>
        <TextInput
          style={styles.textInput}
          placeholder="1234 5678 9012 3456"
          value={cardNumber}
          onChangeText={formatCardNumber}
          keyboardType="numeric"
          maxLength={19}
        />
      </View>
      
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.inputLabel}>Expiry Date</Text>
          <TextInput
            style={styles.textInput}
            placeholder="MM/YY"
            value={expiryDate}
            onChangeText={formatExpiryDate}
            keyboardType="numeric"
            maxLength={5}
          />
        </View>
        
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput
            style={styles.textInput}
            placeholder="123"
            value={cvv}
            onChangeText={(text) => {
              setCvv(text);
              onPaymentDataChange({ cardNumber: cardNumber.replace(/\s/g, ''), expiryDate, cvv: text, cardHolderName });
            }}
            keyboardType="numeric"
            maxLength={3}
            secureTextEntry
          />
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Cardholder Name</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter cardholder name"
          value={cardHolderName}
          onChangeText={(text) => {
            setCardHolderName(text);
            onPaymentDataChange({ cardNumber: cardNumber.replace(/\s/g, ''), expiryDate, cvv, cardHolderName: text });
          }}
          autoCapitalize="words"
        />
      </View>
    </View>
  );

  const renderUpiDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>UPI Details</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>UPI ID</Text>
        <TextInput
          style={styles.textInput}
          placeholder="yourname@paytm"
          value={upiId}
          onChangeText={handleUpiIdChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
      
      <Text style={styles.upiNote}>
        Enter your UPI ID to proceed with payment
      </Text>
    </View>
  );

  const renderCodDetails = () => (
    <View style={styles.detailsContainer}>
      <View style={styles.codContainer}>
        <Icon name="money" size={48} color="#4CAF50" />
        <Text style={styles.codTitle}>Cash on Delivery</Text>
        <Text style={styles.codSubtitle}>
          Pay with cash when your order is delivered
        </Text>
        <View style={styles.codNote}>
          <Icon name="info" size={16} color="#FF9800" />
          <Text style={styles.codNoteText}>
            Please keep exact change ready
          </Text>
        </View>
      </View>
    </View>
  );

  const renderNetBankingDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Select Your Bank</Text>
      
      {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank'].map((bank) => (
        <TouchableOpacity key={bank} style={styles.bankOption}>
          <Text style={styles.bankName}>{bank}</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWalletDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.detailsTitle}>Select Wallet</Text>
      
      {['Paytm', 'PhonePe', 'Google Pay', 'Amazon Pay', 'Mobikwik'].map((wallet) => (
        <TouchableOpacity key={wallet} style={styles.walletOption}>
          <Text style={styles.walletName}>{wallet}</Text>
          <Icon name="chevron-right" size={20} color="#666" />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPaymentDetails = () => {
    switch (selectedMethod) {
      case 'card':
        return renderCardDetails();
      case 'upi':
        return renderUpiDetails();
      case 'cod':
        return renderCodDetails();
      case 'netbanking':
        return renderNetBankingDetails();
      case 'wallet':
        return renderWalletDetails();
      default:
        return null;
    }
  };

  if (!selectedMethod) return null;

  return (
    <View style={styles.container}>
      {renderPaymentDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsContainer: {
    padding: 16,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  rowContainer: {
    flexDirection: 'row',
  },
  upiNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  codContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  codTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  codSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  codNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
  },
  codNoteText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 8,
  },
  bankOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bankName: {
    fontSize: 14,
    color: '#333',
  },
  walletOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  walletName: {
    fontSize: 14,
    color: '#333',
  },
});

export default PaymentDetails;
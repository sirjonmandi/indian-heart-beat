import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../styles/colors';
import { Typography } from '../../../styles/typography';
import { Spacing } from '../../../styles/spacing';
import { GlobalStyles } from '../../../styles/globalStyles';
import { Constants } from '../../../utils/constants';
import { RootState } from '../../../store';
import { clearCart } from '../../../store/slices/cartSlice';
import Header from '../../../components/common/Header';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import { useAlert } from '@/components/context/AlertContext';

interface Address {
  id: string;
  title: string;
  address: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet' | 'cod';
  title: string;
  subtitle?: string;
  icon: string;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { items, totalAmount, discountAmount} = useSelector((state: RootState) => state.cart);
  
  const [selectedAddress, setSelectedAddress] = useState<string>('1');
  const [selectedPayment, setSelectedPayment] = useState<string>('upi');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { showAlert } = useAlert();

  // Demo data
  const addresses: Address[] = [
    {
      id: '1',
      title: 'Home',
      address: '123 Main Street, Connaught Place, New Delhi - 110001',
      isDefault: true,
    },
    {
      id: '2',
      title: 'Office',
      address: '456 Business Park, Gurgaon, Haryana - 122001',
      isDefault: false,
    },
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'upi',
      type: 'upi',
      title: 'UPI',
      subtitle: 'Google Pay, PhonePe, Paytm',
      icon: 'payment',
    },
    {
      id: 'card',
      type: 'card',
      title: 'Credit/Debit Card',
      subtitle: 'Visa, Mastercard, RuPay',
      icon: 'credit-card',
    },
    {
      id: 'netbanking',
      type: 'netbanking',
      title: 'Net Banking',
      subtitle: 'All major banks',
      icon: 'account-balance',
    },
    {
      id: 'cod',
      type: 'cod',
      title: 'Cash on Delivery',
      subtitle: 'Pay when you receive',
      icon: 'money',
    },
  ];

  // Calculate totals
  const subtotal = totalAmount;
  const deliveryFee = subtotal >= Constants.FREE_DELIVERY_ABOVE ? 0 : Constants.DELIVERY_CHARGE;
  const discount = discountAmount ? discountAmount : 0; // 10% discount, max ₹100
  const taxes = Math.round((subtotal - discount) * 0.05); // 5% tax
  const finalTotal = subtotal + deliveryFee - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME20') {
      setAppliedCoupon('WELCOME20');
      // Alert.alert('Coupon Applied!', '20% discount applied to your order');
      showAlert({
        title: 'Coupon Applied!',
        message: '20% discount applied to your order',
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }]
      })
    } else if (couponCode.toUpperCase() === 'SAVE50') {
      setAppliedCoupon('SAVE50');
      // Alert.alert('Coupon Applied!', '₹50 off applied to your order');
      showAlert({
        title: 'Coupon Applied!',
        message: '₹50 off applied to your order',
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }]
      })
    } else {
      // Alert.alert('Invalid Coupon', 'Please enter a valid coupon code');
      showAlert({
        title: 'Invalid Coupon',
        message: 'Please enter a valid coupon code',
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }]
      })
    }
    setCouponCode('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart
      dispatch(clearCart());
      
      // Navigate to success screen
      const orderData = {
        id: 'ORD' + Date.now(),
        orderNumber: '#BG' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        totalAmount: finalTotal,
        estimatedDelivery: '8-12 min',
        deliveryAddress: addresses.find(addr => addr.id === selectedAddress),
        paymentMethod: paymentMethods.find(pm => pm.id === selectedPayment),
        items: items.map(item => ({
          name: `Product ${item.productId}`,
          quantity: item.quantity,
          price: 180 * item.quantity, // Demo price
        })),
      };
      
      navigation.navigate('OrderSuccess', { orderData });
      
    } catch (error) {
      // Alert.alert('Order Failed', 'Please try again');
      showAlert({
        title: 'Order Failed',
        message: 'Please try again',
        buttons:[{
          text: 'OK',
          color: Colors.btnColorPrimary,
          textColor: Colors.btnTextPrimary,
        }]
      })
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      
      <View style={styles.summaryCard}>
        {items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>Demo Product {item.productId}</Text>
              <Text style={styles.itemDetails}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{180 * item.quantity}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDeliveryAddress = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TouchableOpacity onPress={() => setShowAddressModal(true)}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.addressCard}>
        <Icon name="location-on" size={24} color={Colors.primary} />
        <View style={styles.addressInfo}>
          <Text style={styles.addressTitle}>
            {addresses.find(addr => addr.id === selectedAddress)?.title}
          </Text>
          <Text style={styles.addressText}>
            {addresses.find(addr => addr.id === selectedAddress)?.address}
          </Text>
        </View>
      </TouchableOpacity>

      <Input
        placeholder="Delivery instructions (optional)"
        value={deliveryInstructions}
        onChangeText={setDeliveryInstructions}
        multiline
        style={styles.instructionsInput}
      />
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity onPress={() => setShowPaymentModal(true)}>
          <Text style={styles.changeText}>Change</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.paymentCard}>
        <Icon 
          name={paymentMethods.find(pm => pm.id === selectedPayment)?.icon || 'payment'} 
          size={24} 
          color={Colors.primary} 
        />
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>
            {paymentMethods.find(pm => pm.id === selectedPayment)?.title}
          </Text>
          <Text style={styles.paymentSubtitle}>
            {paymentMethods.find(pm => pm.id === selectedPayment)?.subtitle}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderCoupon = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Promo Code</Text>
      
      {appliedCoupon ? (
        <View style={styles.appliedCouponCard}>
          <Icon name="local-offer" size={20} color={Colors.success} />
          <Text style={styles.appliedCouponText}>
            {appliedCoupon} applied
          </Text>
          <TouchableOpacity onPress={handleRemoveCoupon}>
            <Icon name="close" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.couponInputContainer}>
          <Input
            placeholder="Enter promo code"
            value={couponCode}
            onChangeText={setCouponCode}
            style={styles.couponInput}
          />
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={handleApplyCoupon}
            disabled={!couponCode.trim()}
          >
            <Text style={[
              styles.applyButtonText,
              !couponCode.trim() && { color: Colors.gray400 }
            ]}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderBillDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bill Details</Text>
      
      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Subtotal</Text>
          <Text style={styles.billValue}>₹{subtotal}</Text>
        </View>
        
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Delivery Fee</Text>
          <Text style={[
            styles.billValue,
            deliveryFee === 0 && styles.freeText
          ]}>
            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
          </Text>
        </View>
        
        {discount > 0 && (
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Discount</Text>
            <Text style={[styles.billValue, styles.discountText]}>-₹{discount}</Text>
          </View>
        )}
        
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Taxes & Fees</Text>
          <Text style={styles.billValue}>₹{taxes}</Text>
        </View>
        
        <View style={[styles.billRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalValue}>₹{finalTotal}</Text>
        </View>
      </View>
    </View>
  );

  const renderAddressModal = () => (
    <Modal
      visible={showAddressModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowAddressModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowAddressModal(false)}>
            <Icon name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Select Address</Text>
          <TouchableOpacity>
            <Text style={styles.addNewText}>Add New</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressOption,
                selectedAddress === address.id && styles.selectedAddressOption
              ]}
              onPress={() => {
                setSelectedAddress(address.id);
                setShowAddressModal(false);
              }}
            >
              <Icon 
                name={selectedAddress === address.id ? 'radio-button-checked' : 'radio-button-unchecked'} 
                size={24} 
                color={selectedAddress === address.id ? Colors.primary : Colors.gray400} 
              />
              <View style={styles.addressContent}>
                <Text style={styles.addressOptionTitle}>{address.title}</Text>
                <Text style={styles.addressOptionText}>{address.address}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
            <Icon name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Payment Method</Text>
          <View style={{ width: 24 }} />
        </View>
        
        <ScrollView style={styles.modalContent}>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                selectedPayment === method.id && styles.selectedPaymentOption
              ]}
              onPress={() => {
                setSelectedPayment(method.id);
                setShowPaymentModal(false);
              }}
            >
              <Icon name={method.icon} size={24} color={Colors.primary} />
              <View style={styles.paymentContent}>
                <Text style={styles.paymentOptionTitle}>{method.title}</Text>
                {method.subtitle && (
                  <Text style={styles.paymentOptionSubtitle}>{method.subtitle}</Text>
                )}
              </View>
              <Icon 
                name={selectedPayment === method.id ? 'radio-button-checked' : 'radio-button-unchecked'} 
                size={24} 
                color={selectedPayment === method.id ? Colors.primary : Colors.gray400} 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
      <Header
        title="Checkout"
        showBack
        onBackPress={() => navigation.goBack()}
        backgroundColor={Colors.white}
        textColor={Colors.textPrimary}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {renderOrderSummary()}
        {renderDeliveryAddress()}
        {renderPaymentMethod()}
        {renderCoupon()}
        {renderBillDetails()}
        
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Sticky Bottom */}
      <View style={styles.stickyBottom}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>₹{finalTotal}</Text>
          <Text style={styles.totalSubtext}>Total Amount</Text>
        </View>
        
        <Button
          title={isProcessing ? "Processing..." : "Place Order"}
          onPress={handlePlaceOrder}
          loading={isProcessing}
          disabled={isProcessing}
          style={styles.placeOrderButton}
        />
      </View>

      {renderAddressModal()}
      {renderPaymentModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  section: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  changeText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Order Summary
  summaryCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  itemDetails: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  itemPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },

  // Address Card
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
    marginBottom: Spacing.md,
  },
  addressInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  addressTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  addressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.4,
  },
  instructionsInput: {
    marginBottom: 0,
  },

  // Payment Card
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.gray50,
  },
  paymentInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  paymentTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  paymentSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },

  // Coupon
  appliedCouponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: 8,
    backgroundColor: Colors.success + '20',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  appliedCouponText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.success,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  couponInput: {
    flex: 1,
    marginRight: Spacing.md,
    marginBottom: 0,
  },
  applyButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    marginBottom: Spacing.md,
  },
  applyButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
  },

  // Bill Details
  billCard: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  billLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  billValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
  },
  freeText: {
    color: Colors.success,
  },
  discountText: {
    color: Colors.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },

  // Sticky Bottom
  stickyBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flex: 1,
    marginRight: Spacing.lg,
  },
  totalText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  totalSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  placeOrderButton: {
    flex: 2,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
  },
  addNewText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  // Address Options
  addressOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedAddressOption: {
    backgroundColor: Colors.primaryBg,
  },
  addressContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  addressOptionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  addressOptionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.fontSize.sm * 1.4,
  },

  // Payment Options
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectedPaymentOption: {
    backgroundColor: Colors.primaryBg,
  },
  paymentContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  paymentOptionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  paymentOptionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },

  bottomSpacing: {
    height: 100, // Space for sticky bottom
  },
});

export default CheckoutScreen;
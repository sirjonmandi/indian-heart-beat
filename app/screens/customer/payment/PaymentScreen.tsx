// ===============================================
// PAYMENT SCREEN
// ===============================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation, useRoute, StackActions, CommonActions } from '@react-navigation/native';
import { Constants } from '../../../utils/constants';
import PaymentHeader from '../../../components/customer/PaymentHeader';
import PaymentMethods, { PaymentMethodType } from '../../../components/customer/PaymentMethodType';
import PaymentDetails from '../../../components/customer/PaymentDetails';
import PlaceOrderButton from '../../../components/customer/PlaceOrderButton';
import { 
  processPayment, 
  generateOrderId, 
  PaymentData,
  PaymentRequest 
} from '../../../utils/paymentFunctions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useAlert } from '@/components/context/AlertContext';
import { Colors } from '@/styles/colors';
// import RazorpayCheckout from 'react-native-razorpay';

interface RouteParams {
  totalAmount: number;
  cartItems: any[];
}

const PaymentScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // const { totalAmount = 12148, cartItems = [] } = (route.params as RouteParams) || {};
  const { totalAmount, orderType, scheduled } = useSelector((state: RootState) => {
    return state.cart;
  });
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('cod');
  const [paymentData, setPaymentData] = useState<PaymentData>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const { showAlert } = useAlert();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setPaymentData({}); // Reset payment data when method changes
  };

  const handlePaymentDataChange = (data: PaymentData) => {
    setPaymentData(data);
  };

  const validatePaymentData = (): boolean => {
    switch (selectedMethod) {
      case 'cod':
        return true; // COD doesn't need validation
      case 'upi':
        if (!paymentData.upiId?.trim()) {
          Alert.alert('Error', 'Please enter a valid UPI ID');
          return false;
        }
        return true;
      case 'card':
        if (!paymentData.cardNumber || !paymentData.expiryDate || 
            !paymentData.cvv || !paymentData.cardHolderName) {
          Alert.alert('Error', 'Please fill all card details');
          return false;
        }
        return true;
      case 'netbanking':
      case 'wallet':
        return true; // These will be handled in the payment flow
      default:
        return false;
    }
  };

  const handlePlaceOrder = async () => {
    // if (!validatePaymentData()) {
    //   return;
    // }

    setIsProcessing(true);

    try {
      const orderId = generateOrderId();
      
      const paymentRequest: PaymentRequest = {
        method: selectedMethod,
        amount: totalAmount,
        orderType: orderType,
        ...(scheduled?.scheduledAt && { scheduledAt: scheduled.scheduledAt }),
        orderId,
        paymentData
      };

      const response = await processPayment(paymentRequest);
      // console.log('================== order response ==================');
      // console.log(JSON.stringify(response,null,2));
      // console.log('====================================');
      if (response.success) {
      // Success - navigate to order confirmation
      //   Alert.alert(
      //     'Payment Successful!',
      //     response.message,
      //     [
      //       {
      //         text: 'View Order',
      //         onPress:() => {
      //           navigation.dispatch(StackActions.pop(4));
      //           navigation.navigate(Constants.SCREENS.ORDER_DETAILS, { orderId: response.transactionId });
      //         }
      //       }
      //     ]
      //   );
      
        navigation.dispatch(StackActions.pop(4));
        showAlert({
          title: 'Payment Successful!',
          message: response.message,
          buttons:[
            {
              text: 'View Order',
              color: Colors.btnColorPrimary,
              textColor: Colors.btnTextPrimary,
              onPress:() => {
                navigation.navigate(Constants.SCREENS.ORDER_DETAILS, { orderId: response.transactionId });
              }
            }
          ],
        })
      } else {
        // Payment failed
        // Alert.alert(
        //   'Payment Failed',
        //   response.message,
        //   [
        //     { text: 'Try Again', style: 'default' },
        //     { 
        //       text: 'Change Method', 
        //       onPress: () => setSelectedMethod('cod') 
        //     }
        //   ]
        // );

        showAlert({
          title: 'Payment Failed',
          message: response.message,
          buttons:[
            {
              text: 'Try Again',
              color: Colors.btnColorSecondary,
              textColor: Colors.btnTextPrimary,
            },
            {
              text: 'Change Method',
              color: Colors.btnColorPrimary,
              textColor: Colors.btnTextPrimary,
              onPress: () => setSelectedMethod('cod')
            }
          ]
        })
      }
    } catch (error) {
      // Alert.alert(
      //   'Payment Error',
      //   'Something went wrong. Please try again.',
      //   [{ text: 'OK' }]
      // );
      showAlert({
        title: 'Payment Error',
        message: 'Something went wrong. Please try again.',
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

  const getButtonText = (): string => {
    if (isProcessing) return 'PROCESSING...';
    
    switch (selectedMethod) {
      case 'cod':
        return 'PLACE ORDER';
      case 'upi':
        return 'PAY WITH UPI';
      case 'card':
        return 'PAY WITH CARD';
      case 'netbanking':
        return 'PAY WITH NET BANKING';
      case 'wallet':
        return 'PAY WITH WALLET';
      default:
        return 'PLACE ORDER';
    }
  };

  return (
    <View style={styles.container}>
      <PaymentHeader
        onBackPress={handleBackPress}
        totalAmount={totalAmount}
      />
      
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <PaymentMethods
          selectedMethod={selectedMethod}
          onMethodSelect={handleMethodSelect}
        />
        
        {/* <PaymentDetails
          selectedMethod={selectedMethod}
          onPaymentDataChange={handlePaymentDataChange}
        /> */}
        
        {/* Order Summary */}
        <View style={styles.orderSummary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount</Text>
            <Text style={styles.summaryValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Payment Method</Text>
            <Text style={styles.summaryValue}>
              {selectedMethod === 'cod' ? 'Cash on Delivery' :
               selectedMethod === 'upi' ? 'UPI' :
               selectedMethod === 'card' ? 'Card' :
               selectedMethod === 'netbanking' ? 'Net Banking' : 'Wallet'}
            </Text>
          </View>
        </View>
        
        {/* Processing Overlay */}
        {isProcessing && (
          <View style={styles.processingOverlay}>
            <View style={styles.processingContainer}>
              <ActivityIndicator size="large" color="#4CAF50" />
              <Text style={styles.processingText}>Processing Payment...</Text>
              <Text style={styles.processingSubtext}>Please wait</Text>
            </View>
          </View>
        )}
        
        {/* Space for bottom button */}
        <View style={styles.bottomSpace} />
      </ScrollView>
      
      {/* Place Order Button */}
      <View style={styles.buttonContainer}>
        <PlaceOrderButton
          totalAmount={totalAmount}
          onPlaceOrder={handlePlaceOrder}
          disabled={isProcessing}
          buttonText={getButtonText()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  orderSummary: {
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingContainer: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  buttonContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomSpace: {
    height: 20,
  },
});

export default PaymentScreen;
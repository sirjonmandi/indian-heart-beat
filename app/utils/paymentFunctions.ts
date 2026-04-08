// ===============================================
// PAYMENT FUNCTIONS
// ===============================================

import { Alert } from 'react-native';
import { PaymentMethodType } from '../components/customer';
import { customerAPI } from '@/services/api/customerAPI';
import RazorpayCheckout from 'react-native-razorpay';
export interface PaymentData {
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolderName?: string;
  upiId?: string;
  bankName?: string;
  walletType?: string;
}

export interface PaymentRequest {
  method: PaymentMethodType;
  amount: number;
  orderId: string;
  paymentData?: PaymentData;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  message: string;
  errorCode?: string;
}

export interface RazorpayConfig {
  key: string;
  currency: string;
  name: string;
  description: string;
  theme: {
    color: string;
  };
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  order_id: string;
}

  // Process Razorpay payment
  export const processRazorpayPayment = (
    razorpayOrder: any,
    razorpayConfig: RazorpayConfig
  ): Promise<any> => {
    return new Promise((resolve, reject) => {
      const options = {
        key: razorpayConfig.key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: razorpayConfig.name,
        description: razorpayConfig.description,
        order_id: razorpayOrder.id,
        theme: {
          color: razorpayConfig.theme.color,
        },
      };

      RazorpayCheckout.open(options)
        .then((data) => {
          resolve({
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_order_id: data.razorpay_order_id,
            razorpay_signature: data.razorpay_signature,
          });
        })
        .catch((error) => {
          // console.error('Razorpay payment error:', error);
          reject(error);
        });
    });
  };

  // Verify payment on backend
  export const verifyPayment = async (verificationData: VerifyPaymentRequest): Promise<PaymentResponse> => {
    try {
      const response = await customerAPI.verifyPayment(verificationData);
      return {
        success: true,
        message: response.data.message,
        transactionId: response.data.data.order_id,
        orderId: response.data.data.order_id,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Payment verification failed',
      };
    }
  };

  // Handle payment failure
  export const handlePaymentFailure = async (orderId: string, error: any): Promise<void> => {
    try {
      await customerAPI.failedPayment({
         order_id: orderId,
         error_code: error.code || 'PAYMENT_CANCELLED',
         error_description: error.description || 'Payment was cancelled by user'
      });
    } catch (apiError) {
      console.error('Failed to report payment failure:', apiError);
    }
  };

// Simulate payment processing with different methods
export const processPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  // Simulate network delay
  // await new Promise(resolve => setTimeout(resolve, 2000));
  try {
    if (request.method === 'cod') {
      return processCODPayment(request);
    }else{

      const response = await customerAPI.createOrder({
        order_type: request.orderType,
        scheduled_at:request.scheduledAt,
        payment_method: request.method,
        payment_data: { upi_id: 'demo@upi' },
      })

      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      console.log('=============== Order created successfully =====================');
      console.log(JSON.stringify(response, null, 2));
      console.log('====================================');
      
      
      const orderId = response.data.data.order_id;

      if (!response.data.data.razorpay_order || !response.data.data.razorpay_config) {
        throw new Error('Payment gateway configuration missing');
      }

      try {
        // Step 3: Process payment with Razorpay
        const paymentData = await processRazorpayPayment(
          response.data.data.razorpay_order,
          response.data.data.razorpay_config
        );

        // Step 4: Verify payment on backend
        const verificationResult = await verifyPayment({
          razorpay_payment_id: paymentData.razorpay_payment_id,
          razorpay_order_id: paymentData.razorpay_order_id,
          razorpay_signature: paymentData.razorpay_signature,
          order_id: orderId,
        });

        return verificationResult;

      } catch (razorpayError: any) {
        // Handle Razorpay payment failure
        // await handlePaymentFailure(orderId, razorpayError);
        
        // return {
        //   success: false,
        //   message: razorpayError.description || 'Payment was cancelled or failed',
        // };
        // console.log('=============== Razorpay payment error =====================');
        // console.log(JSON.stringify(razorpayError,null,2));
        // console.log('====================================');
        await handlePaymentFailure(orderId, razorpayError);
        return {
          success: false,
          message:'Payment failed try again !',
        };
      }
  
    }
  } catch (error) {
    console.log('================ Error ====================');
    console.log(JSON.stringify(error,null,2));
    console.log('====================================');
    return {
        success: false,
        message: error.response.data.message,
        errorCode: 'PAYMENT_ERROR'
    };
  }
  // try {
  //   switch (request.method) {
  //     case 'cod':
  //       return processCODPayment(request);
  //     case 'upi':
  //       return processUPIPayment(request);
  //     case 'card':
  //       return processCardPayment(request);
  //     case 'netbanking':
  //       return processNetBankingPayment(request);
  //     case 'wallet':
  //       return processWalletPayment(request);
  //     default:
  //       throw new Error('Unsupported payment method');
  //   }
  // } catch (error) {
  //   return {
  //     success: false,
  //     message: error instanceof Error ? error.message : 'Payment failed',
  //     errorCode: 'PAYMENT_ERROR'
  //   };
  // }
};

const processCODPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const response =  await customerAPI.createOrder({
      order_type: 'instant',
      payment_method: 'cash_on_delivery'
    })
    console.log('====================================');
    console.log(JSON.stringify(response,null,2));
    console.log('====================================');
    const {success, message, data } = response?.data;

    if (!success) {
      let message =  response?.response.data.message;
      return {
        success: false,
        message: message,
        errorCode: 'PAYMENT_ERROR'
      };
    }
    return {
        success: true,
        transactionId: data.order_id,
        message: message
    };
    
  } catch (error) {
    // console.error('Error processing COD payment:', JSON.stringify(error.response.data,null,2) );
    return {
        success: false,
        message: error.response.data.message,
        errorCode: 'PAYMENT_ERROR'
    };
  }
};

const processUPIPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  const { upiId } = request.paymentData || {};
  
  if (!upiId || !isValidUPIId(upiId)) {
    throw new Error('Invalid UPI ID');
  }
  const response = await customerAPI.createOrder({
    order_type: 'instant',
    payment_method: 'upi',
    payment_data: { upi_id: upiId }
  })

  
  if (!response.data.success) {
    throw new Error(response.data.message);
  }
  
  console.log('=============== Order created successfully =====================');
  console.log(JSON.stringify(response, null, 2));
  console.log('====================================');
  
  
  const orderId = response.data.data.order_id;

  if (!response.data.data.razorpay_order || !response.data.data.razorpay_config) {
    throw new Error('Payment gateway configuration missing');
  }

  try {
    // Step 3: Process payment with Razorpay
    const paymentData = await processRazorpayPayment(
      response.data.data.razorpay_order,
      response.data.data.razorpay_config
    );

    // Step 4: Verify payment on backend
    const verificationResult = await verifyPayment({
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_signature: paymentData.razorpay_signature,
      order_id: orderId,
    });

    return verificationResult;

  } catch (razorpayError: any) {
    // Handle Razorpay payment failure
    console.log('====================================');
    console.log(JSON.stringify(razorpayError,null,2));
    console.log('====================================');
    const response = await handlePaymentFailure(orderId, razorpayError);
    const { success, message } = response.data;
    if (!success) {
      return {
        success: false,
        message: response.response.data.message || 'Payment verification failed after Razorpay error',
      }
    }
    return {
      success: false,
      message: message || 'Payment was cancelled or failed',
    };
  }

  // Simulate UPI payment success/failure (90% success rate)
  // const isSuccess = Math.random() > 0.1;
  
  // if (isSuccess) {
  //   return {
  //     success: true,
  //     transactionId: `UPI_${Date.now()}`,
  //     message: 'UPI payment successful!'
  //   };
  // } else {
  //   throw new Error('UPI payment failed. Please try again.');
  // }
};

const processCardPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  const { cardNumber, expiryDate, cvv, cardHolderName } = request.paymentData || {};
  
  // Validate card details
  if (!cardNumber || !expiryDate || !cvv || !cardHolderName) {
    throw new Error('Please fill all card details');
  }
  
  if (!isValidCardNumber(cardNumber)) {
    throw new Error('Invalid card number');
  }
  
  if (!isValidExpiryDate(expiryDate)) {
    throw new Error('Invalid expiry date');
  }
  
  if (!isValidCVV(cvv)) {
    throw new Error('Invalid CVV');
  }
  
  // Simulate card payment success/failure (85% success rate)
  const isSuccess = Math.random() > 0.15;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `CARD_${Date.now()}`,
      message: 'Card payment successful!'
    };
  } else {
    throw new Error('Card payment failed. Please check your details and try again.');
  }
};

const processNetBankingPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  // Simulate net banking success/failure (80% success rate)
  const isSuccess = Math.random() > 0.2;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `NB_${Date.now()}`,
      message: 'Net Banking payment successful!'
    };
  } else {
    throw new Error('Net Banking payment failed. Please try again.');
  }
};

const processWalletPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  // Simulate wallet payment success/failure (95% success rate)
  const isSuccess = Math.random() > 0.05;
  
  if (isSuccess) {
    return {
      success: true,
      transactionId: `WALLET_${Date.now()}`,
      message: 'Wallet payment successful!'
    };
  } else {
    throw new Error('Wallet payment failed. Please try again.');
  }
};

// Validation functions
const isValidUPIId = (upiId: string): boolean => {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upiId);
};

const isValidCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and check if it's 13-19 digits
  const cleaned = cardNumber.replace(/\s/g, '');
  const cardRegex = /^\d{13,19}$/;
  return cardRegex.test(cleaned) && luhnCheck(cleaned);
};

const isValidExpiryDate = (expiryDate: string): boolean => {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(expiryDate)) return false;
  
  const [month, year] = expiryDate.split('/');
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;
  
  const expYear = parseInt(year);
  const expMonth = parseInt(month);
  
  if (expYear < currentYear) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;
  
  return true;
};

const isValidCVV = (cvv: string): boolean => {
  const cvvRegex = /^\d{3,4}$/;
  return cvvRegex.test(cvv);
};

// Luhn algorithm for card number validation
const luhnCheck = (cardNumber: string): boolean => {
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i));
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
};

// Generate order ID
export const generateOrderId = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD_${timestamp}_${random}`;
};

// Payment status checking
export const checkPaymentStatus = async (transactionId: string): Promise<PaymentResponse> => {
  // Simulate API call to check payment status
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    transactionId,
    message: 'Payment completed successfully'
  };
};

// Retry payment function
export const retryPayment = async (request: PaymentRequest): Promise<PaymentResponse> => {
  Alert.alert(
    'Retry Payment',
    'Do you want to retry the payment?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Retry', onPress: () => processPayment(request) }
    ]
  );
  
  return { success: false, message: 'Payment retry cancelled' };
};

// Get payment method display name
export const getPaymentMethodName = (method: PaymentMethodType): string => {
  switch (method) {
    case 'cod':
      return 'Cash on Delivery';
    case 'upi':
      return 'UPI';
    case 'card':
      return 'Credit/Debit Card';
    case 'netbanking':
      return 'Net Banking';
    case 'wallet':
      return 'Wallet';
    default:
      return 'Unknown';
  }
};
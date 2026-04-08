import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { Colors } from '../../../styles/colors';
import { Typography } from '../../../styles/typography';
import { Spacing } from '../../../styles/spacing';
import { GlobalStyles } from '../../../styles/globalStyles';
// import Header from '../../../components/common/Header';
import LinearGradient from 'react-native-linear-gradient';
import { getSingleOrder } from '@store/slices/customerOrderSlice';

interface RootState {
  customerOrders: {
    orders: any[];
    currentOrder: any | null;
    loading: boolean;
    error: string | null;
  };
}

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { orderId } = route.params as { orderId: string };
  
  const { currentOrder, loading } = useSelector((state: RootState) => state.customerOrders);
  console.log('====================================');
  console.log(JSON.stringify(currentOrder,null,2));
  console.log('====================================');
  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [dispatch, orderId]);

  const fetchOrderDetails = async () => {
    try {
      await dispatch(getSingleOrder(orderId)).unwrap();
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    }
  };

  const orderData = currentOrder;

  const trackingSteps = [
    { status: 'pending', title: 'Order Placed', time: '18:00',  completed: orderData?.status === 'pending' ? true : false },
    { status: 'confirmed', title: 'Order Confirmed', time: '18:00', completed: orderData?.status === 'confirmed' ? true : false },
    { status: 'preparing', title: 'Preparing Your Order', time: '18:05', completed: orderData?.status === 'preparing' ? true : false },
    { status: 'ready_for_pickup', title: 'Ready for Pickup', time: '18:12', completed: orderData?.status === 'ready_for_pickup' ? true : false },
    { status: 'assigned_to_partner', title: 'Assigned to partner', time: '18:12', completed: orderData?.status === 'assigned_to_partner' ? true : false },
    { status: 'picked_up', title: 'Order picked up', time: '18:12', completed: orderData?.status === 'picked_up' ? true : false },
    { status: 'out_for_delivery', title: 'Out for Delivery', time: '18:15', completed: orderData?.status === 'out_for_delivery' ? true : false },
    { 
      status: 'delivered', 
      title: 'Delivered', 
      time: orderData?.actualDelivery || `ETA ${orderData?.estimatedDelivery || '18:25'}`, 
      completed: orderData?.status === 'delivered' ? true : false
    },
  ];
  const completedIndex = trackingSteps.findIndex(step => step.completed === true);
  const OrdersDetails = ()=>{
    return(
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Order Info Card */}
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>Order #{orderData.orderNumber}</Text>
          {/* <Text style={styles.estimatedTime}>
            {orderData.status === 'delivered' 
              ? `Delivered at ${orderData.actualDelivery}`
              : `Estimated delivery: ${orderData.estimatedDelivery}`
            }
          </Text> */}
        </View>

        {/* Order Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Status</Text>
          <View style={styles.trackingContainer}>
            { orderData.status === "returned" || orderData.status === "cancelled" 
            ?
            <View style={styles.trackingStep}>
              <View style={styles.stepIndicator}>
                  <View style={[styles.stepDot,styles.stepDotCompleted]}>
                      <Icon name="check" size={16} color={Colors.white} />
                  </View>
              </View>
              <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle,styles.stepTitleCompleted
                  ]}>
                    {orderData.status === "returned" ? "Order Returned" : "Order Cancelled"}
                  </Text>
              </View>
            </View>
            :
            trackingSteps.map((step, index) => (
              <View key={step.status} style={styles.trackingStep}>
                <View style={styles.stepIndicator}>
                  <View style={[
                    styles.stepDot,
                    (step.completed || index < completedIndex) && styles.stepDotCompleted
                  ]}>
                    {(step.completed || index < completedIndex) && (
                      <Icon name="check" size={16} color={Colors.white} />
                    )}
                  </View>
                  {index < trackingSteps.length - 1 && (
                    <View style={[
                      styles.stepLine,
                      (step.completed || index < completedIndex) && styles.stepLineCompleted
                    ]} />
                  )}
                </View>
                
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepTitle,
                    (step.completed || index < completedIndex) && styles.stepTitleCompleted
                  ]}>
                    {step.title}
                  </Text>
                  {/* <Text style={styles.stepTime}>{step.time}</Text> */}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Ordered Products */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ordered Items</Text>
          <View style={styles.productsContainer}>
            {orderData.products?.map((product: any, index: number) => (
              <View key={product.id || index} style={styles.productItem}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>
                    {product.product_name || product.name}
                  </Text>
                  <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
                </View>
                <Text style={styles.productPrice}>₹{product.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressContainer}>
            <Icon name="location-on" size={20} color={Colors.primary} />
            <View style={styles.addressContent}>
              <Text style={styles.addressText}>
                {orderData.deliveryAddress || 'Address not available'}
                {/* {orderData.customer.address ? orderData.customer.address.contact_name + ', ' + orderData.customer.address.address_line_1 + ', ' + orderData.customer.address.pincode + ' phone: ' + orderData.customer.address.contact_phone : 'Address not provided'} */}
              </Text>
              {orderData.phone && (
                <Text style={styles.phoneText}>
                  <Icon name="phone" size={14} color={Colors.textSecondary} /> {orderData.phone}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Items</Text>
              <Text style={styles.summaryValue}>{orderData.products?.length || 0}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Order Date</Text>
              <Text style={styles.summaryValue}>
                {orderData.date ? orderData.date : 'N/A'}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Time</Text>
              <Text style={styles.summaryValue}>
                {orderData.actualDelivery || 'TBD'}
              </Text>
            </View>
            
            {/* Price Breakdown */}
            <View style={styles.priceBreakdown}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{orderData.subtotal || 0}</Text>
              </View>
              {orderData.packagingFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Packaging Fee</Text>
                  <Text style={styles.summaryValue}>₹{orderData.packagingFee}</Text>
                </View>
              )}
              {orderData.handlingFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Handling Fee</Text>
                  <Text style={styles.summaryValue}>₹{orderData.handlingFee}</Text>
                </View>
              )}
              {orderData.deliveryFee > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={styles.summaryValue}>₹{orderData.deliveryFee}</Text>
                </View>
              )}

              {orderData.taxAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tax</Text>
                  <Text style={styles.summaryValue}>₹{orderData.taxAmount}</Text>
                </View>
              )}

              {orderData.coupon && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Coupon ({orderData.coupon.couponName})</Text>
                  <Text style={styles.summaryValue}>-₹{orderData.coupon.disccountAmount}</Text>
                </View>
              )}

              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount</Text>
                <Text style={styles.totalValue}>₹{orderData.total || 0}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }
  return (
    <SafeAreaView style={GlobalStyles.container}>
      {/* <Header 
        title="Track Order"
        showBack
        onBackPress={() => navigation.goBack()}
      /> */}
      <LinearGradient
              colors={[Colors.background, Colors.background]}
              style={styles.header}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Icon name="arrow-back" size={24} color={Colors.textColor} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Track Order</Text>
              <View style={{ width: 24 }} />
      </LinearGradient>

      {orderData && (
        <OrdersDetails/>
      )}
      
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
    headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textColor,
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  orderInfo: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textWhite,
    marginBottom: Spacing.sm,
  },
  estimatedTime: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  section: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textWhite,
    padding: Spacing.lg,
    paddingBottom: 0,
    marginBottom: Spacing.md,
  },
  trackingContainer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  trackingStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: Colors.primary,
  },
  stepLine: {
    width: 2,
    height: 40,
    backgroundColor: Colors.gray300,
    marginTop: Spacing.xs,
  },
  stepLineCompleted: {
    backgroundColor: Colors.primary,
  },
  stepContent: {
    flex: 1,
    paddingBottom: Spacing.lg,
  },
  stepTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  stepTitleCompleted: {
    color: Colors.textWhite,
  },
  stepTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  productsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textWhite,
    marginBottom: Spacing.xs,
  },
  productQuantity: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textColor,
  },
  productPrice: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textWhite,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.lg,
    // backgroundColor: Colors.gray50,
    margin: Spacing.lg,
    marginTop: 0,
    borderRadius: 8,
    borderWidth:1,
    borderColor:Colors.primary,
  },
  addressContent: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  addressText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textWhite,
    lineHeight: 22,
    marginBottom: Spacing.xs,
  },
  phoneText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryContainer: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textColor,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    color: Colors.textWhite,
    fontWeight: Typography.fontWeight.semibold,
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    // backgroundColor: Colors.gray50,
    marginHorizontal: -Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textWhite,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
  },
});

export default OrderTrackingScreen;
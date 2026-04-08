import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TODO: Uncomment when these actions are available
import {
  fetchOrderDetails,
  acceptOrder,
  rejectOrder,
} from '@store/slices/deliverySlice';

// DUMMY DATA for testing
const dummyOrderDetails = {
  id: '1',
  orderNumber: 'BG001',
  totalAmount: 1250,
  deliveryFee: 50,
  distance: 2.5,
  estimatedTime: 15,
  shop: {
    name: 'Wine Shop Central',
    address: 'Shop 45, Park Street, Near Metro Station, Kolkata - 700016',
    phone: '+91 9876543210',
  },
  customer: {
    name: 'John Doe',
    address: 'Flat 3B, Tower 2, Salt Lake City Center, Sector V, Kolkata - 700091',
    phone: '+91 9876543211',
  },
  items: [
    {
      productName: 'Premium Whiskey 750ml',
      quantity: 1,
      unitPrice: 800,
    },
    {
      productName: 'Beer Pack (6 bottles)',
      quantity: 2,
      unitPrice: 225,
    },
  ],
  paymentMethod: 'Cash on Delivery',
  orderTime: '2024-06-14T14:30:00Z',
  specialInstructions: 'Ring doorbell twice. Apartment has security.',
};

interface RootState {
  delivery: {
    orderDetails?: typeof dummyOrderDetails;
    loading: boolean;
    currentOrder:any;
  };
}

const DeliveryOrderDetailsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params || { orderId: '1' }; // Fallback for testing

  // Safely get delivery state with fallbacks
  const {currentOrder:orderDetails,loading} = useSelector((state: RootState) => state.delivery);
  // const { 
  //   orderDetails = dummyOrderDetails, 
  //   loading = false 
  // } = deliveryState || {};

  useEffect(() => {
    loadOrderDetails();
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchOrderDetails(orderId)).unwrap();
      // console.log('📋 Loading order details : ', orderId);
    } catch (error) {
      console.error('Failed to load order details:', error);
    }
  };

  const handleAcceptOrder = async () => {
    Alert.alert(
      'Accept Order',
      `Accept order #${orderDetails.orderNumber}?\n\nYou'll earn ₹${orderDetails.deliveryFee} for this delivery.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              // TODO: Uncomment when action is ready
              // await dispatch(acceptOrder(orderId)).unwrap();
              Alert.alert('Success', 'Order accepted successfully! (DUMMY MODE)');
              console.log('✅ Order accepted (DUMMY MODE):', orderId);
              // navigation.navigate('DeliveryTracking', { orderId });
            } catch (error) {
              Alert.alert('Error', 'Failed to accept order');
            }
          },
        },
      ]
    );
  };

  const handleRejectOrder = async () => {
    Alert.alert(
      'Reject Order',
      `Reject order #${orderDetails.orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Uncomment when action is ready
              // await dispatch(rejectOrder(orderId)).unwrap();
              Alert.alert('Order Rejected', 'You have rejected this delivery (DUMMY MODE)');
              console.log('❌ Order rejected (DUMMY MODE):', orderId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order');
            }
          },
        },
      ]
    );
  };

  const callShop = () => {
    if (orderDetails?.shop?.phone) {
      Linking.openURL(`tel:${orderDetails.shop.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Shop phone number not available');
    }
  };

  const callCustomer = () => {
    if (orderDetails?.customer?.phone) {
      Linking.openURL(`tel:${orderDetails.customer.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Customer phone number not available');
    }
  };

  const openMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(url);
  };

  if (!orderDetails) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Order Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Info */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>#{orderDetails.orderNumber}</Text>
              <Text style={styles.orderTime}>
                {new Date(orderDetails.orderTime).toLocaleString()}
              </Text>
            </View>
            <Text style={styles.orderAmount}>₹{orderDetails.totalAmount}</Text>
          </View>
          <View style={styles.earnInfo}>
            <View style={styles.earnRow}>
              <Icon name="account-balance-wallet" size={16} color="#4CAF50" />
              <Text style={styles.earnText}>You'll earn: ₹{orderDetails.deliveryFee}</Text>
            </View>
            <View style={styles.earnRow}>
              <Icon name="access-time" size={16} color="#666" />
              <Text style={styles.distanceText}>
                {orderDetails.distance}km • {orderDetails.estimatedTime} mins
              </Text>
            </View>
          </View>
        </View>

        {/* Pickup Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Location</Text>
          <View style={[styles.locationCard, styles.pickupCard]}>
            <View style={styles.locationHeader}>
              <View style={styles.locationIconContainer}>
                <Icon name="store" size={24} color="#4CAF50" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{orderDetails.shop.name}</Text>
                <Text style={styles.locationAddress}>{orderDetails.shop.address}</Text>
              </View>
              <View style={styles.locationActions}>
                <TouchableOpacity 
                  onPress={callShop} 
                  style={styles.actionIcon}
                  activeOpacity={0.7}
                >
                  <Icon name="call" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openMaps(orderDetails.shop.address)} 
                  style={styles.actionIcon}
                  activeOpacity={0.7}
                >
                  <Icon name="directions" size={20} color="#FF9800" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Delivery Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Location</Text>
          <View style={[styles.locationCard, styles.deliveryCard]}>
            <View style={styles.locationHeader}>
              <View style={styles.locationIconContainer}>
                <Icon name="location-on" size={24} color="#F44336" />
              </View>
              <View style={styles.locationInfo}>
                <Text style={styles.locationName}>{orderDetails.customer.name}</Text>
                <Text style={styles.locationAddress}>{orderDetails.customer.address}</Text>
              </View>
              <View style={styles.locationActions}>
                <TouchableOpacity 
                  onPress={callCustomer} 
                  style={styles.actionIcon}
                  activeOpacity={0.7}
                >
                  <Icon name="call" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => openMaps(orderDetails.customer.address)} 
                  style={styles.actionIcon}
                  activeOpacity={0.7}
                >
                  <Icon name="directions" size={20} color="#FF9800" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Items ({orderDetails.items.length})</Text>
          <View style={styles.itemsContainer}>
            {orderDetails.items.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemDetails}>
                    Qty: {item.quantity} • ₹{item.unitPrice} each
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  ₹{item.quantity * item.unitPrice}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <View style={styles.paymentContainer}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={[
                styles.paymentValue,
                orderDetails.paymentMethod === 'Cash on Delivery' && styles.codPayment
              ]}>
                {orderDetails.paymentMethod}
              </Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Total Amount:</Text>
              <Text style={styles.paymentTotal}>₹{orderDetails.totalAmount}</Text>
            </View>
            {orderDetails.paymentMethod === 'Cash on Delivery' && (
              <View style={styles.codWarning}>
                <Icon name="warning" size={16} color="#FF9800" />
                <Text style={styles.codText}>
                  Collect ₹{orderDetails.totalAmount} in cash from customer
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Special Instructions */}
        {orderDetails.specialInstructions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.instructionsContainer}>
              <Icon name="info" size={16} color="#2196F3" />
              <Text style={styles.instructionsText}>
                {orderDetails.specialInstructions}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleRejectOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.rejectButtonText}>Reject</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={handleAcceptOrder}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>
            {loading ? 'Accepting...' : 'Accept Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 20,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#666',
  },
  orderAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  earnInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  earnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  earnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  locationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickupCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  deliveryCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  locationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
    marginRight: 12,
  },
  locationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  locationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemDetails: {
    fontSize: 13,
    color: '#666',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  codPayment: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  paymentTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  codWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  codText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 8,
    flex: 1,
    fontWeight: '500',
  },
  instructionsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  instructionsText: {
    flex: 1,
    fontSize: 14,
    color: '#1565C0',
    marginLeft: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
export default DeliveryOrderDetailsScreen;
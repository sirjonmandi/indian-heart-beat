import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Image,
  Linking,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../../utils/constants';
import { useSelector, useDispatch } from 'react-redux';
import { getSingleOrder } from '@store/slices/customerOrderSlice';
import { Colors } from '@/styles/colors';

interface RootState {
  customerOrders: {
    orders: any[];
    currentOrder: any | null;
    loading: boolean;
    error: string | null;
  };
}

const OrderDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const dispatch = useDispatch();
  const { orderId } = route.params as { orderId: string };
  const { currentOrder, loading } = useSelector((state: RootState) => state.customerOrders);
  // console.log('====================================');
  // console.log(JSON.stringify(currentOrder,null,2));
  // console.log('====================================');
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

  const getOrderStatus = (status:string) =>{
    const statusMap: Record<string, string> = {
      pending: "Pending",
      confirmed: "Confirmed",
      preparing: "Preparing",
      ready_for_pickup: "Ready for Pickup",
      assigned_to_partner: "Assigned to Partner",
      picked_up: "Picked Up",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
      refunded: "Refunded",
    };
    return statusMap[status] || "Unknown Status";
  }

  const reorderItems = () => {
    navigation.navigate(Constants.SCREENS.CART);
  };

  const downloadInvoice = () => {
    Alert.alert('Invoice download will be implemented');
  };

  const handleCallDeliveryPartner = (phoneNumber: string) => {
    if (currentOrder.status === 'delivered') {
      Alert.alert('Order Delivered', 'This order has already been delivered.');
      return;
    }

    Alert.alert(
      'Call Delivery Partner',
      `Would you like to call ${currentOrder.deliveryPartner?.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const isDeliveryPartnerAssigned = () => {
    const assignedStatuses = ['assigned_to_partner', 'picked_up', 'out_for_delivery', 'delivered'];
    return assignedStatuses.includes(currentOrder?.status) && currentOrder?.deliveryPartner;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'confirmed': return Colors.info;
      case 'ready_for_pickup': return Colors.info;
      case 'preparing': return Colors.warning;
      case 'assigned_to_partner': return Colors.info;
      case 'picked_up': return Colors.info;
      case 'out_for_delivery': return Colors.primary;
      case 'delivered': return Colors.success;
      case 'cancelled': return Colors.error;
      case 'returned': return Colors.error;
      case 'refunded': return Colors.error;
      default: return Colors.gray500;
    }
  };

  const getIcons = (status: string) => {
    switch (status) {
      case 'pending': return 'hourglass-empty';
      case 'confirmed': return 'check-circle';
      case 'ready_for_pickup': return 'store';
      case 'preparing': return 'kitchen';
      case 'assigned_to_partner': return 'person-pin';
      case 'picked_up': return 'inventory';
      case 'out_for_delivery': return 'local-shipping';
      case 'delivered': return 'check-circle';
      case 'cancelled': return 'cancel';
      case 'returned': return 'keyboard-return';
      case 'refunded': return 'attach-money';
      default: return 'info';
    }
  };

  // Dynamic styles based on theme
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.backgroundSecondary : Colors.backgroundSecondary,
    },
    content: {
      flex: 1,
      backgroundColor: isDarkMode ? Colors.backgroundSecondary : Colors.backgroundSecondary,
    },
    summaryCard: {
      backgroundColor: isDarkMode ? Colors.backgroundSecondary : Colors.backgroundSecondary,
      margin: 16,
      padding: 20,
      borderRadius: 12,
      borderStyle:'dashed',
      borderWidth:1,
      borderColor:Colors.primaryBg,
      // elevation: 3,
      // shadowColor: isDarkMode ? '#000000' : '#000000',
      // shadowOffset: { width: 0, height: 2 },
      // shadowOpacity: isDarkMode ? 0.1 : 0.1,
      // shadowRadius: 4,
    },
    detailCard: {
      backgroundColor: isDarkMode ? Colors.backgroundSecondary : Colors.backgroundSecondary,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderStyle:'dashed',
      borderWidth:1,
      borderColor:Colors.primaryBg,
      borderRadius: 12,

      // elevation: 2,
      // shadowColor: isDarkMode ? '#000000' : '#000000',
      // shadowOffset: { width: 0, height: 1 },
      // shadowOpacity: isDarkMode ? 0.1 : 0.08,
      // shadowRadius: 3,
    },
    orderNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDarkMode ? Colors.primaryBg : Colors.primaryBg,
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDarkMode ? Colors.black : Colors.black,
      marginLeft: 8,
    },
    shopName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? Colors.black : Colors.black,
      marginTop: 8,
    },
    shopAddress: {
      fontSize: 14,
      color: isDarkMode ? '#666666' : '#666666',
      marginTop: 4,
    },
    itemName: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? Colors.black : Colors.black,
      marginBottom: 4,
    },
    itemBrand: {
      fontSize: 13,
      color: isDarkMode ? '#666666' : '#666666',
      marginBottom: 2,
    },
    itemQuantity: {
      fontSize: 13,
      color: isDarkMode ? '#666666' : '#666666',
    },
    itemPrice: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? '#4CAF50' : '#4CAF50',
    },
    pricingLabel: {
      fontSize: 14,
      color: isDarkMode ? '#666666' : '#666666',
    },
    pricingValue: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? Colors.black : Colors.black,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDarkMode ? Colors.black : Colors.black,
    },
    totalAmount: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#4CAF50',
    },
    addressText: {
      fontSize: 14,
      color: isDarkMode ? Colors.black : Colors.black,
      marginTop: 8,
      lineHeight: 20,
    },
    paymentMethod: {
      fontSize: 14,
      fontWeight: '600',
      textTransform: 'uppercase',
      color: isDarkMode ? Colors.black : Colors.black,
      marginTop: 8,
    },
    dateLabel: {
      fontSize: 12,
      color: isDarkMode ? '#666666' : '#666666',
      marginBottom: 4,
    },
    dateValue: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? Colors.black : Colors.black,
    },
    partnerName: {
      fontSize: 16,
      fontWeight: 'bold',
      textTransform:'capitalize',
      color: isDarkMode ? '#2C2C2C' : '#2C2C2C',
      marginTop: 8,
    },
    partnerPhone: {
      fontSize: 14,
      color: isDarkMode ? '#666666' : '#666666',
      marginTop: 4,
    },
    partnerVehicle: {
      fontSize: 13,
      color: isDarkMode ? '#666666' : '#666666',
      marginTop: 2,
    },
    notAssignedText: {
      fontSize: 14,
      color: isDarkMode ? '#999999' : '#999999',
      fontStyle: 'italic',
      marginTop: 8,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* Header */}
      <LinearGradient
        colors={[Colors.backgroundSecondary, Colors.backgroundSecondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={[styles.headerButton,styles.backButton]}
        >
          <Icon name="keyboard-arrow-left" size={24} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        {/* <TouchableOpacity 
          onPress={downloadInvoice}
          style={[styles.headerButton]}
        >
          <Icon name="download" size={24} color={Colors.black} />
        </TouchableOpacity> */}
        <TouchableOpacity style={styles.profileButton} onPress={()=> navigation.navigate(Constants.SCREENS.PROFILE)}>
          <View style={styles.profileIcon}>
            <Icon name="person" size={20} color={Colors.black} />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {currentOrder && (
        <ScrollView style={dynamicStyles.content} 
        refreshControl={ <RefreshControl
          refreshing={false} 
          onRefresh={fetchOrderDetails}
          colors={['#4CAF50']} // Android
          tintColor="#4CAF50" // iOS
          title="Pull to refresh" // iOS
          titleColor="#666"
         />} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={dynamicStyles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={dynamicStyles.orderNumber}>Order</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentOrder.status) }]}>
                <Icon name={getIcons(currentOrder.status)} size={16} color="#FFFFFF" />
                <Text style={styles.statusText}>{getOrderStatus(currentOrder.status)}</Text>
              </View>
            </View>

            <View style={styles.summaryHeader}>
              <Text style={dynamicStyles.orderNumber}># {currentOrder.orderNumber}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <View style={styles.dateItem}>
                <Text style={dynamicStyles.dateLabel}>Ordered on</Text>
                <Text style={dynamicStyles.dateValue}>{currentOrder.date}</Text>
              </View>
              {/* <View style={styles.dateItem}>
                <Text style={dynamicStyles.dateLabel}>Delivered on</Text>
                <Text style={dynamicStyles.dateValue}>{currentOrder.estimatedDelivery}</Text>
              </View> */}
            </View>
                <View style={styles.newCardHeader}>
                <View style={styles.cardHeader}>
                  <Icon name="payment" size={20} color="#4CAF50" />
                  <Text style={dynamicStyles.cardTitle}>Payment Status</Text>
                </View>
                <View style={styles.paymentContainer}>
                  <Icon name="account-balance-wallet" size={18} color="#4CAF50" />
                  <Text style={dynamicStyles.paymentMethod}>{currentOrder.paymentStatus}</Text>
                </View>
              </View>
              <View style={styles.newCardHeader}>
                <View style={styles.cardHeader}>
                  <Icon name="payment" size={20} color="#4CAF50" />
                  <Text style={dynamicStyles.cardTitle}>Payment Method</Text>
                </View>
                <View style={styles.paymentContainer}>
                  <Icon name="account-balance-wallet" size={18} color="#4CAF50" />
                  <Text style={dynamicStyles.paymentMethod}>{currentOrder.paymentMethod === 'cash_on_delivery' ? 'COD' : currentOrder.paymentMethod} </Text>
                </View>
              </View>

            {currentOrder.isScheduled && (
              <View style={[styles.statusBadge,{backgroundColor:'#FF9800' + '20', padding: 16, marginTop:10}]}>
                <Text style={{color:'#FF9800'}}>This order is schedule at {currentOrder.scheduledAt}</Text>
              </View>
              )}
          </View>


          {/* Shop Details */}
          {/* <View style={dynamicStyles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="store" size={20} color="#4CAF50" />
              <Text style={dynamicStyles.cardTitle}>Ordered from</Text>
            </View>
            <Text style={dynamicStyles.shopName}>{currentOrder.shopName}</Text>
            <Text style={dynamicStyles.shopAddress}></Text>
            <Text style={dynamicStyles.shopAddress}>{currentOrder.shopAddress}</Text>
          </View> */}

          {/* Order Items */}
          <View style={dynamicStyles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="receipt" size={20} color="#4CAF50" />
              <Text style={dynamicStyles.cardTitle}>Items Ordered</Text>
            </View>
            
            {currentOrder.products?.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <View style={styles.itemImagePlaceholder}>
                  {Array.isArray(item.images) && item.images.length > 0 ? (
                      <Image source={{uri:item.images[0]}} style={{height:50 , width:50, borderRadius:8}}/>
                  ) : (
                    <>
                      <Text style={styles.itemEmoji}>🍺</Text>
                    </>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={dynamicStyles.itemName}>{item.product_name || item.name}</Text>
                  <Text style={dynamicStyles.itemQuantity}>Qty: {item.quantity}</Text>
                </View>
                <Text style={dynamicStyles.itemPrice}>₹{item.price}</Text>
              </View>
            ))}
            
            <View style={styles.pricingContainer}>
              <View style={styles.pricingRow}>
                <Text style={dynamicStyles.pricingLabel}>Subtotal</Text>
                <Text style={dynamicStyles.pricingValue}>₹{currentOrder.subtotal}</Text>
              </View>
              { currentOrder.packagingFee > 0 && <View style={styles.pricingRow}>
                <Text style={dynamicStyles.pricingLabel}>Packaging Fee</Text>
                <Text style={dynamicStyles.pricingValue}>₹{currentOrder.packagingFee}</Text>
              </View>}
              { currentOrder.handlingFee > 0 && <View style={styles.pricingRow}>
                <Text style={dynamicStyles.pricingLabel}>Handling Fee</Text>
                <Text style={dynamicStyles.pricingValue}>₹{currentOrder.handlingFee}</Text>
              </View>}
              {currentOrder.deliveryFee > 0 && <View style={styles.pricingRow}>
                <Text style={dynamicStyles.pricingLabel}>Delivery Fee</Text>
                <Text style={dynamicStyles.pricingValue}>₹{currentOrder.deliveryFee}</Text>
              </View>}
              {currentOrder.taxAmount > 0 && <View style={styles.pricingRow}>
                <Text style={dynamicStyles.pricingLabel}>Tax (18%)</Text>
                <Text style={dynamicStyles.pricingValue}>₹{currentOrder.taxAmount}</Text>
              </View>}
              {currentOrder.coupon && <View style={styles.pricingRow}>
                <Text style={dynamicStyles.pricingLabel}>Coupon ({currentOrder.coupon.couponName})</Text>
                <Text style={dynamicStyles.pricingValue}>- ₹{currentOrder.coupon.disccountAmount}</Text>
              </View>}
              <View style={styles.divider} />
              <View style={[styles.pricingRow, styles.totalRow]}>
                <Text style={dynamicStyles.totalLabel}>Total Paid</Text>
                <Text style={dynamicStyles.totalAmount}>₹{currentOrder.total}</Text>
              </View>
              <View style={styles.divider} />
              <View style={[styles.pricingRow, styles.totalRow]}>
                <TouchableOpacity style={styles.reorderButton} onPress={()=>{navigation.navigate(Constants.SCREENS.ORDER_TRACKING,{ orderId })}}>
                  <Text style={styles.reorderButtonText}>Track Order</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Delivery Partner Section */}
          {/* <View style={dynamicStyles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="delivery-dining" size={20} color="#4CAF50" />
              <Text style={dynamicStyles.cardTitle}>Delivery Partner</Text>
            </View>
            
            {isDeliveryPartnerAssigned() ? (
              <>
                <View style={styles.partnerInfoContainer}>
                  <View style={styles.partnerAvatar}>
                    {currentOrder.deliveryPartner.avatar ? (
                      <Image 
                        source={{ uri: currentOrder.deliveryPartner.avatar }} 
                        style={styles.avatarImage}
                      />
                    ) : (
                      <Icon name="person" size={32} color="#4CAF50" />
                    )}
                  </View>
                  <View style={styles.partnerDetails}>
                    <Text style={dynamicStyles.partnerName}>
                      {currentOrder.deliveryPartner.name}
                    </Text>
                    <Text style={dynamicStyles.partnerPhone}>
                      {currentOrder.deliveryPartner.phone}
                    </Text>
                    {currentOrder.deliveryPartner.vehicleNumber && (
                      <Text style={dynamicStyles.partnerVehicle}>
                        Vehicle: {currentOrder.deliveryPartner.vehicleNumber}
                      </Text>
                    )}
                    {currentOrder.status === 'delivered' && (
                      <View style={styles.deliveredBadgeSmall}>
                        <Icon name="check-circle" size={14} color="#4CAF50" />
                        <Text style={styles.deliveredText}>Order Delivered</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.callButton,
                    currentOrder.status === 'delivered' && styles.callButtonDisabled
                  ]}
                  onPress={() => handleCallDeliveryPartner(currentOrder.deliveryPartner.phone)}
                  disabled={currentOrder.status === 'delivered'}
                >
                  <Icon 
                    name="phone" 
                    size={20} 
                    color={currentOrder.status === 'delivered' ? '#999999' : '#FFFFFF'} 
                  />
                  <Text style={[
                    styles.callButtonText,
                    currentOrder.status === 'delivered' && styles.callButtonTextDisabled
                  ]}>
                    {currentOrder.status === 'delivered' ? 'Delivered' : 'Call Partner'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.notAssignedContainer}>
                <Icon name="pending" size={48} color="#E0E0E0" />
                <Text style={dynamicStyles.notAssignedText}>
                  Delivery partner not assigned yet
                </Text>
                <Text style={styles.notAssignedSubtext}>
                  We'll notify you once a delivery partner picks up your order
                </Text>
              </View>
            )}
          </View> */}

          {/* Delivery Address */}
          <View style={dynamicStyles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="location-on" size={20} color="#4CAF50" />
              <Text style={dynamicStyles.cardTitle}>Delivery Address</Text>
            </View>
            <Text style={dynamicStyles.addressText}>{currentOrder.deliveryAddress}</Text>
          </View>

          {/* Payment Method */}
          {/* <View style={dynamicStyles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="payment" size={20} color="#4CAF50" />
              <Text style={dynamicStyles.cardTitle}>Payment Method</Text>
            </View>
            <View style={styles.paymentContainer}>
              <Icon name="account-balance-wallet" size={18} color="#4CAF50" />
              <Text style={dynamicStyles.paymentMethod}>{currentOrder.paymentMethod === 'cash_on_delivery' ? 'COD' : currentOrder.paymentMethod} </Text>
            </View>
          </View> */}

          {/* <View style={dynamicStyles.detailCard}>
            <View style={styles.cardHeader}>
              <Icon name="payment" size={20} color="#4CAF50" />
              <Text style={dynamicStyles.cardTitle}>Payment Status</Text>
            </View>
            <View style={styles.paymentContainer}>
              <Icon name="account-balance-wallet" size={18} color="#4CAF50" />
              <Text style={dynamicStyles.paymentMethod}>{currentOrder.paymentStatus}</Text>
            </View>
          </View> */}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.reorderButton} onPress={reorderItems}>
              <Icon name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.reorderButtonText}>Reorder</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.rateButton} onPress={()=>{alert('Rate Order will be implemented');}}>
              <Icon name="star" size={20} color="#FFD700" />
              <Text style={styles.rateButtonText}>Rate Order</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      )}
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  backButton: {
    marginRight: 8,
    color: '#1A1A1A',
    backgroundColor: '#f7f6f9ff',
    borderRadius: 50,
    height:40,
    width:40,
    justifyContent:'center',
    alignItems:'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  deliveredBadge: {
    backgroundColor: '#4CAF50',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderStyle:'dashed',
    borderTopColor: '#E0E0E0',
    padding: 16,
  },
  dateItem: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 8,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderStyle:'dashed',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemImagePlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  pricingContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderStyle:'dashed',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
  },
  divider: {
    // height: 1,
    // backgroundColor: '#E0E0E0',
    marginVertical: 8,
    borderStyle:'dashed',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // borderStyle:'dashed',
    // borderBottomWidth: 1,
    // borderBottomColor: '#E0E0E0',
    marginTop: 8,
    // marginBottom: 16,
  },
  partnerInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  partnerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  partnerDetails: {
    flex: 1,
  },
  deliveredBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  deliveredText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 4,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  callButtonDisabled: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  callButtonTextDisabled: {
    color: '#999999',
  },
  notAssignedContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  notAssignedSubtext: {
    fontSize: 12,
    color: '#AAAAAA',
    marginTop: 8,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  reorderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryBg,
    paddingVertical: 14,
    borderRadius: 50,
    // elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reorderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  rateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 12,
  },
  rateButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 24,
  },
  profileButton: {
    padding: 4,
  },
  profileIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f7f6f9ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  newCardHeader: {
    flexDirection:'row',
    alignItems:'center', 
    justifyContent:'space-between', 
    marginBottom:10,                  
    borderBottomWidth: 1,
    borderStyle:'dashed',
    borderBottomColor: '#E0E0E0'
  },
});

export default OrderDetailsScreen;
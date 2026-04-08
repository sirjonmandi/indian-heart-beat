import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TODO: Uncomment when these actions are available
import { 
  fetchAvailableOrders, 
  acceptOrder, 
  rejectOrder 
} from '@store/slices/deliverySlice';
import { Colors } from '../../../styles/colors';
import { Typography } from '../../../styles/typography';
import { Spacing } from '../../../styles/spacing';

// DUMMY DATA for testing
// const dummyOrders = [
  // {
  //   id: '1',
  //   orderNumber: 'BG001',
  //   totalAmount: 1250,
  //   deliveryFee: 50,
  //   shop: {
  //     name: 'Wine Shop Central',
  //     address: 'Park Street, Kolkata',
  //   },
  //   customer: {
  //     address: 'Salt Lake, Kolkata',
  //   },
  //   distance: 2.5,
  //   estimatedTime: 15,
  //   items: [
  //     { productName: 'Premium Whiskey', quantity: 1 },
  //     { productName: 'Beer Pack', quantity: 2 },
  //   ],
  //   paymentMethod: 'Online',
  // },
  // {
  //   id: '2',
  //   orderNumber: 'BG002',
  //   totalAmount: 890,
  //   deliveryFee: 40,
  //   shop: {
  //     name: 'Premium Liquors',
  //     address: 'Camac Street, Kolkata',
  //   },
  //   customer: {
  //     address: 'New Town, Kolkata',
  //   },
  //   distance: 1.8,
  //   estimatedTime: 12,
  //   items: [
  //     { productName: 'Red Wine', quantity: 1 },
  //   ],
  //   paymentMethod: 'Cash on Delivery',
  // },
  // {
  //   id: '3',
  //   orderNumber: 'BG003',
  //   totalAmount: 2100,
  //   deliveryFee: 60,
  //   shop: {
  //     name: 'Royal Spirits',
  //     address: 'Esplanade, Kolkata',
  //   },
  //   customer: {
  //     address: 'Howrah, Kolkata',
  //   },
  //   distance: 3.2,
  //   estimatedTime: 20,
  //   items: [
  //     { productName: 'Premium Vodka', quantity: 1 },
  //     { productName: 'Champagne', quantity: 1 },
  //   ],
  //   paymentMethod: 'Online',
  // },
// ];

interface RootState {
  delivery: {
    availableOrders: typeof dummyOrders;
    loading: boolean;
  };
}

const DeliveryOrdersScreen: React.FC = () => {
  const dispatch = useDispatch();
  const [dummyOrders, setdummyOrders] = useState(null);
  // Safely get delivery state with fallbacks
  const deliveryState = useSelector((state: RootState) => state.delivery);
  const { 
    availableOrders, 
    loading = false 
  } = deliveryState || {};
  console.log(JSON.stringify(availableOrders,null,2));
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchAvailableOrders()).unwrap();
      console.log('📋 Loading available orders (DUMMY MODE)');

    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    // setRefreshing(false);
    setTimeout(() => setRefreshing(false), 1000); // Simulate loading
  };

  const handleAcceptOrder = async (orderId: string) => {
    const order = availableOrders.find(o => o.id === orderId);
    Alert.alert(
      'Accept Order',
      `Accept order #${order?.orderNumber}? You'll earn ₹${order?.deliveryFee}`,
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
            } catch (error) {
              Alert.alert('Error', 'Failed to accept order');
            }
          },
        },
      ]
    );
  };

  const handleRejectOrder = async (orderId: string) => {
    const order = availableOrders.find(o => o.id === orderId);
    Alert.alert(
      'Reject Order',
      `Reject order #${order?.orderNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Uncomment when action is ready
              // await dispatch(rejectOrder(orderId)).unwrap();
              Alert.alert('Order Rejected', 'Order rejected successfully (DUMMY MODE)');
              console.log('❌ Order rejected (DUMMY MODE):', orderId);
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order');
            }
          },
        },
      ]
    );
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
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready_for_pickup': return 'Ready for Pickup';
      case 'assigned_to_partner': return "Assigned to Partner";
      case 'picked_up': return 'Picked Up';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'returned': return 'Returned';
      case 'refunded': return 'Refunded';
      default: return status;
    }
  };

  const renderOrderItem = ({ item: order }) => (
    // <View style={styles.orderCard}>
    //   <View style={styles.orderHeader}>
    //     <View>
    //       <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
    //       <Text style={styles.orderShop}>{order.shop.name}</Text>
    //     </View>
    //     <View style={styles.orderAmount}>
    //       <Text style={styles.amountText}>₹{order.totalAmount}</Text>
    //       <Text style={styles.earnText}>Earn ₹{order.deliveryFee}</Text>
    //     </View>
    //   </View>

    //   <View style={styles.orderDetails}>
    //     <View style={styles.detailRow}>
    //       <Icon name="location-on" size={16} color="#666" />
    //       <Text style={styles.detailText} numberOfLines={2}>
    //         {order.shop.address} → {order.customer.address}
    //       </Text>
    //     </View>
    //     <View style={styles.detailRow}>
    //       <Icon name="access-time" size={16} color="#666" />
    //       <Text style={styles.detailText}>
    //         {order.distance}km • {order.estimatedTime} mins
    //       </Text>
    //     </View>
    //     <View style={styles.detailRow}>
    //       <Icon name="shopping-bag" size={16} color="#666" />
    //       <Text style={styles.detailText}>
    //         {order.length} item(s) • {order.paymentMethod}
    //       </Text>
    //     </View>
    //   </View>

    //   <View style={styles.orderActions}>
    //     <TouchableOpacity
    //       style={[styles.actionButton, styles.rejectButton]}
    //       onPress={() => handleRejectOrder(order.id)}
    //       activeOpacity={0.8}
    //     >
    //       <Text style={styles.rejectButtonText}>Reject</Text>
    //     </TouchableOpacity>
    //     <TouchableOpacity
    //       style={[styles.actionButton, styles.acceptButton]}
    //       onPress={() => handleAcceptOrder(order.id)}
    //       activeOpacity={0.8}
    //     >
    //       <Text style={styles.acceptButtonText}>Accept</Text>
    //     </TouchableOpacity>
    //   </View>
    // </View>

    <TouchableOpacity 
      key={order.id} 
      style={styles.orderCard}
      // onPress={() => Alert.alert('Order Details', `Order #${order.order_number} selected`)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{order.order_number}</Text>
        <View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
              {getStatusText(order.status)}
            </Text>
          </View>
          <Text style={styles.orderAmount}>₹{order.order_details.total_amount}</Text>
        </View>
      </View>
      <View style={styles.orderDetails}>
        <Text style={styles.orderShop}>{order.shop.name}</Text>
        <Text style={styles.orderDistance}>{order.shop.distance_km}km away</Text>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderEarning}>Earn ₹{order.earnings.total_earnings}</Text>
        <Text style={styles.orderTime}>{order.estimated_time} mins</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>{availableOrders.length} orders</Text>
      </View>
      {availableOrders && (
        <FlatList
          data={availableOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="local-shipping" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No orders completed</Text>
              <Text style={styles.emptySubtext}>
                Turn on your availability to receive orders
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  // orderCard: {
  //   backgroundColor: '#fff',
  //   borderRadius: 12,
  //   padding: 16,
  //   marginBottom: 12,
  //   elevation: 3,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 2 },
  //   shadowOpacity: 0.1,
  //   shadowRadius: 8,
  //   borderLeftWidth: 4,
  //   borderLeftColor: '#2196F3',
  // },
  // orderHeader: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'flex-start',
  //   marginBottom: 12,
  // },
  // orderNumber: {
  //   fontSize: 18,
  //   fontWeight: 'bold',
  //   color: '#333',
  //   marginBottom: 4,
  // },
  // orderShop: {
  //   fontSize: 14,
  //   color: '#666',
  //   fontWeight: '500',
  // },

    orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign:'right'
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderShop: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  orderDistance: {
    fontSize: 12,
    color: '#999',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderEarning: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },

  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },

  // orderAmount: {
  //   alignItems: 'flex-end',
  // },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  earnText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  // orderDetails: {
  //   marginBottom: 16,
  // },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
    fontSize: 14,
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default DeliveryOrdersScreen;
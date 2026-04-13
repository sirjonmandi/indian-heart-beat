import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../../styles/colors';
import { Typography } from '../../../styles/typography';
import { Spacing } from '../../../styles/spacing';

import { GlobalStyles } from '../../../styles/globalStyles';
import { Constants } from '../../../utils/constants';
import Header from '../../../components/common/Header';
import LinearGradient from 'react-native-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { getOrders } from '@store/slices/customerOrderSlice';
import { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { CartHeader } from '@/components/customer';

interface RootState {
  customerOrders: {
    orders: any[];
    currentOrder: any | null;
    loading: boolean;
    error: string | null;
  };
}

const OrderHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const ordersSlice = useSelector((state: RootState) => state.customerOrders);
  const { orders, loading } = ordersSlice;
  // console.log('====================================');
  // console.log(JSON.stringify(orders,null,2));
  // console.log('====================================');
  const isFocused = useIsFocused();
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    fetchOrders();
  }, [dispatch,isFocused]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Dispatch the cart refresh action
      await fetchOrders();
      // Optional: Add a small delay for better UX
      setTimeout(() => {
        setRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error refreshing cart:', error);
      setRefreshing(false);
    }
  };

  const fetchOrders = async () => {
    try {
      await dispatch(getOrders()).unwrap();
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
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

  const handleOrderPress = (order: any) => {
    console.log("navigating with order id " + order.id);
    navigation.navigate(Constants.SCREENS.ORDER_DETAILS, { orderId: order.id });
  };

  const renderOrderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.orderCard}
      onPress={() => handleOrderPress(item)}
    >
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.orderDetails}>
        <Text style={styles.orderInfo}>
          {item.items} items • ₹{item.total}
        </Text>
        <Text style={styles.orderDate}>
          Ordered on {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      
      <View style={styles.orderFooter}>
        <Text style={styles.orderAction}>View Details</Text>
        <Icon name="chevron-right" size={20} color={Colors.gray500} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={GlobalStyles.container}>
       <LinearGradient
               colors={[Colors.backgroundSecondary, Colors.backgroundSecondary]}
               style={styles.header}
               start={{ x: 0, y: 0 }}
               end={{ x: 1, y: 1 }}
             >
               <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                 <Icon name="keyboard-arrow-left" size={24} color={Colors.black} />
               </TouchableOpacity>
               <Text style={styles.headerTitle}>My Orders</Text>
               <TouchableOpacity style={styles.profileButton} onPress={()=> navigation.navigate(Constants.SCREENS.PROFILE)}>
                <View style={styles.profileIcon}>
                  <Icon name="person" size={20} color={Colors.black} />
                </View>
              </TouchableOpacity>
        </LinearGradient>
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]} // Android
                tintColor={Colors.primary} // iOS
                title="Pull to refresh" // iOS
                titleColor="#666" // iOS
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="shopping-basket" size={64} color={Colors.gray400} />
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start shopping to see your orders here
                </Text>
              </View>
            }
          />
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
    color: Colors.black,
    textAlign: 'center',
  },
  container: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  orderCard: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth:1,
    borderRadius: 12,
    borderStyle:'dashed',
    borderColor:Colors.primaryBg,
    // shadowColor: '#999',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // elevation: 3,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  content: {
    flex: 1,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  orderNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.black,
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
  orderDetails: {
    marginBottom: Spacing.md,
  },
  orderInfo: {
    fontSize: Typography.fontSize.base,
    color: Colors.black,
    marginBottom: Spacing.xs,
  },
  orderDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderAction: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex:1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.black,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.black,
    textAlign: 'center',
  },
  backButton: {
    padding: 4,
    marginRight: 8,
    color: Colors.black,
    backgroundColor: '#f7f6f9ff',
    borderRadius: 50,
    height:40,
    width:40,
    justifyContent:'center',
    alignItems:'center',
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
});

export default OrderHistoryScreen;
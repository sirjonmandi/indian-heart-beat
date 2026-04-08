import React, {useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeliveryNotificationPopup from '@/components/common/DeliveryNotificationPopup';

// CORRECT: Import Redux actions from delivery slice
import {
  toggleAvailability,
  updateLocation,
  fetchDashboardData,
  fetchAvailableOrders,
  clearNotification,
  // setDummyData,
  acceptOrder,
  rejectOrder,
  fetchOrderNotification,
} from '../../../store/slices/deliverySlice';
import { Constants } from '@/utils/constants';
import { NotificationRequest } from '@/components/common/NotificationRequest';

// TODO: Uncomment when LocationService is ready
// import { LocationService } from '../../../services/location';

interface RootState {
  delivery: {
    isOnline: boolean;
    isAvailable: boolean;
    partnerStatus:string;
    notification:any;
    currentLocation: { latitude: number; longitude: number } | null;
    todayEarnings: number;
    totalDeliveries: number;
    acceptanceRate: number;
    rating: number;
    availableOrders: any[];
    activeOrder: any | null;
    loading: boolean;
  };
}

const DeliveryDashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Now properly get delivery state from Redux
  const {
    isOnline,
    isAvailable,
    partnerStatus,
    currentLocation,
    notification,
    todayEarnings,
    totalDeliveries,
    acceptanceRate,
    rating,
    availableOrders,
    activeOrder,
    loading,
  } = useSelector((state: RootState) => state.delivery);

  const [refreshing, setRefreshing] = useState(false);
  const [statusToggling, setStatusToggling] = useState(false);

  const isOnlineRef = useRef(isOnline);
  // console.log("active orders " + JSON.stringify(activeOrder,null,2));
  
  isOnlineRef.current = isOnline;
  useEffect(() => {
    // Initialize with dummy data for testing
    // dispatch(setDummyData());
    loadDashboardData();
    // startLocationTracking(); // Commented out until LocationService is ready
  }, [isOnline]);

  useEffect(() => {
    setTimeout(() => {
      NotificationRequest();
    }, 2000);
  },[]);

  const loadDashboardData = async () => {
    try {
      await dispatch(fetchDashboardData()).unwrap();
      await dispatch(fetchAvailableOrders()).unwrap();
      if (isOnline) {
        console.log("is online " + isOnline);
        // getOrderNotification();
      }
      console.log('📊 Dashboard data loaded successfully');
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      Alert.alert("Error", "Failed to load Information Please Check Your Internet Connection.");
    }
  };

  const getOrderNotification = async() =>{
    // if (!isOnlineRef.current) {
    //   console.log("user is offline");
    //   return;
    // }
    // if(notification) {
    //   console.log("notification is available");
    //   return;
    // }
    // try {
    //   console.log("calling fetch order notification");
    //   await dispatch(fetchOrderNotification()).unwrap();
    //   if (isOnlineRef.current) { 
    //     setTimeout(() => {
    //       getOrderNotification();
    //     }, 10000);
    //   }
    // } catch (error) {
    //   console.error('Failed to load notification data:', error);
    // }
  }

  const removeNotification = () =>{
    try {
      dispatch(clearNotification());
      getOrderNotification();
      loadDashboardData();
    } catch (error) {
      console.error("failed to remove notification", JSON.stringify(error,null,2));
    }
  }

  const handleAccept = async (notification) => {
    console.log('Accepting order:', notification.action_data.unique_key);
    try {
      await dispatch(acceptOrder(notification.action_data.unique_key)).unwrap();
      removeNotification();
      loadDashboardData();
    } catch (error:any) {
      console.error("Failed to accept order ", error);
      Alert.alert('Failed',error.message);
    }
  };

  const handleReject = async (notification) => {
    console.log('Rejecting order:', notification.action_data.unique_key);
    try {
      await dispatch(
        rejectOrder({
          orderId: notification.action_data.unique_key,
          reason: "other",
        })
      ).unwrap();
      removeNotification();
      loadDashboardData();
    } catch (error:any) {
      console.error("Failed to reject order ", error);
      Alert.alert('Failed',error.message);
    }

    // Make API call to reject_url
    // try {
    //   await fetch(notification.action_data.reject_url, { method: 'POST' });
    // } catch (error) {
    //   console.error('Failed to reject order:', error);
    // }
  };

  const handleClose = () => {
    console.log('Notification popup closed');
    removeNotification();
  };


  const startLocationTracking = () => {
    // TODO: Uncomment when LocationService is ready
    // LocationService.startLocationTracking((location) => {
    //   dispatch(updateLocation(location));
    // });
    console.log('📍 Location tracking started (DUMMY MODE)');
  };

  const handleToggleAvailability = async () => {
    if (statusToggling) return;

    // Check if shop is approved before allowing toggle
      if (partnerStatus !== 'approved') {
        const statusMessages = {
          'pending': 'Your account is still under review. You\'ll be notified once it\'s approved.',
          'rejected': 'Your account application was rejected. Please contact our support team for assistance.',
          'suspended': 'Your account is currently suspended. Please contact support to resolve this issue.',
        };

        const message = statusMessages[partnerStatus] || 'Your account must be approved before you can change its status.';

        Alert.alert(
          'Action Not Allowed',
          message,
          [
            { text: 'Contact Support', onPress: () => {/* Navigate to support */} },
            { text: 'OK', style: 'cancel' }
          ]
        );
        return;
      }
    
    setStatusToggling(true);
    
    try {
      await dispatch(toggleAvailability() as any).unwrap();
      removeNotification();
      console.log('🔄 Availability toggled successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update availability status');
    } finally {
      setStatusToggling(false);
    }
  };

  const getStatusText = () => {
    if (partnerStatus === 'pending') return 'Account is under review';
    if (partnerStatus === 'rejected') return 'Account is rejected';
    if (partnerStatus === 'rechecked_required') return 'Your account needs recheck';

    if (!isOnline) return 'Go online to start receiving orders';
    if (!isAvailable) return 'Busy with current delivery';

    return 'Ready to receive orders';
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setTimeout(() => setRefreshing(false), 1000); // Simulate loading
  };

  const navigateToOrders = () => {
    navigation.navigate(Constants.SCREENS.DELIVERY_ORDERS_TAB);
    // Alert.alert('Navigation', 'DeliveryOrders screen not implemented yet');
  };

  const navigateToEarnings = () => {
    navigation.navigate(Constants.SCREENS.DELIVERY_EARNINGS_TAB);
    // Alert.alert('Navigation', 'DeliveryEarnings screen not implemented yet');
  };

  const navigateToProfile = () => {
    navigation.navigate(Constants.SCREENS.DELIVERY_PROFILE_TAB);
    // Alert.alert('Navigation', 'DeliveryProfile screen not implemented yet');
  };

  const navigateToOrderDetails = (orderId:string) =>{
    // Alert.alert('Navigation', `Tracking for order #${orderId}`);
    // navigation.navigate(Constants.SCREENS.DELIVERY_ORDER_DETAILS,{ orderId });
    navigation.navigate(Constants.SCREENS.DELIVERY_TRACKING,{ orderId });
  }
  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Delivery Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome back, Delivery Partner!</Text>
        </View>

        {/* Online Status Toggle */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>You're {isOnline ? 'Online' : 'Offline'}</Text>
            <Switch
              value={isOnline}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#767577', true: '#4CAF50' }}
              thumbColor={isOnline ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.statusSubtitle}>
            {getStatusText()}
          </Text>
          {partnerStatus !== 'approved' && (
            <Text style={styles.approvalMessage}>
              {partnerStatus === 'pending' && '⏳ Under review - We\'ll notify you soon'}
              {partnerStatus === 'rejected' && '❌ Application rejected - Contact support'}
              {partnerStatus === 'suspended' && '⚠️ Account suspended - Contact support'}
            </Text>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Icon name="attach-money" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>₹{todayEarnings || 0}</Text>
            <Text style={styles.statLabel}>Today's Earnings</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="delivery-dining" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{totalDeliveries || 0}</Text>
            <Text style={styles.statLabel}>Total Deliveries</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="thumb-up" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{acceptanceRate || 0}%</Text>
            <Text style={styles.statLabel}>Acceptance Rate</Text>
          </View>
          
          <View style={styles.statCard}>
            <Icon name="star" size={24} color="#FFC107" />
            <Text style={styles.statValue}>{rating || 0}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Active Order */}
        {activeOrder && activeOrder.length > 0 && (
          activeOrder.map((order, index) => (
            <View key={index} style={styles.activeOrderCard}>
              <View style={styles.activeOrderHeader}>
                <Text style={styles.activeOrderTitle}>Active Delivery</Text>
                <Text style={styles.activeOrderId}>#{order.order_number || 'N/A'}</Text>
              </View>

              <View style={styles.activeOrderDetails}>
                <View style={styles.activeOrderLocation}>
                  <Icon name="store" size={20} color="#666" />
                  <Text style={styles.locationText}>{order.shop_name || "N/A"}</Text>
                </View>

                <View style={styles.activeOrderLocation}>
                  <Icon name="location-on" size={20} color="#666" />
                  <Text style={styles.locationText}>{order.delivery_address || 'Customer Address'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.trackButton}
                onPress={()=>{navigateToOrderDetails(order.id)}}
              >
                <Text style={styles.trackButtonText}>Track Delivery</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Available Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Orders</Text>
            <TouchableOpacity onPress={navigateToOrders}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {(availableOrders || []).slice(0, 3).map((order) => (
            <TouchableOpacity 
              key={order.id} 
              style={styles.orderCard}
              onPress={() => Alert.alert('Order Details', `Order #${order.order_number} selected`)}
            >
              <View style={styles.orderHeader}>
                <Text style={styles.orderNumber}>#{order.order_number}</Text>
                <Text style={styles.orderAmount}>₹{order.order_details.total_amount}</Text>
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
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton} onPress={navigateToEarnings}>
            <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Earnings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={navigateToOrders}>
            <Icon name="history" size={24} color="#2196F3" />
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={navigateToProfile}>
            <Icon name="person" size={24} color="#FF9800" />
            <Text style={styles.actionText}>Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("HelpSupport")}>
            <Icon name="help" size={24} color="#9C27B0" />
            <Text style={styles.actionText}>Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    {/* <View style={{ flex: 1, backgroundColor: '#111827' }}> */}
      {notification && 
        <DeliveryNotificationPopup
        notifications={notification}
        onAccept={handleAccept}
        onReject={handleReject}
        onClose={handleClose}
        />
      }
    {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  approvalMessage: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  activeOrderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activeOrderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  activeOrderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  activeOrderId: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  activeOrderDetails: {
    marginBottom: 16,
  },
  activeOrderLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  ordersSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
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
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default DeliveryDashboardScreen;
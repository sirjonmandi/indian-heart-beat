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

// TODO: Uncomment when shop slice actions are ready
import {fetchOrders, acceptOrder, rejectOrder, markOrderReady} from '@store/slices/orderSlice';

interface RootState {
  shop?: {
    orders: any[];
    loading: boolean;
  };
}

const ShopOrderManagementScreen: React.FC = () => {
  const dispatch = useDispatch();
  
  // Safely get shop state with fallbacks
  const shopState = useSelector((state: RootState) => state.orders);
  const { orders = [], loading = false, pendingCount = 0, confirmedCount = 0, completedCount = 0, readyForPickupCount = 0 } = shopState || {};

  const [selectedTab, setSelectedTab] = useState('pending');
  const [refreshing, setRefreshing] = useState(false);

  // Get orders for selected tab from dummy data
  const getOrdersForTab = () => {

    // return dummyOrders[selectedTab as keyof typeof dummyOrders] || [];
    return orders;
  };

  useEffect(() => {
    loadOrders();
  }, [selectedTab]);

  const loadOrders = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchOrders({ status: selectedTab })).unwrap();
      // console.log('📋 Loading orders (DUMMY MODE) for tab:', selectedTab);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setTimeout(() => setRefreshing(false), 1000); // Simulate loading
  };

  const handleAcceptOrder = async (orderId: string) => {
    const order = getOrdersForTab().find(o => o.id === orderId);
    Alert.alert(
      'Accept Order',
      `Accept order #${order?.order_number} ?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              // TODO: Uncomment when action is ready
              await dispatch(acceptOrder(orderId)).unwrap();
              // Alert.alert('Success', 'Order accepted successfully! (DUMMY MODE)');
              // console.log('✅ Order accepted (DUMMY MODE):', orderId);
            } catch (error) {
              Alert.alert('Error', 'Failed to accept order');
            }
          },
        },
      ]
    );
  };

  const handleRejectOrder = async (orderId: string) => {
    const order = getOrdersForTab().find(o => o.id === orderId);
    Alert.alert(
      'Reject Order',
      `Reject order #${order?.order_number}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              // TODO: Uncomment when action is ready
              await dispatch(rejectOrder({ orderId, reason: 'shop requested rejection' })).unwrap();
              // Alert.alert('Order Rejected', 'Order rejected successfully (DUMMY MODE)');
              // console.log('❌ Order rejected (DUMMY MODE):', orderId);
            } catch (error) {
              Alert.alert('Error', 'Failed to reject order');
            }
          },
        },
      ]
    );
  };

  const handleMarkReady = async (orderId: string) => {
    const order = getOrdersForTab().find(o => o.id === orderId);
    Alert.alert(
      'Mark Ready',
      `Mark order #${order?.order_number} as ready for pickup?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Ready',
          onPress: async () => {
            try {
              // TODO: Uncomment when action is ready
              await dispatch(markOrderReady({orderId})).unwrap();
              // Alert.alert('Success', 'Order marked as ready for pickup! (DUMMY MODE)');
              // console.log('🎯 Order marked ready (DUMMY MODE):', orderId);
            } catch (error) {
              Alert.alert('Error', 'Failed to update order status');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'confirmed': return '#2196F3';
      case 'ready': return '#4CAF50';
      case 'completed': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'schedule';
      case 'confirmed': return 'check-circle';
      case 'ready': return 'local-shipping';
      case 'completed': return 'done-all';
      default: return 'help';
    }
  };

  const renderOrderItem = ({ item: order }) => (
    <View style={[styles.orderCard, { borderLeftColor: getStatusColor(order.status) }]}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleSection}>
          <View style={styles.orderNumberRow}>
            <Text style={styles.orderNumber}>#{order.order_number}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
              <Icon 
                name={getStatusIcon(order.status)} 
                size={12} 
                color={getStatusColor(order.status)} 
              />
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.customerName}>{order.customer.name}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        <Text style={styles.itemsHeader}>Order Items:</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemText}>
              {item.quantity}x {item.product_name}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.customerInfo}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.addressText} numberOfLines={2}>
            {order.customer.address ? order.customer.address.contact_name + ', ' + order.customer.address.address_line_1 + ', ' + order.customer.address.pincode + ' phone: ' + order.customer.address.contact_phone : 'Address not provided'}
          </Text>
        </View>
        <View style={styles.paymentInfo}>
          <View style={[
            styles.paymentBadge,
            order.payment_method === 'cash_on_delivery' ? styles.codBadge : styles.onlineBadge
          ]}>
            <Icon   
              name={order.payment_method === 'cash_on_delivery' ? 'payments' : 'credit-card'} 
              size={12} 
              color={order.payment_method === 'cash_on_delivery' ? '#E65100' : '#2E7D32'} 
            />
            <Text style={[
              styles.paymentText,
              order.payment_method === 'cash_on_delivery' ? styles.codText : styles.onlineText
            ]}>
              {order.payment_method === 'cash_on_delivery' ? 'COD' : 'PAID'}
            </Text>
          </View>

          <View style={styles.orderAmountSection}>
            <Text style={styles.amountText}>₹{order.total_amount}</Text>
            <Text style={styles.timeText}>{order.timeAgo}</Text>
          </View>
        </View>
      </View>
      {order.is_scheduled && (
        <View style={[styles.statusBadge,{backgroundColor:'#FF9800' + '20'}]}>
            <Text style={{color:'#FF9800'}}>This order is schedule at {order.scheduled_at}</Text>
        </View>
      )}

      {order.status === 'pending' && (
        <View style={styles.orderActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleRejectOrder(order.id)}
            activeOpacity={0.8}
          >
            <Icon name="close" size={16} color="#F44336" />
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.acceptButton]}
            onPress={() => handleAcceptOrder(order.id)}
            activeOpacity={0.8}
          >
            <Icon name="check" size={16} color="#fff" />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
      )}

      {order.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.readyButton}
          onPress={() => handleMarkReady(order.id)}
          activeOpacity={0.8}
        >
          <Icon name="local-shipping" size={16} color="#fff" />
          <Text style={styles.readyButtonText}>Mark Ready for Pickup</Text>
        </TouchableOpacity>
      )}

      {order.status === 'ready' && (
        <View style={styles.waitingContainer}>
          <Icon name="schedule" size={16} color="#4CAF50" />
          <Text style={styles.waitingText}>Waiting for delivery partner pickup</Text>
        </View>
      )}

      {order.status === 'completed' && (
        <View style={styles.completedContainer}>
          <Icon name="done-all" size={16} color="#9E9E9E" />
          <Text style={styles.completedText}>Order completed</Text>
        </View>
      )}
    </View>
  );

  const tabs = [
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'confirmed', label: 'Confirmed', count: confirmedCount },
    { key: 'ready_for_pickup', label: 'Ready', count: readyForPickupCount },
    { key: 'delivered', label: 'Completed', count: completedCount },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Order Management</Text>
        <Text style={styles.headerSubtitle}>Manage your shop orders</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setSelectedTab(tab.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
            {tab.count > 0 && (
              <View style={[
                styles.tabBadge,
                selectedTab === tab.key && styles.activeTabBadge
              ]}>
                <Text style={[
                  styles.tabBadgeText,
                  selectedTab === tab.key && styles.activeTabBadgeText
                ]}>
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={getOrdersForTab()}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No {selectedTab} orders</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'pending' ? 'New orders will appear here' : 
               selectedTab === 'confirmed' ? 'Accepted orders will appear here' :
               selectedTab === 'ready' ? 'Orders ready for pickup will appear here' :
               'Completed orders will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4CAF50',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 4,
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  tabBadge: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: '#4CAF50',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabBadgeText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderTitleSection: {
    flex: 1,
    marginRight: 12,
  },
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderAmountSection: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  orderItems: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  itemsHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  itemRow: {
    marginBottom: 4,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  addressText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
    lineHeight: 16,
  },
  paymentInfo: {
    alignItems: 'flex-end',
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  codBadge: {
    backgroundColor: '#FFF3E0',
  },
  onlineBadge: {
    backgroundColor: '#E8F5E8',
  },
  paymentText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  codText: {
    color: '#E65100',
  },
  onlineText: {
    color: '#2E7D32',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
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
  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6,
  },
  readyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6,
  },
  waitingText: {
    color: '#4CAF50',
    fontWeight: '500',
    fontSize: 14,
  },
  completedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 6,
  },
  completedText: {
    color: '#9E9E9E',
    fontWeight: '500',
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

export default ShopOrderManagementScreen;
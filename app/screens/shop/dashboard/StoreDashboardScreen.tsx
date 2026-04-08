import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import Redux actions
import {
  fetchDashboardData,
  toggleShopStatus,
  fetchPendingOrders,
  clearError,
} from '@store/slices/shopSlice';
import { NotificationRequest } from '@/components/common/NotificationRequest';

interface RootState {
  shop: {
    isActive: boolean;
    todayRevenue: number;
    totalOrders: number;
    pendingOrders: any[];
    completedOrders: number;
    rating: number;
    performance: number;
    stats: {
      ordersToday: number;
      avgOrderValue: number;
      topSellingProduct: string;
    };
    loading: boolean;
    error: string | null;
    shopStatus: string; // 'approved', 'pending', 'rejected', etc.
  };
}

const StoreDashboardScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Get shop state from Redux
  const {
    isActive,
    todayRevenue,
    totalOrders,
    pendingOrders,
    completedOrders,
    rating,
    performance,
    stats,
    loading,
    error,
    shopStatus,
  } = useSelector((state: RootState) => state.shop);

  const [refreshing, setRefreshing] = useState(false);
  const [statusToggling, setStatusToggling] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      NotificationRequest();
    }, 2000);
  },[]);

  useEffect(() => {
    if (error) {
      showErrorAlert(error);
    }
  }, [error]);

  const loadDashboardData = async () => {
    try {
      await dispatch(fetchDashboardData()).unwrap();
      await dispatch(fetchPendingOrders()).unwrap();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showErrorAlert('Failed to load dashboard data. Please check your internet connection and try again.');
    }
  };

  const showErrorAlert = (errorMessage: string) => {
    Alert.alert(
      'Error',
      errorMessage,
      [
        { 
          text: 'Try Again', 
          onPress: () => {
            dispatch(clearError());
            loadDashboardData();
          }
        },
        { 
          text: 'OK', 
          onPress: () => dispatch(clearError()),
          style: 'cancel'
        }
      ]
    );
  };

  const showSuccessAlert = (message: string) => {
    Alert.alert(
      'Success',
      message,
      [{ text: 'OK' }]
    );
  };

  const handleToggleShopStatus = async () => {
    // Prevent multiple rapid toggles
    if (statusToggling) return;

    // Check if shop is approved before allowing toggle
    if (shopStatus !== 'approved') {
      const statusMessages = {
        'pending': 'Your shop is still under review. You\'ll be notified once it\'s approved.',
        'rejected': 'Your shop application was rejected. Please contact our support team for assistance.',
        'suspended': 'Your shop is currently suspended. Please contact support to resolve this issue.',
      };

      const message = statusMessages[shopStatus] || 'Your shop must be approved before you can change its status.';
      
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
      const result = await dispatch(toggleShopStatus()).unwrap();
      
      // Show success message
      showSuccessAlert(result.message || `Your shop is now ${result.is_active ? 'Open' : 'Closed'}`);
      
    } catch (error: any) {
      console.error('Toggle shop status error:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to update shop status. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.status === 403) {
        errorMessage = 'You are not authorized to perform this action.';
      } else if (error?.response?.status === 422) {
        errorMessage = error.response.data?.message || 'Your shop must be approved before you can change its status.';
      } else if (error?.response?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later.';
      }

      Alert.alert(
        'Update Failed',
        errorMessage,
        [
          { 
            text: 'Retry', 
            onPress: () => handleToggleShopStatus()
          },
          { 
            text: 'Cancel', 
            style: 'cancel'
          }
        ]
      );
    } finally {
      setStatusToggling(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDashboardData();
    } catch (error) {
      showErrorAlert('Failed to refresh data. Please check your connection.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleNavigationPress = (screenName: string, params?: any) => {
    // Replace with actual navigation when screens are implemented
    if (screenName == 'ShopSettingsScereen' || screenName == 'StoreInventoryTab' || screenName == 'StoreEarningsTab' || screenName == 'ShopReportsScreen') {
      navigation.navigate(screenName, params);
    }else{
      Alert.alert('Navigation', `${screenName} screen not implemented yet`);
    }
  };

  const handleOrderPress = (orderId: string) => {
    handleNavigationPress('ShopOrderDetails', { orderId });
  };

  // Helper function to get status color and message
  const getStatusInfo = () => {
    if (shopStatus !== 'approved') {
      return {
        color: '#FF9800',
        message: 'Shop approval pending',
        canToggle: false
      };
    }
    
    return {
      color: isActive ? '#4CAF50' : '#757575',
      message: isActive ? 'Shop is Open' : 'Shop is Closed',
      canToggle: true
    };
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shop Dashboard</Text>
        <Text style={styles.headerSubtitle}>Manage your liquor store</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Shop Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusLeft}>
              <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
                {statusInfo.message}
              </Text>
              <Text style={styles.statusSubtitle}>
                {statusInfo.canToggle
                  ? (isActive 
                      ? 'Ready to receive orders' 
                      : 'Turn on to start receiving orders')
                  : 'Waiting for approval to start operations'
                }
              </Text>
              
              {shopStatus !== 'approved' && (
                <Text style={styles.approvalMessage}>
                  {shopStatus === 'pending' && '⏳ Under review - We\'ll notify you soon'}
                  {shopStatus === 'rejected' && '❌ Application rejected - Contact support'}
                  {shopStatus === 'suspended' && '⚠️ Account suspended - Contact support'}
                </Text>
              )}
            </View>
            
            <View style={styles.statusRight}>
              {statusToggling ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Switch
                  value={isActive && statusInfo.canToggle}
                  onValueChange={handleToggleShopStatus}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor={isActive ? '#fff' : '#f4f3f4'}
                  ios_backgroundColor="#767577"
                  disabled={loading || !statusInfo.canToggle || statusToggling}
                />
              )}
            </View>
          </View>
          
          {isActive && statusInfo.canToggle && (
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Currently accepting orders</Text>
            </View>
          )}
        </View>

        {/* Show error banner if there's a persistent error */}
        {error && (
          <View style={styles.errorBanner}>
            <Icon name="error-outline" size={20} color="#F44336" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.errorDismiss}
              onPress={() => dispatch(clearError())}
            >
              <Icon name="close" size={18} color="#F44336" />
            </TouchableOpacity>
          </View>
        )}

        {/* Loading indicator for main content */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading dashboard data...</Text>
          </View>
        )}

        {/* Today's Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Today's Performance</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.revenueCard]}>
              <View style={styles.statIconContainer}>
                <Icon name="attach-money" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statValue}>₹{todayRevenue?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Today's Revenue</Text>
            </View>
            
            <View style={[styles.statCard, styles.ordersCard]}>
              <View style={styles.statIconContainer}>
                <Icon name="shopping-cart" size={24} color="#2196F3" />
              </View>
              <Text style={styles.statValue}>{stats?.ordersToday || totalOrders || 0}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>
            
            <View style={[styles.statCard, styles.pendingCard]}>
              <View style={styles.statIconContainer}>
                <Icon name="hourglass-empty" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statValue}>{pendingOrders?.length || 0}</Text>
              <Text style={styles.statLabel}>Pending Orders</Text>
            </View>
            
            <View style={[styles.statCard, styles.ratingCard]}>
              <View style={styles.statIconContainer}>
                <Icon name="star" size={24} color="#FFC107" />
              </View>
              <Text style={styles.statValue}>{rating?.toFixed(1) || '0.0'}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </View>

        {/* Pending Orders */}
        <View style={styles.ordersSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Orders</Text>
            <TouchableOpacity 
              onPress={() => handleNavigationPress('ShopOrders', { status: 'pending' })}
              activeOpacity={0.7}
            >
              <Text style={styles.seeAllText}>See All ({pendingOrders?.length || 0})</Text>
            </TouchableOpacity>
          </View>
          
          {pendingOrders && pendingOrders.length > 0 ? (
            pendingOrders.slice(0, 3).map((order) => (
              <TouchableOpacity 
                key={order.id} 
                style={styles.orderCard}
                onPress={() => handleOrderPress(order.id)}
                activeOpacity={0.8}
              >
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>#{order.order_number}</Text>
                  <Text style={styles.orderAmount}>₹{order.total_amount?.toLocaleString()}</Text>
                </View>
                <View style={styles.orderDetails}>
                  <View style={styles.customerInfo}>
                    <Icon name="person" size={16} color="#666" />
                    <Text style={styles.customerName}>{order.customer?.name}</Text>
                  </View>
                  <Text style={styles.orderTime}>{order.created_at}</Text>
                </View>
                <View style={styles.orderFooter}>
                  <View style={styles.orderItems}>
                    <Icon name="shopping-bag" size={14} color="#666" />
                    <Text style={styles.itemsText}>
                      {order.items?.length || 0} item(s)
                    </Text>
                  </View>
                  <View style={[
                    styles.paymentBadge,
                    order.payment_method === 'cash_on_delivery' ? styles.codBadge : styles.onlineBadge
                  ]}>
                    <Text style={[
                      styles.paymentText,
                      order.payment_method === 'cash_on_delivery' ? styles.codText : styles.onlineText
                    ]}>
                      {order.payment_method === 'cash_on_delivery' ? 'COD' : 'PAID'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyOrders}>
              <Icon name="inbox" size={48} color="#ccc" />
              <Text style={styles.emptyText}>No pending orders</Text>
              <Text style={styles.emptySubtext}>New orders will appear here</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.inventoryAction]} 
              onPress={() => handleNavigationPress('StoreInventoryTab')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="inventory" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Inventory</Text>
              <Text style={styles.actionSubtext}>Manage products</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.earningsAction]} 
              onPress={() => handleNavigationPress('StoreEarningsTab')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="account-balance-wallet" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText}>Earnings</Text>
              <Text style={styles.actionSubtext}>View reports</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.reportsAction]} 
              onPress={() => handleNavigationPress('ShopReportsScreen')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="bar-chart" size={24} color="#FF9800" />
              </View>
              <Text style={styles.actionText}>Reports</Text>
              <Text style={styles.actionSubtext}>Analytics</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.settingsAction]} 
              onPress={() => handleNavigationPress('ShopSettingsScereen')}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="settings" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
              <Text style={styles.actionSubtext}>Configure</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Performance Summary */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.performanceCard}>
            <View style={styles.performanceHeader}>
              <Text style={styles.performanceTitle}>Today's Performance</Text>
              <Text style={styles.performanceValue}>{performance || 0}%</Text>
            </View>
            <View style={styles.performanceMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Completed Orders</Text>
                <Text style={styles.metricValue}>{completedOrders || 0}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Avg. Order Value</Text>
                <Text style={styles.metricValue}>
                  ₹{stats?.avgOrderValue || (totalOrders > 0 ? Math.round((todayRevenue || 0) / totalOrders) : 0)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Top Product</Text>
                <Text style={styles.metricValue}>{stats?.topSellingProduct || 'N/A'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flex: 1,
  },
  statusRight: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  approvalMessage: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 4,
    fontStyle: 'italic',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  onlineText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#D32F2F',
    marginLeft: 8,
  },
  errorDismiss: {
    padding: 4,
  },
  loadingContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  revenueCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  ordersCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  ratingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  ordersSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 16,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  orderTime: {
    fontSize: 12,
    color: '#999',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderItems: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
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
  },
  codText: {
    color: '#E65100',
  },
  onlineText: {
    color: '#2E7D32',
  },
  emptyOrders: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  inventoryAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  earningsAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  reportsAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  settingsAction: {
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  actionSubtext: {
    fontSize: 12,
    color: '#666',
  },
  performanceSection: {
    marginBottom: 24,
  },
  performanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  performanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  performanceMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default StoreDashboardScreen;
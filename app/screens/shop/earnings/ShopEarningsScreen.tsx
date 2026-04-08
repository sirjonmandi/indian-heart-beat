import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Alert,
  Platform, PermissionsAndroid
} from 'react-native';
import RNFS from 'react-native-fs';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, BarChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authAPI } from '@/services/api/authAPI';
import { ApiError, ApiResponse } from '@/services/api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '@/store/slices/authSlice';
import { Constants } from '@/utils/constants';
import { useNavigation } from '@react-navigation/native';

// TODO: Uncomment when shop slice actions are ready
import { fetchEarningsData, fetchSettlementsData, downloadSettments } from '@store/slices/shopSlice';

const { width } = Dimensions.get('window');

// DUMMY DATA for testing
const dummyEarningsData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      data: [1200, 1800, 2200, 1500, 2800, 3200, 2900],
      strokeWidth: 3,
    },
  ],
};

const dummySettlements = [
  {
    id: '1',
    settlementDate: '2024-06-10',
    amount: 45500,
    orderCount: 67,
    status: 'completed',
  },
  {
    id: '2',
    settlementDate: '2024-06-03',
    amount: 38200,
    orderCount: 52,
    status: 'completed',
  },
  {
    id: '3',
    settlementDate: '2024-05-27',
    amount: 42800,
    orderCount: 61,
    status: 'pending',
  },
  {
    id: '4',
    settlementDate: '2024-05-20',
    amount: 51200,
    orderCount: 74,
    status: 'completed',
  },
];

const dummyShopEarnings = {
  earningsData: dummyEarningsData,
  settlements: dummySettlements,
  totalEarnings: 245000,
  thisMonthEarnings: 67500,
  pendingSettlement: 42800,
  loading: false,
};

interface RootState {
  shop?: typeof dummyShopEarnings;
}

const ShopEarningsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  // Safely get shop state with fallbacks
  const shopState = useSelector((state: RootState) => state.shop);
  const { 
    earningsData = dummyEarningsData,
    settlements = dummySettlements,
    totalEarnings = 245000,
    thisMonthEarnings = 67500,
    pendingSettlement = 42800,
    // loading = false
  } = shopState || {};

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading,setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadEarningsData();
    loadSettlements();
  }, [selectedPeriod]);

  const loadEarningsData = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchEarningsData({ period: selectedPeriod }) as any).unwrap();
      console.log('📊 Loading earnings data (DUMMY MODE) for period:', selectedPeriod);
    } catch (error) {
      console.error('Failed to load earnings data:', error);
    }
  };

  const loadSettlements = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchSettlementsData() as any).unwrap();
      console.log('💰 Loading settlements (DUMMY MODE)');
    } catch (error) {
      console.error('Failed to load settlements:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadEarningsData(), loadSettlements()]);
    setTimeout(() => setRefreshing(false), 1000); // Simulate loading
  };


  const handleDownloadStatement = async() => {
    // Alert.alert(
    //   'Download Statement',
    //   'Statement download functionality will be available soon!',
    //   [{ text: 'OK' }]
    // );
    setLoading(true);
    try {
      await dispatch(downloadSettments() as any).unwrap();
    } catch (error) {
      console.error(JSON.stringify(error,null,2));
    } finally {
        setLoading(false);
    }
  };

  const handleSettlementHelp = () => {
    Alert.alert(
      'Settlement Help',
      'Settlements are processed weekly on Mondays. Pending settlements will be transferred to your registered bank account within 2-3 business days.',
      [{ text: 'OK' }]
    );
  };

  const handleBankDetails = () => {
    navigation.navigate(Constants.SCREENS.STORE_BANK_DETAILS);
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await new Promise((resolve, reject)=>{
                authAPI.logout()
                .then(async(res:ApiResponse)=>{
                  await AsyncStorage.removeItem('authToken');

                  dispatch(logout());
                  resolve(res) 
                })
                .catch((error:ApiError)=>{
                  console.error(error);
                  reject(error);
                })
              })
            } catch (error:any) {
              console.error('Logout Error ' + error);
              Alert.alert('Logout', error);              
            }
          },
        },
      ]
    );
  };

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  const getAverageEarnings = () => {
    if (!earningsData.datasets[0].data.length) return 0;
    const sum = earningsData.datasets[0].data.reduce((a, b) => a + b, 0);
    return Math.round(sum / earningsData.datasets[0].data.length);
  };

  const getHighestEarning = () => {
    if (!earningsData.datasets[0].data.length) return 0;
    return Math.max(...earningsData.datasets[0].data);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings & Settlements</Text>
        <Text style={styles.headerSubtitle}>Track your revenue and payments</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Earnings Summary */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Earnings Overview</Text>
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, styles.totalCard]}>
              <View style={styles.summaryIconContainer}>
                <Icon name="account-balance-wallet" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
              <Text style={[styles.summaryValue, styles.totalValue]}>₹{totalEarnings.toLocaleString()}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, styles.smallCard]}>
                <Text style={styles.summaryLabel}>This Month</Text>
                <Text style={styles.summaryValue}>₹{thisMonthEarnings.toLocaleString()}</Text>
              </View>
              
              <View style={[styles.summaryCard, styles.smallCard, styles.pendingCard]}>
                <Text style={styles.summaryLabel}>Pending Settlement</Text>
                <Text style={[styles.summaryValue, styles.pendingValue]}>₹{pendingSettlement.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodSection}>
          <Text style={styles.sectionTitle}>Performance Analysis</Text>
          <View style={styles.periodSelector}>
            {periods.map((period) => (
              <TouchableOpacity
                key={period.key}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.key && styles.activePeriodButton,
                ]}
                onPress={() => setSelectedPeriod(period.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.key && styles.activePeriodButtonText,
                  ]}
                >
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Earnings Chart */}
        {earningsData && (
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Earnings Trend - {selectedPeriod}</Text>
              <View style={styles.chartStats}>
                <View style={styles.chartStat}>
                  <Text style={styles.chartStatLabel}>Average</Text>
                  <Text style={styles.chartStatValue}>₹{getAverageEarnings()}</Text>
                </View>
                <View style={styles.chartStat}>
                  <Text style={styles.chartStatLabel}>Highest</Text>
                  <Text style={styles.chartStatValue}>₹{getHighestEarning()}</Text>
                </View>
              </View>
            </View>
            <LineChart
              data={earningsData}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Recent Settlements */}
        <View style={styles.settlementsSection}>
          {settlements && settlements.length>0 &&
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Settlements</Text>
            <TouchableOpacity onPress={handleDownloadStatement}>
              <Text style={styles.downloadText}>Download All</Text>
            </TouchableOpacity>
          </View>}
          
          {settlements && settlements.length>0 &&
           settlements.map((settlement) => (
            <View key={settlement.id} style={styles.settlementCard}>
              <View style={styles.settlementHeader}>
                <View style={styles.settlementDateContainer}>
                  <Icon name="event" size={16} color="#666" />
                  <Text style={styles.settlementDate}>
                    {settlement.settlementDate}
                  </Text>
                </View>
                <Text style={styles.settlementAmount}>₹{settlement.amount.toLocaleString()}</Text>
              </View>
              <View style={styles.settlementDetails}>
                <View style={styles.settlementInfo}>
                  <Icon name="shopping-cart" size={14} color="#666" />
                  <Text style={styles.settlementOrders}>
                    {settlement.orderCount} orders
                  </Text>
                </View>
                <View style={[
                  styles.settlementStatus,
                  settlement.status === 'completed' && styles.completedStatus,
                  settlement.status === 'pending' && styles.pendingStatus,
                ]}>
                  <Icon 
                    name={settlement.status === 'completed' ? 'check-circle' : 'schedule'} 
                    size={12} 
                    color={settlement.status === 'completed' ? '#4CAF50' : '#FF9800'} 
                  />
                  <Text style={[
                    styles.statusText,
                    settlement.status === 'completed' && styles.completedText,
                    settlement.status === 'pending' && styles.pendingText,
                  ]}>
                    {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Settlement Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="info" size={20} color="#2196F3" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Settlement Schedule</Text>
              <Text style={styles.infoText}>
                Settlements are processed weekly on Mondays. Funds are transferred to your registered bank account within 2-3 business days.
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDownloadStatement}
              activeOpacity={0.8}
              disabled={loading}
            >
              <View style={styles.actionIconContainer}>
                <Icon name={ loading ? 'access-time' : 'file-download' } size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>{loading ? 'Loading Statement...' :'Download Statement'}</Text>
              <Text style={styles.actionSubtext}>Get detailed earnings report</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleSettlementHelp}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="help" size={24} color="#2196F3" />
              </View>
              <Text style={styles.actionText}>Settlement Help</Text>
              <Text style={styles.actionSubtext}>Learn about payments</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.quickActions,{marginTop:15}]}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleBankDetails}
              activeOpacity={0.8}
            >
              <View style={styles.actionIconContainer}>
                <Icon name="account-balance" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.actionText}>Bank Details</Text>
              <Text style={styles.actionSubtext}>Get and update details</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Icon name="logout" size={20} color="#F44336" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
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
  summarySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryContainer: {
    gap: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  totalCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    alignItems: 'center',
    paddingVertical: 24,
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  smallCard: {
    flex: 1,
    alignItems: 'center',
  },
  pendingCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  totalValue: {
    fontSize: 28,
    color: '#4CAF50',
  },
  pendingValue: {
    color: '#FF9800',
  },
  periodSection: {
    marginBottom: 24,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodButton: {
    backgroundColor: '#4CAF50',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartHeader: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  chartStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingVertical: 8,
  },
  chartStat: {
    alignItems: 'center',
  },
  chartStatLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  chartStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  chart: {
    borderRadius: 16,
  },
  settlementsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  downloadText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  settlementCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settlementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settlementDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settlementDate: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginLeft: 6,
  },
  settlementAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  settlementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settlementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settlementOrders: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  settlementStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedStatus: {
    backgroundColor: '#E8F5E8',
  },
  pendingStatus: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  completedText: {
    color: '#4CAF50',
  },
  pendingText: {
    color: '#FF9800',
  },
  infoSection: {
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
});

export default ShopEarningsScreen;
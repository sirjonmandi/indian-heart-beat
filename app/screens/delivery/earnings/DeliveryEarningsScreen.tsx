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
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TODO: Uncomment when these actions are added to delivery slice
import { 
  fetchEarningsData, 
  fetchPayoutHistory, 
  requestPayout 
} from '@store/slices/deliverySlice';

const { width } = Dimensions.get('window');

// DUMMY DATA for testing
const dummyEarningsData = {
  baseEarnings: 1200,
  distanceBonus: 300,
  timeBonus: 150,
  tips: 85,
  chartData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [120, 150, 180, 200, 250, 300, 280],
        strokeWidth: 2,
      },
    ],
  },
};

const dummyPayoutHistory = [
  {
    id: '1',
    payoutDate: '2024-06-10',
    amount: 2500,
    deliveryCount: 45,
    status: 'completed',
  },
  {
    id: '2',
    payoutDate: '2024-06-03',
    amount: 1800,
    deliveryCount: 32,
    status: 'completed',
  },
  {
    id: '3',
    payoutDate: '2024-05-27',
    amount: 2200,
    deliveryCount: 38,
    status: 'pending',
  },
];

interface RootState {
  delivery: {
    earningsData?: typeof dummyEarningsData;
    todayEarnings: number;
    weekEarnings: number;
    monthEarnings: number;
    totalEarnings: number;
    pendingPayout: number;
    payoutHistory: typeof dummyPayoutHistory;
    loading: boolean;
  };
}

const DeliveryEarningsScreen: React.FC = () => {
  const dispatch = useDispatch();
  
  // Safely get delivery state with fallbacks
  const deliveryState = useSelector((state: RootState) => state.delivery);
  const { 
    earningsData = dummyEarningsData,
    todayEarnings = 0,
    weekEarnings = 0,
    monthEarnings = 0,
    totalEarnings = 0,
    pendingPayout = 350,
    payoutHistory = dummyPayoutHistory,
    loading = false
  } = deliveryState || {};

  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEarningsData();
    loadPayoutHistory();
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

  const loadPayoutHistory = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchPayoutHistory() as any).unwrap();
      console.log('📋 Loading payout history (DUMMY MODE)');
    } catch (error) {
      console.error('Failed to load payout history:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadEarningsData(), loadPayoutHistory()]);
    setTimeout(() => setRefreshing(false), 1000); // Simulate loading
  };

  const handleRequestPayout = () => {
    if (pendingPayout < 100) {
      Alert.alert(
        'Minimum Payout',
        'Minimum payout amount is ₹100. Keep delivering to reach the minimum!'
      );
      return;
    }

    Alert.alert(
      'Request Payout',
      `Request payout of ₹${pendingPayout}? Amount will be transferred to your registered bank account.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request',
          onPress: async () => {
            try {
              // TODO: Uncomment when action is ready
              await dispatch(requestPayout() as any).unwrap();
              console.log('💰 Payout requested (DUMMY MODE):', pendingPayout);
            } catch (error) {
              Alert.alert('Error', error?.message || 'Failed to request payout. Please try again.');
            } finally {
              loadPayoutHistory();
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
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#2196F3',
    },
  };

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  const earningsBreakdown = [
    {
      name: 'Base Earnings',
      amount: earningsData?.baseEarnings || 0,
      color: '#2196F3',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Distance Bonus',
      amount: earningsData?.distanceBonus || 0,
      color: '#4CAF50',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Time Bonus',
      amount: earningsData?.timeBonus || 0,
      color: '#FF9800',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
    {
      name: 'Tips',
      amount: earningsData?.tips || 0,
      color: '#9C27B0',
      legendFontColor: '#333',
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Earnings help information would go here')}>
          <Icon name="help-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Earnings Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Today</Text>
            <Text style={styles.summaryValue}>₹{todayEarnings}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryValue}>₹{weekEarnings}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>₹{monthEarnings}</Text>
          </View>
          
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>₹{totalEarnings}</Text>
          </View>
        </View>

        {/* Pending Payout */}
        <View style={styles.payoutCard}>
          <View style={styles.payoutHeader}>
            <View>
              <Text style={styles.payoutLabel}>Available for Payout</Text>
              <Text style={styles.payoutAmount}>₹{pendingPayout}</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.payoutButton,
                pendingPayout < 100 && styles.disabledButton
              ]}
              onPress={handleRequestPayout}
              disabled={pendingPayout < 100}
            >
              <Text style={[
                styles.payoutButtonText,
                pendingPayout < 100 && styles.disabledButtonText
              ]}>
                Request Payout
              </Text>
            </TouchableOpacity>
          </View>
          {pendingPayout < 100 && (
            <Text style={styles.minPayoutText}>
              Minimum payout amount: ₹100
            </Text>
          )}
        </View>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                selectedPeriod === period.key && styles.activePeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period.key)}
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

        {/* Earnings Chart */}
        {earningsData?.chartData && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Earnings Trend</Text>
            <LineChart
              data={earningsData.chartData}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Earnings Breakdown */}
        <View style={styles.breakdownContainer}>
          <Text style={styles.sectionTitle}>Earnings Breakdown</Text>
          <View style={styles.breakdownGrid}>
            {earningsBreakdown.map((item, index) => (
              <View key={index} style={styles.breakdownItem}>
                <View style={[styles.breakdownColor, { backgroundColor: item.color }]} />
                <View style={styles.breakdownInfo}>
                  <Text style={styles.breakdownName}>{item.name}</Text>
                  <Text style={styles.breakdownAmount}>₹{item.amount}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Payouts */}
        { payoutHistory && payoutHistory.length > 0 && (
          <View style={styles.historyContainer}>
            <Text style={styles.sectionTitle}>Recent Payouts</Text>
            {payoutHistory.map((payout) => (
              <View key={payout.id} style={styles.payoutHistoryItem}>
                <View style={styles.payoutHistoryHeader}>
                  <Text style={styles.payoutHistoryDate}>
                    {new Date(payout.requested_at ?? payout.payoutDate).toLocaleDateString()}
                  </Text>
                  <Text style={styles.payoutHistoryAmount}>₹{payout.amount}</Text>
                </View>
                <View style={styles.payoutHistoryDetails}>
                  <Text style={styles.payoutHistoryDeliveries}>
                    {payout.total_deliveries || payout.deliveryCount} deliveries
                  </Text>
                  <Text style={[
                    styles.payoutHistoryStatus,
                    payout.status === 'completed' && styles.completedStatus,
                    payout.status === 'pending' && styles.pendingStatus,
                  ]}>
                    {payout.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Earnings Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>Maximize Your Earnings</Text>
          <View style={styles.tipItem}>
            <Icon name="access-time" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Work during peak hours (6-9 PM) for higher demand
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="star" size={20} color="#FFC107" />
            <Text style={styles.tipText}>
              Maintain high ratings for performance bonuses
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Icon name="speed" size={20} color="#2196F3" />
            <Text style={styles.tipText}>
              Complete deliveries quickly for time bonuses
            </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  payoutCard: {
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
  payoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  payoutLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  payoutAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  payoutButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  payoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  disabledButtonText: {
    color: '#999',
  },
  minPayoutText: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: '#2196F3',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
  },
  breakdownContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  breakdownGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
  },
  breakdownColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  breakdownAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  historyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  payoutHistoryItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  payoutHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  payoutHistoryDate: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  payoutHistoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  payoutHistoryDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payoutHistoryDeliveries: {
    fontSize: 12,
    color: '#666',
  },
  payoutHistoryStatus: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  completedStatus: {
    backgroundColor: '#E8F5E8',
    color: '#4CAF50',
  },
  pendingStatus: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default DeliveryEarningsScreen;
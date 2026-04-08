import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { fetchShopReports } from '@/store/slices/shopSlice';
import { RootState } from '@/store/types';

const { width } = Dimensions.get('window');
const dummySalesData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{ data: [5000, 8000, 7500, 9000, 12000, 15000] }],
};
const dummyTopProducts = {
  labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
  datasets: [{ data: [200, 150, 100, 80, 50] }],
};
const ShopReportsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { reports = { salesData: dummySalesData, topProducts: dummyTopProducts }, loading } = useSelector((state: RootState) => state.shop);

  const [selectedPeriod, setSelectedPeriod] = useState('week');

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    try {
      await dispatch(fetchShopReports({ period: selectedPeriod })).unwrap();
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: { borderRadius: 16 },
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Reports & Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
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

        {/* Sales Overview */}
        {reports?.salesData && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Sales Overview</Text>
            <LineChart
              data={reports.salesData}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Top Products */}
        {reports?.topProducts && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Top Products</Text>
            <BarChart
              data={reports.topProducts}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>
        )}

        {/* Order Status Distribution */}
        {reports?.orderStatus && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Order Status Distribution</Text>
            <PieChart
              data={reports.orderStatus}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        )}

        {/* Key Metrics */}
         <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricCardInner, styles.revenueCard]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: '#34C75915' }]}>
                    <Icon name="account-balance-wallet" size={20} color="#34C759" />
                  </View>
                  <View style={[styles.trendBadge, styles.trendUp]}>
                    <Icon name="trending-up" size={12} color="#34C759" />
                    <Text style={[styles.trendText, { color: '#34C759' }]}>12%</Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{reports?.totalRevenue || '₹0'}</Text>
                <Text style={styles.metricLabel}>Total Revenue</Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricCardInner, styles.ordersCard]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: '#007AFF15' }]}>
                    <Icon name="shopping-cart" size={20} color="#007AFF" />
                  </View>
                  <View style={[styles.trendBadge, styles.trendUp]}>
                    <Icon name="trending-up" size={12} color="#34C759" />
                    <Text style={[styles.trendText, { color: '#34C759' }]}>8%</Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{reports?.totalOrders || '0'}</Text>
                <Text style={styles.metricLabel}>Total Orders</Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricCardInner, styles.avgCard]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: '#FF950015' }]}>
                    <Icon name="attach-money" size={20} color="#FF9500" />
                  </View>
                  <View style={[styles.trendBadge, styles.trendDown]}>
                    <Icon name="trending-down" size={12} color="#FF3B30" />
                    <Text style={[styles.trendText, { color: '#FF3B30' }]}>3%</Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{reports?.averageOrderValue || '₹0'}</Text>
                <Text style={styles.metricLabel}>Avg Order Value</Text>
              </View>
            </View>
            <View style={styles.metricCard}>
              <View style={[styles.metricCardInner, styles.ratingCard]}>
                <View style={styles.metricHeader}>
                  <View style={[styles.iconBadge, { backgroundColor: '#FFD60A15' }]}>
                    <Icon name="star" size={20} color="#FFD60A" />
                  </View>
                  <View style={[styles.trendBadge, styles.trendNeutral]}>
                    <Icon name="remove" size={12} color="#8E8E93" />
                    <Text style={[styles.trendText, { color: '#8E8E93' }]}>0%</Text>
                  </View>
                </View>
                <Text style={styles.metricValue}>{reports?.customerRatings || '0.0'}</Text>
                <Text style={styles.metricLabel}>Customer Rating</Text>
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
    backgroundColor: '#f2f2f7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#4CAF50',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#c6c6c8',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
    letterSpacing: -0.4,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 10,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activePeriodButton: {
    backgroundColor: '#4CAF50',
  },
  periodButtonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#8e8e93',
    letterSpacing: -0.2,
  },
  activePeriodButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  chartContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
    letterSpacing: -0.4,
  },
  chart: {
    borderRadius: 8,
    marginVertical: 8,
  },
  metricsContainer: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    letterSpacing: -0.4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  metricCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  metricCardInner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  revenueCard: {
    borderTopWidth: 3,
    borderTopColor: '#34C759',
  },
  ordersCard: {
    borderTopWidth: 3,
    borderTopColor: '#007AFF',
  },
  avgCard: {
    borderTopWidth: 3,
    borderTopColor: '#FF9500',
  },
  ratingCard: {
    borderTopWidth: 3,
    borderTopColor: '#FFD60A',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendUp: {
    backgroundColor: '#34C75910',
  },
  trendDown: {
    backgroundColor: '#FF3B3010',
  },
  trendNeutral: {
    backgroundColor: '#8E8E9310',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 2,
    letterSpacing: -0.2,
  },
  metricValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    letterSpacing: -0.8,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6e6e73',
    letterSpacing: -0.08,
  },
});

export default ShopReportsScreen;
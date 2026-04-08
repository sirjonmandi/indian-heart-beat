import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPerformanceData } from '@/store/slices/deliverySlice';

export default function PerformanceReportScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const dispatch = useDispatch();

  const deliveryState = useSelector((state:{delivery:any}) => state.delivery);
  const { performanceData: storedPerformanceData } = deliveryState;
  
  useEffect(() =>{
    loadPerformanceData();
  },[selectedPeriod]);

  useEffect(()=>{
    if(storedPerformanceData){
      const { stats, improvements } = storedPerformanceData;
      setStats([
        { label: 'Total Deliveries', value: stats.total_deliveries ?? 0, icon: '📦' },
        { label: 'On-Time Delivery', value: `${stats.on_time_delivery_rate ?? 0}`, icon: '⏰' },
        { label: 'Average Rating', value: stats.average_rating, icon: '⭐' },
        { label: 'Average Delivery Time', value: `${stats.average_delivery_time ?? 0} mins`, icon: '⏱️' },
        { label: 'Acceptance Rate', value: `${stats.acceptance_rate ?? 0} %`, icon: '🚚' },
        { label: 'Completion Rate', value: `${stats.completion_rate ?? 0} %`, icon: '✅' },
      ]);

      setMetrics(improvements);

    }
  },[storedPerformanceData]);

  console.log('=================StoredPerformanceData===================');
  console.log(JSON.stringify(storedPerformanceData,null,2));
  console.log('====================================');

  const performanceData = {
    totalDeliveries: 142,
    completedOnTime: 135,
    averageRating: 4.8,
    totalEarnings: '₹12,450',
    acceptanceRate: 95,
    cancellationRate: 2,
  };

  // const stats = [
  //   { label: 'Total Deliveries', value: storedPerformanceData?.stats.totalDeliveries ?? 0, icon: '📦' },
  //   { label: 'On-Time Delivery', value: `${storedPerformanceData?.stats.on_time_delivery_rate ?? 0}/${performanceData.totalDeliveries}`, icon: '⏰' },
  //   { label: 'Average Rating', value: performanceData.averageRating, icon: '⭐' },
  //   { label: 'Total Earnings', value: performanceData.totalEarnings, icon: '💰' },
  // ];

  const [stats, setStats] = useState([
    { label: 'Total Deliveries', value: performanceData.totalDeliveries, icon: '📦' },
    { label: 'On-Time Delivery', value: `${performanceData.completedOnTime}/${performanceData.totalDeliveries}`, icon: '⏰' },
    { label: 'Average Rating', value: performanceData.averageRating, icon: '⭐' },
    { label: 'Total Earnings', value: performanceData.totalEarnings, icon: '💰' },
  ]);
  const [metrics, setMetrics] = useState([
      {area: "", current: "", suggestion: "", target: ""},
  ]);
  // const metrics = [
  //   { label: 'Acceptance Rate', value: `${performanceData.acceptanceRate}%`, color: '#10B981', status: 'Excellent' },
  //   { label: 'Cancellation Rate', value: `${performanceData.cancellationRate}%`, color: '#10B981', status: 'Good' },
  //   { label: 'Customer Rating', value: `${performanceData.averageRating}/5.0`, color: '#10B981', status: 'Excellent' },
  // ];

  const loadPerformanceData = () =>{
    dispatch(fetchPerformanceData(selectedPeriod) as any).unwrap;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Performance Report</Text>
            <Text style={styles.partnerCode}>
              Track your delivery performance and earnings
            </Text>
          </View>
        </View>

        {/* Period Filter */}
        <View style={styles.periodContainer}>
          {['week', 'month', 'year'].map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.periodButtonActive,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === period && styles.periodTextActive,
                ]}
              >
                {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        {stats.length > 0 && (
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Performance Metrics */}
        {metrics.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Performance Metrics</Text>
            {metrics.map((metric, index) => (
              <View key={index} style={styles.metricRow}>
                <View style={styles.metricLeft}>
                  <Text style={styles.metricLabel}>{metric.area}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={[styles.statusText, { color: '#10B981'}]}>
                      {metric.suggestion}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.metricValue, { color: '#10B981' }]}>
                  {metric.current}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {/* <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Order Completed</Text>
              <Text style={styles.activityTime}>2 hours ago • ₹180</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>5 Star Rating Received</Text>
              <Text style={styles.activityTime}>5 hours ago</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityDot} />
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Order Completed</Text>
              <Text style={styles.activityTime}>7 hours ago • ₹225</Text>
            </View>
          </View>
        </View> */}

        {/* Footer */}
        <Text style={styles.footer}>
          Keep up the great work! Your performance is excellent.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  profileHeader: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  partnerCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  periodContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  periodButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  metricLeft: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginTop: 6,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  footer: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
// ===============================================
// PRICE SUMMARY COMPONENT
// ===============================================

import { Colors } from '@/styles/colors';
import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PriceSummaryData {
  subtotal: number;
  cartConditions:any;
  // discount: number;
  // packagingCharges: number;
  // liquorHandlingCharge: number;
  // deliveryCharge: number;
  total: number;
  totalSavings: number;
}

interface PriceSummaryProps {
  summary: PriceSummaryData;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ summary }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Price Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Sub Total</Text>
        <Text style={styles.summaryValue}>₹{summary.subtotal}</Text>
      </View>

      <FlatList
        data={summary.cartConditions}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{item.name}</Text>
            <Text style={styles.summaryValue}>₹{item.amount}</Text>
          </View>
        )}
      />
      
      {/* <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Discount (5%)</Text>
        <Text style={[styles.summaryValue, styles.discountValue]}>
          - ₹{summary.discount}
        </Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Packaging Charges</Text>
        <Text style={styles.summaryValue}>₹{summary.packagingCharges}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Liquor Handling Charge</Text>
        <Text style={styles.summaryValue}>₹{summary.liquorHandlingCharge}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Charge</Text>
        <Text style={styles.summaryValue}>₹{summary.deliveryCharge}</Text>
      </View> */}
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total Amount</Text>
        <Text style={styles.totalValue}>₹{summary.total}</Text>
      </View>
      
      {summary.totalSavings > 0 && (
        <View style={styles.savingsContainer}>
          <Icon name="savings" size={16} color="#4CAF50" />
          <Text style={styles.savingsText}>
            Your Total Savings: ₹ {summary.totalSavings}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundSecondary,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textColor,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.textWhite,
    fontWeight: '500',
  },
  discountValue: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
  },
  savingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d7f1d7',
    padding: 12,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default PriceSummary;
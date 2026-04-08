// ===============================================
// PAYMENT HEADER COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/styles/colors';

interface PaymentHeaderProps {
  onBackPress: () => void;
  totalAmount: number;
}

const PaymentHeader: React.FC<PaymentHeaderProps> = ({
  onBackPress,
  totalAmount
}) => {
  return (
    <LinearGradient
      colors={[Colors.background, Colors.background]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="arrow-back" size={20} color={Colors.textColor} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>Payment</Text>
            <Text style={styles.amountText}>₹{totalAmount}</Text>
          </View>
          
          <View style={styles.rightSpace} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textColor,
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
    marginTop: 2,
  },
  rightSpace: {
    width: 28,
  },
});

export default PaymentHeader;
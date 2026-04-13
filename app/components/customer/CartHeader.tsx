// ===============================================
// CART HEADER COMPONENT
// ===============================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Colors } from '@/styles/colors';

interface CartHeaderProps {
  onBackPress: () => void;
  onProfilePress?: () => void;
  deliveryTime?: string;
}

const CartHeader: React.FC<CartHeaderProps> = ({
  onBackPress,
  onProfilePress,
  deliveryTime,
}) => {
  const isDeliveryTimeAvailable = deliveryTime ? true : false;
  return (
    <LinearGradient
      colors={[Colors.backgroundSecondary, Colors.backgroundSecondary]}
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
            <Icon name="keyboard-arrow-left" size={20} color={Colors.black} />
          </TouchableOpacity>
          
          <View style={styles.titleContainer}>
            <Text style={styles.pageTitle}>Cart</Text>
          </View>
          
          <TouchableOpacity style={styles.profileButton} onPress={onProfilePress}>
            <View style={styles.profileIcon}>
              <Icon name="person" size={20} color={Colors.black} />
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.backButton} onPress={()=> Alert.alert('Notification', 'This feature is coming soon!')}>
              <Icon name="more-vert" size={20} color={Colors.black} />
          </TouchableOpacity> */}
        </View>
        { isDeliveryTimeAvailable ? (
          <View style={styles.deliveryInfo}>
            <Text style={styles.cartTitle}>Cart</Text>
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryText}>Delivery by</Text>
              <Text style={styles.deliveryTime}>{deliveryTime}</Text>
            </View>
          </View>
        ) : (
          <>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.backgroundSecondary,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    // marginBottom: 16,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
    color: '#1A1A1A',
    backgroundColor: '#f7f6f9ff',
    borderRadius: 50,
    height:40,
    width:40,
    justifyContent:'center',
    alignItems:'center',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
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
  deliveryInfo: {
    paddingLeft: 4,
  },
  cartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    fontSize: 12,
    color: Colors.black,
    marginRight: 4,
  },
  deliveryTime: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
    marginRight: 8,
  },
  changeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default CartHeader;
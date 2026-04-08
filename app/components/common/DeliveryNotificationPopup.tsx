import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DeliveryNotificationPopup = ({ notifications = [], onAccept, onReject, onClose }) => {
  const [visible, setVisible] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [slideAnim] = useState(new Animated.Value(-100));
  const progressAnim = useRef(new Animated.Value(100)).current; // For smooth progress animation
  const progressColorAnim = useRef(new Animated.Value(1)).current; // For smooth color transitions

  // Show notification when new order notification arrives
  useEffect(() => {
    if (notifications) {
      // console.log('Notifications updated:', notifications);
      // const orderNotification = notifications.find(
      //   notif => notif.notification_type === 'order_update' && 
      //           notif.priority === 'high' && 
      //           !notif.is_read
      // );
      const orderNotification = notifications;
      
      if (orderNotification) {
        console.log(JSON.stringify(orderNotification,null,2));
        
        setCurrentNotification(orderNotification);
        setVisible(true);
        
        // Calculate remaining time
        const expiresAt = new Date(orderNotification.expires_at);
        const now = new Date();
        const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeRemaining(remaining);
        
        // Initialize progress animation
        const expiresInSeconds = orderNotification.data?.expires_in_seconds || 60;
        const initialProgress = (remaining / expiresInSeconds) * 100;
        progressAnim.setValue(initialProgress);
        
        // Set initial color based on time remaining
        if (remaining > 30) progressColorAnim.setValue(1); // Green
        else if (remaining > 15) progressColorAnim.setValue(0.5); // Orange
        else progressColorAnim.setValue(0); // Red
        
        // Slide in animation
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  }, [notifications, progressAnim, progressColorAnim]);

  // Timer countdown with smooth animation
  useEffect(() => {
    if (timeRemaining > 0 && visible && currentNotification) {
      const expiresInSeconds = currentNotification.data?.expires_in_seconds || 60;
      
      // Animate progress bar width smoothly
      const progressValue = (timeRemaining / expiresInSeconds) * 100;
      Animated.timing(progressAnim, {
        toValue: Math.max(0, progressValue),
        duration: 1000,
        useNativeDriver: false,
      }).start();

      // Animate color transition smoothly
      let colorValue = 1; // Green
      if (timeRemaining <= 15) colorValue = 0; // Red
      else if (timeRemaining <= 30) colorValue = 0.5; // Orange
      
      Animated.timing(progressColorAnim, {
        toValue: colorValue,
        duration: 500,
        useNativeDriver: false,
      }).start();

      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && visible) {
      handleClose();
    }
  }, [timeRemaining, visible, currentNotification, progressAnim, progressColorAnim]);

  const handleAccept = async () => {
    if (currentNotification && onAccept) {
      await onAccept(currentNotification);
    }
    handleClose();
  };

  const handleReject = async () => {
    if (currentNotification && onReject) {
      await onReject(currentNotification);
    }
    handleClose();
  };

  const handleClose = () => {
    Animated.spring(slideAnim, {
      toValue: -500,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setCurrentNotification(null);
      if (onClose) onClose();
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#FF4444';
      case 'medium': return '#FFA500';
      case 'low': return '#4CAF50';
      default: return '#6B7280';
    }
  };

  if (!visible || !currentNotification) return null;

  const { data, title, body, priority } = currentNotification;
  const orderDetails = data?.order_details || {};

  // Create interpolated background color for smooth transitions
  const progressBackgroundColor = progressColorAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['#FF4444', '#FFA500', '#4CAF50'], // Red -> Orange -> Green
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.notificationContainer,
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
              <Icon name='notifications-none' size={20} color="#6B7280"/>
              <Text style={styles.headerTitle}>New Delivery Order</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
               <Icon name='close' size={20} color="#6B7280"/>
            </TouchableOpacity>
          </View>

          {/* Timer */}
          <View style={styles.timerContainer}>
             <Icon name='access-time' size={20} color="#FF4444"/>
            <Text style={styles.timerText}>
              Accept within: {formatTime(timeRemaining)}
            </Text>
          </View>

          {/* Order Info */}
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <View>
                <Text style={styles.orderNumber}>#{orderDetails.order_number || "unknown"}</Text>
                <Text style={styles.orderShop}>{orderDetails.shop_name || 'Shop Name N/A'}</Text>
              </View>
              <View style={styles.orderAmount}>
                <Text style={styles.amountText}>₹{orderDetails.total_amount}</Text>
                <Text style={styles.earnText}>Earn ₹{orderDetails.delivery_fee}</Text>
              </View>
            </View>
      
            <View style={styles.orderDetails}>
              <View style={styles.detailRow}>
                <Icon name="location-on" size={16} color="#666" />
                <Text style={styles.detailText} numberOfLines={2}>
                  {orderDetails.pickup_address || "shop address"} → {orderDetails.delivery_address || "delivery address"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Icon name="access-time" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {orderDetails.distance || 2.2}km
                </Text>
                {/* <Text style={styles.detailText}>
                  {orderDetails.distance || 2.2}km • {orderDetails.estimate_time} mins
                </Text> */}
              </View>
              <View style={styles.detailRow}>
                <Icon name="shopping-bag" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {orderDetails.items_count || 1} item(s) • {orderDetails.payment_method || "unknown"}
                </Text>
              </View>
            </View>
      
            <View style={styles.orderActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={handleReject}
                activeOpacity={0.8}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={handleAccept}
                activeOpacity={0.8}
              >
                <Text style={styles.acceptButtonText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Smooth Progress Bar */}
          <View style={styles.progressContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  }),
                  backgroundColor: progressBackgroundColor,
                }
              ]} 
            />
          </View>

        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  notificationContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  headerTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    padding: 4,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timerText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  orderCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  orderShop: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  earnText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  orderDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
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
  progressContainer: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
});

export default DeliveryNotificationPopup;
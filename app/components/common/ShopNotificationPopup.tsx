import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ShopNotificationPopup = ({ notification, onAccept, onReject, onClose }) => {
    const [visible, setVisible] = useState(false);
    const [order, setCurrentNotification] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(0);
    const [slideAnim] = useState(new Animated.Value(-100));
    const progressAnim = useRef(new Animated.Value(100)).current; // For smooth progress animation
    const progressColorAnim = useRef(new Animated.Value(1)).current; // For smooth color transitions
    useEffect(() => {
        if (notification) {
          console.log('notification is ', JSON.stringify(notification,null,2));
          
            const orderNotification = notification;
            
            if (orderNotification) {
            setCurrentNotification(orderNotification);
            setVisible(true);
            
            // Calculate remaining time
            // const expiresAt = new Date(orderNotification.expires_at);
            // const now = new Date();
            // const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
            // setTimeRemaining(remaining);
            
            // Initialize progress animation
            // const expiresInSeconds = orderNotification.data?.expires_in_seconds || 60;
            // const initialProgress = (remaining / expiresInSeconds) * 100;
            // progressAnim.setValue(initialProgress);
            
            // Set initial color based on time remaining
            // if (remaining > 30) progressColorAnim.setValue(1); // Green
            // else if (remaining > 15) progressColorAnim.setValue(0.5); // Orange
            // else progressColorAnim.setValue(0); // Red
            
            // Slide in animation
            Animated.spring(slideAnim, {
                toValue: 0,
                useNativeDriver: true,
                tension: 100,
                friction: 8,
            }).start();
            }
        }
    },[notification, progressAnim, progressColorAnim]);


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

    const handleAcceptOrder = async (orderId:string) => {
        if (order && onAccept) {
          await onAccept(orderId);
        }
        handleClose();
    };

    const handleRejectOrder = async (orderId:string) => {
        if (order && onReject) {
          await onReject(orderId);
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
    }

    const getPriorityColor = (priority) => {
      switch (priority) {
        case 'high': return '#FF4444';
        case 'medium': return '#FFA500';
        case 'low': return '#4CAF50';
        default: return '#4CAF50';
        // default: return '#6B7280';
      }
    };
    const { priority } = order || { priority: 'low' };
    return (
        <>
        {order && 
        <>
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

              <View style={[styles.orderCard, { borderLeftColor: getStatusColor(order.order_status) }]}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderTitleSection}>
                    <View style={styles.header}>
                      <View style={styles.headerLeft}>
                        <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(priority) }]} />
                        <Icon name='notifications-none' size={20} color="#6B7280"/>
                        <Text style={styles.headerTitle}>New Order Available</Text>
                      </View>
                      <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                          <Icon name='close' size={20} color="#6B7280"/>
                      </TouchableOpacity>
                    </View>
                    <View style={styles.orderNumberRow}>
                      <Text style={styles.orderNumber}>#{order.order_number}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.order_status) + '20' }]}>
                        <Icon 
                          name={getStatusIcon(order.order_status)} 
                          size={12} 
                          color={getStatusColor(order.order_status)} 
                        />
                        <Text style={[styles.statusText, { color: getStatusColor(order.order_status) }]}>
                          {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.customerName}>{order.name || 'Unknown Customer'}</Text>
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
                      { order?.delivery_address.contact_name + ', ' + order?.delivery_address.address_line_1 + ', ' + order?.delivery_address.address_line_2 + ' Phone: ' + order?.delivery_address.contact_phone }
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
                      <Text style={{color:'#FF9800'}}>This order is schedule at {order.scheduled_time}</Text>
                  </View>
                )}
          
                  <View style={styles.orderActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectOrder(order.uuid)}
                      activeOpacity={0.8}
                    >
                      <Icon name="close" size={16} color="#F44336" />
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => handleAcceptOrder(order.uuid)}
                      activeOpacity={0.8}
                    >
                      <Icon name="check" size={16} color="#fff" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  </View>

              </View>

            </Animated.View>
          </View>
        </Modal>
        </>}
        </>
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
    // backgroundColor: '#FFFFFF',
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
    // backgroundColor: '#F9FAFB',
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

    orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 5,
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
    marginTop:4,
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
});

export default ShopNotificationPopup;
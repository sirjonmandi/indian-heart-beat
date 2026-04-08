import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'Order Delivered!',
      message: 'Your order #BG1234567890 has been delivered successfully.',
      time: '2 min ago',
      isRead: false,
      icon: 'check-circle'
    },
    {
      id: 2,
      type: 'offer',
      title: '20% Off on All Beers!',
      message: 'Limited time offer. Use code BEER20 and save big!',
      time: '1 hour ago',
      isRead: false,
      icon: 'local-offer'
    },
    {
      id: 3,
      type: 'order',
      title: 'Order Confirmed',
      message: 'Your order #BG1234567889 has been confirmed and is being prepared.',
      time: '2 hours ago',
      isRead: true,
      icon: 'receipt'
    },
    {
      id: 4,
      type: 'system',
      title: 'Age Verification Approved',
      message: 'Your age verification has been approved. You can now place orders.',
      time: '1 day ago',
      isRead: true,
      icon: 'verified-user'
    }
  ]);

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const getNotificationIcon = (type: string, icon: string) => {
    const iconColor = type === 'order' ? '#4CAF50' : 
                     type === 'offer' ? '#FF9800' : '#2196F3';
    return { name: icon, color: iconColor };
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    const iconProps = getNotificationIcon(item.type, item.icon);
    
    return (
      <TouchableOpacity
        style={[styles.notificationItem, !item.isRead && styles.unreadItem]}
        onPress={() => markAsRead(item.id)}
      >
        <View style={[styles.iconContainer, { backgroundColor: iconProps.color + '20' }]}>
          <Icon name={iconProps.name} size={24} color={iconProps.color} />
        </View>
        
        <View style={styles.notificationContent}>
          <Text style={[styles.notificationTitle, !item.isRead && styles.unreadTitle]}>
            {item.title}
          </Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{item.time}</Text>
        </View>
        
        {!item.isRead && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#2C2C2C" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Notifications {unreadCount > 0 && `(${unreadCount})`}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>

      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotificationItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Icon name="notifications-none" size={64} color="#999" />
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyMessage}>
            You'll see order updates and offers here
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 20,
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C2C2C',
    flex: 1,
    marginLeft: 16,
  },
  
  markAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2C',
  },
  
  // Notification List
  notificationsList: {
    padding: 16,
    paddingBottom: 24,
  },
  
  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  
  unreadItem: {
    backgroundColor: '#FFFEF8',
    borderLeftWidth: 3,
    borderLeftColor: '#FFA500',
  },
  
  // Icon Container
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  // Notification Content
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 4,
  },
  
  unreadTitle: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  
  notificationMessage: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginBottom: 6,
  },
  
  notificationTime: {
    fontSize: 12,
    color: '#999999',
  },
  
  // Unread Indicator
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFA500',
    position: 'absolute',
    top: 16,
    right: 16,
  },
  
  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C2C2C',
    marginTop: 16,
    marginBottom: 8,
  },
  
  emptyMessage: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 20,
  },
});
export default NotificationsScreen;
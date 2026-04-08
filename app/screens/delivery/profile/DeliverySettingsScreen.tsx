import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

// TODO: Uncomment when these actions are added to delivery slice
// import { updateDeliverySettings, logout } from '../../store/slices/deliverySlice';

// DUMMY DATA for testing
const dummySettings = {
  autoAcceptOrders: false,
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  locationTracking: true,
  backgroundLocation: true,
  orderNotifications: true,
  earningsNotifications: true,
};

interface RootState {
  delivery: {
    settings?: typeof dummySettings;
    loading: boolean;
  };
}

const DeliverySettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Safely get delivery state with fallbacks
  const deliveryState = useSelector((state: RootState) => state.delivery);
  const { 
    settings = dummySettings, 
    loading = false 
  } = deliveryState || {};

  const [localSettings, setLocalSettings] = useState({
    autoAcceptOrders: settings?.autoAcceptOrders || false,
    notificationsEnabled: settings?.notificationsEnabled || true,
    soundEnabled: settings?.soundEnabled || true,
    vibrationEnabled: settings?.vibrationEnabled || true,
    locationTracking: settings?.locationTracking || true,
    backgroundLocation: settings?.backgroundLocation || true,
    orderNotifications: settings?.orderNotifications || true,
    earningsNotifications: settings?.earningsNotifications || true,
  });

  const updateSetting = (key: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    console.log('⚙️ Setting updated (DUMMY MODE):', key, value);
  };

  const saveSettings = async () => {
    try {
      // TODO: Uncomment when action is ready
      // await dispatch(updateDeliverySettings(localSettings)).unwrap();
      Alert.alert('Success', 'Settings updated successfully! (DUMMY MODE)');
      console.log('💾 Settings saved (DUMMY MODE):', localSettings);
    } catch (error) {
      Alert.alert('Error', 'Failed to update settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // TODO: Uncomment when action is ready
            // dispatch(logout());
            Alert.alert('Logged Out', 'You have been logged out successfully (DUMMY MODE)');
            console.log('🚪 Logout (DUMMY MODE)');
          },
        },
      ]
    );
  };

  const settingItems = [
    {
      title: 'Order Management',
      items: [
        {
          key: 'autoAcceptOrders',
          title: 'Auto Accept Orders',
          subtitle: 'Automatically accept delivery requests',
          value: localSettings.autoAcceptOrders,
          icon: 'check-circle',
        },
      ],
    },
    {
      title: 'Location Services',
      items: [
        {
          key: 'locationTracking',
          title: 'Location Tracking',
          subtitle: 'Share your location while online',
          value: localSettings.locationTracking,
          icon: 'location-on',
        },
        {
          key: 'backgroundLocation',
          title: 'Background Location',
          subtitle: 'Track location when app is in background',
          value: localSettings.backgroundLocation,
          icon: 'my-location',
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          key: 'notificationsEnabled',
          title: 'Enable Notifications',
          subtitle: 'Receive push notifications',
          value: localSettings.notificationsEnabled,
          icon: 'notifications',
        },
        {
          key: 'orderNotifications',
          title: 'Order Notifications',
          subtitle: 'Get notified for new delivery requests',
          value: localSettings.orderNotifications,
          icon: 'shopping-bag',
        },
        {
          key: 'earningsNotifications',
          title: 'Earnings Notifications',
          subtitle: 'Get notified for earnings updates',
          value: localSettings.earningsNotifications,
          icon: 'account-balance-wallet',
        },
      ],
    },
    {
      title: 'Sound & Vibration',
      items: [
        {
          key: 'soundEnabled',
          title: 'Sound',
          subtitle: 'Play notification sounds',
          value: localSettings.soundEnabled,
          icon: 'volume-up',
        },
        {
          key: 'vibrationEnabled',
          title: 'Vibration',
          subtitle: 'Vibrate for notifications',
          value: localSettings.vibrationEnabled,
          icon: 'vibration',
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity 
          onPress={saveSettings} 
          style={styles.saveButton}
          activeOpacity={0.7}
        >
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.settingItem}>
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <Icon 
                        name={item.icon || 'settings'} 
                        size={20} 
                        color="#2196F3" 
                      />
                    </View>
                    <View style={styles.settingInfo}>
                      <Text style={styles.settingTitle}>{item.title}</Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={(value) => updateSetting(item.key, value)}
                    trackColor={{ false: '#e0e0e0', true: '#2196F3' }}
                    thumbColor={item.value ? '#fff' : '#fff'}
                    ios_backgroundColor="#e0e0e0"
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.actionItem} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                  <Icon name="logout" size={20} color="#F44336" />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Version', 'BeerGo Delivery Partner v1.0.0')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="info" size={20} color="#666" />
                </View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>Version</Text>
                  <Text style={styles.settingSubtitle}>1.0.0</Text>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Privacy Policy', 'Privacy policy content would go here')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="privacy-tip" size={20} color="#666" />
                </View>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => Alert.alert('Terms', 'Terms of service content would go here')}
              activeOpacity={0.7}
            >
              <View style={styles.actionLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="description" size={20} color="#666" />
                </View>
                <Text style={styles.settingTitle}>Terms of Service</Text>
              </View>
              <Icon name="chevron-right" size={20} color="#ccc" />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutIconContainer: {
    backgroundColor: '#ffebee',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F44336',
  },
});

export default DeliverySettingsScreen;
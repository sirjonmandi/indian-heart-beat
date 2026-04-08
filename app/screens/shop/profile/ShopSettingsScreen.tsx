import React, { useEffect, useState } from 'react';
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
import { logout } from '@/store/slices/authSlice';
import { ApiError, ApiResponse } from '@/services/api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '@/services/api/authAPI';
import { fetchShopNotificationSettings, updateShopNotificationSettings } from '@/store/slices/shopSlice';

interface RootState {
  shop?: any;
}

const ShopSettingsScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { autoAcceptOrders, notificationPreference, loading } = useSelector((state: RootState) => state.shop);
  
  const [localSettings, setLocalSettings] = useState({
    autoAcceptOrders: autoAcceptOrders || false,
    notificationsEnabled: notificationPreference?.enable_notifications || false,
    soundEnabled: notificationPreference?.sound_notifications || false,
    vibrationEnabled: notificationPreference?.vibration_notifications || false,
    orderNotifications: notificationPreference?.order_notifications || false,
    paymentNotifications: notificationPreference?.payment_notifications || false,
  });

  const updateSetting = (key: string, value: boolean) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    try {
      await dispatch(updateShopNotificationSettings(localSettings) as any).unwrap();
      Alert.alert('Success', 'Settings updated successfully!');
    } catch (error:any) {
      console.log(JSON.stringify(error,null,2));
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
          onPress: async () => {
            try {
              await new Promise((resolve, reject)=>{
                authAPI.logout()
                .then(async(res:ApiResponse)=>{
                  await AsyncStorage.removeItem('authToken');

                  dispatch(logout());
                  resolve(res) 
                })
                .catch((error:ApiError)=>{
                  console.error(error);
                  reject(error);
                })
              })
            } catch (error:any) {
              console.error('Logout Error ' + error);
              Alert.alert('Logout', error);              
            }
          },
        },
      ]
    );
  };

  useEffect(() =>{
    const getSettings = async() =>{
      try{
        await dispatch(fetchShopNotificationSettings() as any);
      }catch(error){
        console.error('Fetch Settings Error: ', error);
      }
    }

    getSettings();
  },[]);

  useEffect(() => {
    setLocalSettings({
      autoAcceptOrders: autoAcceptOrders || false,
      notificationsEnabled: notificationPreference?.enable_notifications || false,
      soundEnabled: notificationPreference?.sound_notifications || false,
      vibrationEnabled: notificationPreference?.vibration_notifications || false,
      orderNotifications: notificationPreference?.order_notifications || false,
      paymentNotifications: notificationPreference?.payment_notifications || false,
    });
}, [autoAcceptOrders, notificationPreference]);

  const settingItems = [
    {
      title: 'Order Management',
      items: [
        {
          key: 'autoAcceptOrders',
          title: 'Auto Accept Orders',
          subtitle: 'Automatically accept incoming orders',
          value: localSettings.autoAcceptOrders,
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
        },
        {
          key: 'orderNotifications',
          title: 'Order Notifications',
          subtitle: 'Get notified for new orders',
          value: localSettings.orderNotifications,
        },
        {
          key: 'paymentNotifications',
          title: 'Payment Notifications',
          subtitle: 'Get notified for payments',
          value: localSettings.paymentNotifications,
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
        },
        {
          key: 'vibrationEnabled',
          title: 'Vibration',
          subtitle: 'Vibrate for notifications',
          value: localSettings.vibrationEnabled,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View> 

      <ScrollView style={styles.content}>
        {settingItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <View key={itemIndex} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={(value) => updateSetting(item.key, value)}
                  trackColor={{ false: '#767577', true: '#4CAF50' }}
                  thumbColor={item.value ? '#fff' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.actionItem} onPress={handleLogout}>
            <Icon name="logout" size={24} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    // marginTop: 20,
    backgroundColor: '#fff',
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
});
export default ShopSettingsScreen; 
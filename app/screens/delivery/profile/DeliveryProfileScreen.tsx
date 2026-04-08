import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { authAPI } from '@/services/api/authAPI';
import { logout } from '@/store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, ApiError } from '@/services/api';
import { Constants } from '@/utils/constants';
import { fetchProfile, updateNotificationSettings } from '@/store/slices/deliverySlice';
// TODO: Uncomment when these actions are added to delivery slice
// import {
//   fetchProfile,
//   updateProfile,
//   updateNotificationSettings,
// } from '../../store/slices/deliverySlice';

// DUMMY DATA for testing
const dummyProfile = {
  firstName: '',
  lastName: '',
  avatar: null,
  partnerCode: '',
  phone: '',
  rating: 0.00,
  totalDeliveries: 0,
  acceptanceRate: 0,
};

interface RootState {
  delivery: {
    user?: {
      phone: string;
    };
    profile?: typeof dummyProfile;
    rating: number;
    totalDeliveries: number;
    acceptanceRate: number;
    loading: boolean;
    notificationPreferences?: {
      orderNotification: boolean;
      earningsNotification: boolean;
      promotionalNotification: boolean;
    };
  };
}

const DeliveryProfileScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Safely get delivery state with fallbacks
  const deliveryState = useSelector((state: RootState) => state.delivery);
  const { profile,rating,totalDeliveries,acceptanceRate, notificationPreferences } = deliveryState || {};
  
  const [notificationSettings, setNotificationSettings] = useState({
    orderNotifications: notificationPreferences?.orderNotification ?? false,
    earningsNotifications: notificationPreferences?.earningsNotification ?? false,
    promotionalNotifications: notificationPreferences?.promotionalNotification ?? false,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Update local state when Redux state changes
    if (notificationPreferences) {
      setNotificationSettings({
        orderNotifications: notificationPreferences.orderNotification,
        earningsNotifications: notificationPreferences.earningsNotification,
        promotionalNotifications: notificationPreferences.promotionalNotification,
      });
    }
  }, [notificationPreferences]);

  const loadProfile = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchProfile()).unwrap();
      console.log('👤 Loading profile ');
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setTimeout(() => setRefreshing(false), 1000); // Simulate loading
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

  const handleNotificationToggle = async (key: string, value: boolean) => {
    const updatedSettings = {
      ...notificationSettings,
      [key]: value,
    };
    setNotificationSettings(updatedSettings);
    updateNotification(updatedSettings);
    // try {
    //   // TODO: Uncomment when action is ready
    //   console.log('🔔 Notification settings updated (DUMMY MODE):', key, value);
    //   await dispatch(updateNotificationSettings(notificationSettings) as any).unwrap();
    // } catch (error) {
    //   console.error('Failed to update notification settings:', error);
    //   // Revert the change if API call fails
    //   setNotificationSettings(notificationSettings);
    // }
  };

  const updateNotification = async (updatedSettings:any) => {
    try {
      console.log('🔔 Notification settings updated :', updatedSettings);
      await dispatch(updateNotificationSettings(updatedSettings) as any).unwrap();
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  };

  const handleNavigationPress = (screenName: string) => {
    // navigation.navigate(Constants.SCREENS.DELIVERY_PROFILE_EDIT)
      if(screenName === 'DeliveryBankDetails' || screenName === 'DeliveryProfileEdit' || screenName === 'DeliveryVehicle' || screenName === 'DeliveryDocuments' || screenName === 'HelpSupport' || screenName === 'AboutUs' || screenName === 'Feedback' || screenName === 'RatingsReviews' || screenName === 'PerformanceReport' || screenName === 'WorkSchedule')
      {
        console.log("navigating to " + screenName);
        navigation.navigate(screenName);
      } else {
        Alert.alert('Navigation Error', `${screenName} screen is Coming soon !`);
      }
  };

  const profileSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          onPress: () => handleNavigationPress('DeliveryProfileEdit'),
        },
        {
          icon: 'directions-car',
          title: 'Vehicle Details',
          subtitle: 'Manage your vehicle information',
          onPress: () => handleNavigationPress('DeliveryVehicle'),
        },
        {
          icon: 'account-balance',
          title: 'Bank Details',
          subtitle: 'Update your payment information',
          onPress: () => handleNavigationPress('DeliveryBankDetails'),
        },
        {
          icon: 'description',
          title: 'Documents',
          subtitle: 'Manage your verification documents',
          onPress: () => handleNavigationPress('DeliveryDocuments'),
        },
      ],
    },
    {
      title: 'Performance',
      items: [
        {
          icon: 'bar-chart',
          title: 'Performance Report',
          subtitle: 'View your delivery statistics',
          onPress: () => handleNavigationPress('PerformanceReport'),
        },
        {
          icon: 'schedule',
          title: 'Work Schedule',
          subtitle: 'Manage your availability',
          onPress: () => handleNavigationPress('WorkSchedule'),
        },
        {
          icon: 'star',
          title: 'Ratings & Reviews',
          subtitle: 'See customer feedback',
          onPress: () => handleNavigationPress('RatingsReviews'),
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: 'help',
          title: 'Help & Support',
          subtitle: 'Get help with common issues',
          onPress: () => handleNavigationPress('HelpSupport'),
        },
        {
          icon: 'feedback',
          title: 'Feedback',
          subtitle: 'Share your suggestions',
          onPress: () => handleNavigationPress('Feedback'),
        },
        {
          icon: 'info',
          title: 'About',
          subtitle: 'App version and information',
          onPress: () => handleNavigationPress('AboutUs'),
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={40} color="#666" />
            </View>
            <TouchableOpacity 
              style={styles.cameraButton}
              onPress={() => Alert.alert('Photo', 'Camera functionality not implemented yet')}
            >
              <Icon name="camera-alt" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {profile?.user.first_name} {profile?.user.last_name}
            </Text>
            <Text style={styles.profilePhone}>{profile?.user.phone}</Text>
            <Text style={styles.partnerCode}>
              Partner ID: {profile?.delivery_partner.partner_code}
            </Text>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="star" size={20} color="#FFC107" />
            <Text style={styles.statValue}>{rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="local-shipping" size={20} color="#2196F3" />
            <Text style={styles.statValue}>{totalDeliveries}</Text>
            <Text style={styles.statLabel}>Deliveries</Text>
          </View>
          
          <View style={styles.statItem}>
            <Icon name="thumb-up" size={20} color="#4CAF50" />
            <Text style={styles.statValue}>{acceptanceRate}%</Text>
            <Text style={styles.statLabel}>Acceptance</Text>
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Order Notifications</Text>
              <Text style={styles.notificationSubtitle}>
                Get notified about new delivery requests
              </Text>
            </View>
            <Switch
              value={notificationSettings.orderNotifications}
              onValueChange={(value) => handleNotificationToggle('orderNotifications', value)}
              trackColor={{ false: '#767577', true: '#2196F3' }}
              thumbColor={notificationSettings.orderNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Earnings Notifications</Text>
              <Text style={styles.notificationSubtitle}>
                Get updates about payouts and earnings
              </Text>
            </View>
            <Switch
              value={notificationSettings.earningsNotifications}
              onValueChange={(value) => handleNotificationToggle('earningsNotifications', value)}
              trackColor={{ false: '#767577', true: '#2196F3' }}
              thumbColor={notificationSettings.earningsNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>

          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationTitle}>Promotional Notifications</Text>
              <Text style={styles.notificationSubtitle}>
                Receive updates about bonuses and offers
              </Text>
            </View>
            <Switch
              value={notificationSettings.promotionalNotifications}
              onValueChange={(value) => handleNotificationToggle('promotionalNotifications', value)}
              trackColor={{ false: '#767577', true: '#2196F3' }}
              thumbColor={notificationSettings.promotionalNotifications ? '#fff' : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Profile Sections */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                style={styles.profileItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.itemLeft}>
                  <View style={styles.iconContainer}>
                    <Icon name={item.icon} size={24} color="#666" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <Icon name="chevron-right" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" size={20} color="#F44336" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>BeerGo Delivery Partner v{Constants.APP_VERSION}</Text>
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
  content: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#2196F3',
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    textTransform:'capitalize',
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  partnerCode: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  notificationSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  logoutContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
    marginLeft: 8,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default DeliveryProfileScreen;
import React, { useEffect, useState } from 'react';
import { StatusBar, Platform, Modal, TouchableWithoutFeedback, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { AppNavigator } from './app/navigation/AppNavigator';
import { Colors } from './app/styles/colors';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getInitialNotification,
  onMessage,
  onNotificationOpenedApp,
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import { createNavigationContainerRef } from '@react-navigation/native';
import { Constants } from '@/utils/constants';
import DeliveryNotificationPopup from '@/components/common/DeliveryNotificationPopup';
import { deliveryAPI } from '@/services/api/deliveryAPI';
import ShopNotificationPopup from '@/components/common/ShopNotificationPopup';
import { shopAPI } from '@/services/api/shopAPI';
import { AlertProvider } from '@/components/context/AlertContext';

export const navigationRef = createNavigationContainerRef();

export function navigate(name: string, params: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}

const App: React.FC = () => {
  const [initialNotification, setInitialNotification] = useState<FirebaseMessagingTypes.RemoteMessage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(Colors.black, true);
      StatusBar.setBarStyle('light-content', true);
    }
  });

  useEffect(() => {
    // Get the messaging instance using the modular API
    const messagingInstance = getMessaging(getApp());

    // Check for initial notification (app opened from quit state)
    getInitialNotification(messagingInstance).then(remoteMessage => {
      if (remoteMessage) {
        console.log('App opened from QUIT state:', remoteMessage);
        setInitialNotification(remoteMessage);
        setModalVisible(true);
      }
    });

    // Foreground message listener
    const unsubscribeOnMessage = onMessage(messagingInstance, async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
      setInitialNotification(remoteMessage);
      setModalVisible(true);
    });

    // Background → foreground (notification tap) listener
    const unsubscribeOnOpened = onNotificationOpenedApp(messagingInstance, remoteMessage => {
      console.log('App opened from BACKGROUND:', remoteMessage);
      setInitialNotification(remoteMessage);
      setModalVisible(true);
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnOpened();
    };
  }, []);

  const handleNavigation = (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const { data } = remoteMessage;
    if (!data) return;
    if (data.screen) {
      navigate(data.screen, { orderId: data.orderId });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    console.log('Shop Accepted Order ID:', orderId);
    const response = await shopAPI.acceptOrder(orderId);
    if (!response.data.success) {
      console.log('API Response:', response);
    }
    handleClose();
  };

  const handleRejectOrder = async (orderId: string) => {
    console.log('Shop Rejected Order ID:', orderId);
    const response = await shopAPI.rejectOrder(orderId, 'other');
    if (!response.data.success) {
      console.log('API Response:', response);
    }
    handleClose();
  };

  const handleAccept = async (notification: any) => {
    console.log('Accepted', notification.action_data.accept_url);
    const response = await deliveryAPI.acceptOrder(notification.action_data.order_id);
    console.log('API Response:', response);
    handleClose();
  };

  const handleReject = async (notification: any) => {
    console.log('Rejected', notification.action_data.reject_url);
    const response = await deliveryAPI.rejectOrder(notification.action_data.order_id, 'other');
    console.log('API Response:', response);
    handleClose();
  };

  const handleClose = () => {
    setModalVisible(false);
    setInitialNotification(null);
  };

  const ViewModal = (notification: FirebaseMessagingTypes.RemoteMessage | null) => {
    if (notification?.data?.for === 'delivery_partner') {
      return (
        <DeliveryNotificationPopup
          notifications={JSON.parse(notification.data.order_info)}
          onAccept={handleAccept}
          onReject={handleReject}
          onClose={handleClose}
        />
      );
    }

    if (notification?.data?.for === 'shop') {
      return (
        <ShopNotificationPopup
          notification={JSON.parse(notification.data.order_info)}
          onAccept={handleAcceptOrder}
          onReject={handleRejectOrder}
          onClose={handleClose}
        />
      );
    }

    if (notification?.data?.for === 'customer') {
      return (
        <Modal visible={modalVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {notification?.notification?.title ?? 'notification title'}
                </Text>
                <Text style={styles.modalMessage}>
                  {notification?.notification?.body ?? 'notification body'}
                </Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: 10, paddingHorizontal: 20 }}>
                  <TouchableOpacity
                    style={{ padding: 10, borderRadius: 5, width: '48%' }}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.5)' }}>Close</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ backgroundColor: '#e5383b', padding: 10, borderRadius: 5, width: '48%' }}
                    onPress={() => {
                      setModalVisible(false);
                      if (notification) handleNavigation(notification);
                    }}
                  >
                    <Text style={{ color: 'white', textAlign: 'center' }}>View</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      );
    }

    // Fallback modal for unknown notification types
    return (
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {notification?.notification?.title ?? 'notification title'}
              </Text>
              <Text style={styles.modalMessage}>
                {notification?.notification?.body ?? 'notification body'}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center', width: '100%', gap: 10, paddingHorizontal: 20 }}>
                <TouchableOpacity
                  style={{ padding: 10, borderRadius: 5, width: '48%' }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.5)' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <Provider store={store}>
      <AlertProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar backgroundColor={Colors.primary} barStyle="light-content" />
          <AppNavigator />
          {modalVisible && initialNotification && ViewModal(initialNotification)}
        </NavigationContainer>
      </AlertProvider>
    </Provider>
  );
};

const styles = {
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#1E212B',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    color: '#1E212B',
    fontSize: 16,
    marginBottom: 20,
  },
};

export default App;
import React, { useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  Dimensions,
  RefreshControl,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchOrderDetails,
  pickupOrder,
  outForDelivery,
  completeDelivery,
} from '@store/slices/deliverySlice';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
import ImageResizer from "react-native-image-resizer";
const { width } = Dimensions.get('window');

interface TrackingScreenProps {
  route: {
    params: {
      orderId: string;
    };
  };
  navigation: any;
}
interface RootState {
  delivery: {
    loading: boolean;
    currentOrder:any;
  };
}

const DeliveryTrackingScreen: React.FC<TrackingScreenProps> = ({ route, navigation }) => {
  const { orderId } = route.params;
  const {currentOrder:orderData,loading} = useSelector((state: RootState) => state.delivery);
  
  const dispatch = useDispatch();

  const [timer, setTimer] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    loadOrderDetails();

    return () => clearInterval(interval);
  }, [orderId]);

  const loadOrderDetails = async () => {
    try {
      // TODO: Uncomment when action is ready
      await dispatch(fetchOrderDetails(orderId)).unwrap();

      // console.log('📋 Loading order details : ', orderData);
    } catch (error:any) {
      console.error('Failed to load order details:', error);
      Alert.alert('Error', error.message);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadOrderDetails();
    setTimeout(() => setRefreshing(false), 1000); // Simulate loading
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStatusUpdate = (newStatus: string) => {
    const statusMessages = {
      'picked_up': 'Order Picked Up',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Order Delivered',
    };

    Alert.alert(
      'Update Status',
      `Mark order as ${statusMessages[newStatus]}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // Alert.alert('Success', `Order marked as ${statusMessages[newStatus]}`);
            if (newStatus === 'picked_up') {
              Alert.alert(
                'Capture Image',
                'Capture pickup order image',
                [
                  {text:'Cancel', style:'cancel'},
                  {
                    text:'Confirm',
                    onPress: () =>{
                      handlePickedUp();
                    }
                  }

                ]
              );
            }else if(newStatus === 'out_for_delivery') {
              handleOutForDelivery();
            }else if(newStatus === 'delivered') {
              handleDelivered();
              setTimeout(() => {
                navigation.goBack();
              }, 2000);
            } else {
              Alert.alert('unExpected Operation',`Something went wrong while ${statusMessages[newStatus]}`);
            }
          },
        },
      ]
    );
  };

  // Request camera permission for Android
  const requestCameraPermission = async (): Promise<boolean> => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // Helper: check if file size under 1.5MB
  const isUnderLimit = (size?: number) => {
    const MAX_SIZE = 1.5 * 1024 * 1024; // 1.5MB in bytes
    return size !== undefined && size <= MAX_SIZE;
  };

  // Open camera and ensure final image under 1.5MB
  const openCamera = async (field: string): Promise<{
    uri: string;
    type: string;
    name: string;
    size?: number;
  } | null> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return null;
    }

    const options = {
      mediaType: 'photo' as MediaType,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    };

    return new Promise((resolve) => {
      launchCamera(options, async (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          resolve(null);
          return;
        }

        if (response.assets && response.assets.length > 0) {
          let asset = response.assets[0];

          if (asset.uri) {
            let finalUri = asset.uri;
            let finalSize = asset.fileSize;
            let finalType = asset.type || "image/jpeg";
            let finalName = asset.fileName || `${field}_${Date.now()}.jpg`;

            // Resize loop until under 1.5MB
            let quality = 80; // start at 80%
            while (!isUnderLimit(finalSize) && quality > 30) {
              try {
                const resized = await ImageResizer.createResizedImage(
                  finalUri,
                  1024, // keep width max
                  1024, // keep height max
                  "JPEG",
                  quality, // reduce quality each loop
                  0 // rotation
                );

                finalUri = resized.uri;
                finalSize = resized.size;
                finalName = resized.name || finalName;
                finalType = "image/jpeg";

                quality -= 10; // reduce further if still too big
              } catch (err) {
                console.warn("Resize failed:", err);
                break;
              }
            }

            if (!isUnderLimit(finalSize)) {
              Alert.alert("Image Too Large", "Could not reduce image below 1.5MB");
              resolve(null);
              return;
            }

            resolve({
              uri: finalUri,
              type: finalType,
              name: finalName,
              size: finalSize,
            });
            return;
          }
        }

        resolve(null);
      });
    });
  };

  const handlePickedUp = async() => {
    console.log("handle picup");
    try {
      const pickupImage = await openCamera('pickupImage');
      const pickupNotes = 'some text';

      await dispatch(pickupOrder({
        orderId,
        data:{
          pickupImage:pickupImage,
          pickupNotes: pickupNotes,
        }
      })).unwrap();
      setTimeout(() => {
        loadOrderDetails();
      }, 1000);
    } catch (error:any) {
      console.error(JSON.stringify(error)); 
      Alert.alert('Error', error.message);
    }
  }
  const handleOutForDelivery = async() => {
    console.log("handle out for delivery");
    try {
      await dispatch(outForDelivery({orderId})).unwrap();
      setTimeout(() => {
        loadOrderDetails();
      }, 1000);
    } catch (error:any) {
      console.error(JSON.stringify(error));
      Alert.alert('Error', error.message);
    }
  }
  const handleDelivered = async() => {
    console.log("handle delivered");
    try {
      const deliveryImage = await openCamera('deliveryImage');
      const customerSignature = 'signature';
      const deliveryNotes = 'some note';
      const cashCollected = null; //cash collected come here 
      await dispatch(completeDelivery({
        orderId,
        data:{
          deliveryImage:deliveryImage,
          customerSignature:customerSignature,
          deliveryNotes: deliveryNotes,
          cashCollected:cashCollected,
        }
      })).unwrap();
      setTimeout(() => {
        loadOrderDetails();
      }, 1000);
    } catch (error:any) {
      console.error(JSON.stringify(error));
      Alert.alert('Error', error.message);
    }
  }

  const openMaps = (destination: 'shop' | 'customer') => {
    const location = destination === 'shop' ? orderData.shop : orderData.customer;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`;
    Linking.openURL(url);
  };

  const makeCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getStatusSteps = () => {
    const steps = [
      { key: 'assigned_to_partner', label: 'Assigned', icon: 'assignment' },
      { key: 'picked_up', label: 'Picked Up', icon: 'shopping-bag' },
      { key: 'out_for_delivery', label: 'Out For Delivery', icon: 'local-shipping' },
      { key: 'delivered', label: 'Delivered', icon: 'check-circle' },
    ];

    const currentIndex = steps.findIndex(step => step.key === orderData.status);
    
    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      active: index === currentIndex,
    }));
  };

  const renderStatusProgress = () => {
    const steps = getStatusSteps();

    return (
      <View style={styles.progressContainer}>
        <Text style={styles.progressTitle}>Order Progress</Text>
        <View style={styles.progressSteps}>
          {steps.map((step, index) => (
            <View key={step.key} style={styles.stepContainer}>
              <View style={styles.stepContent}>
                <View style={[
                  styles.stepIcon,
                  step.completed && styles.stepIconCompleted,
                  step.active && styles.stepIconActive,
                ]}>
                  <Icon 
                    name={step.icon} 
                    size={20} 
                    color={step.completed ? '#fff' : '#999'} 
                  />
                </View>
                <Text style={[
                  styles.stepLabel,
                  step.completed && styles.stepLabelCompleted,
                  step.active && styles.stepLabelActive,
                ]}>
                  {step.label}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <View style={[
                  styles.stepConnector,
                  step.completed && styles.stepConnectorCompleted,
                ]} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Tracking</Text>
        <TouchableOpacity onPress={() => makeCall(orderData.customer.phone)}>
          <Icon name="call" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      {orderData && (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>#{orderData.orderNumber}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {orderData.status.replace(/_/g, ' ').toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.orderAmount}>₹{orderData.totalAmount}</Text>
          <Text style={styles.timerText}>⏱️ {formatTime(timer)}</Text>
        </View>

        {/* Status Progress */}
        {renderStatusProgress()}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => openMaps('customer')}
          >
            <Icon name="navigation" size={20} color="#4CAF50" />
            <Text style={styles.actionText}>Navigate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => makeCall(orderData.customer.phone)}
          >
            <Icon name="call" size={20} color="#2196F3" />
            <Text style={styles.actionText}>Call Customer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => makeCall(orderData.shop.phone)}
          >
            <Icon name="store" size={20} color="#FF9800" />
            <Text style={styles.actionText}>Call Shop</Text>
          </TouchableOpacity>
        </View>

        {/* Location Cards */}
        <View style={styles.locationsContainer}>
          {/* Shop Location */}
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Icon name="store" size={24} color="#4CAF50" />
              <Text style={styles.locationTitle}>Pickup from</Text>
            </View>
            <Text style={styles.locationName}>{orderData.shop.name}</Text>
            <Text style={styles.locationAddress}>{orderData.shop.address}</Text>
            <TouchableOpacity 
              style={styles.locationAction}
              onPress={() => openMaps('shop')}
            >
              <Icon name="directions" size={16} color="#4CAF50" />
              <Text style={styles.locationActionText}>Get Directions</Text>
            </TouchableOpacity>
          </View>

          {/* Connector Line */}
          <View style={styles.routeConnector}>
            <View style={styles.routeLine} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeDistance}>{orderData.distance}</Text>
              <Text style={styles.routeTime}>{orderData.estimatedTime}</Text>
            </View>
          </View>

          {/* Customer Location */}
          <View style={styles.locationCard}>
            <View style={styles.locationHeader}>
              <Icon name="location-on" size={24} color="#F44336" />
              <Text style={styles.locationTitle}>Deliver to</Text>
            </View>
            <Text style={styles.locationName}>{orderData.customer.name}</Text>
            <Text style={styles.locationAddress}>{orderData.customer.address}</Text>
            {orderData.customer.landmark && (
              <Text style={styles.landmark}>📍 {orderData.customer.landmark}</Text>
            )}
            {orderData.deliveryInstructions && (
              <View style={styles.instructionsContainer}>
                <Icon name="info" size={16} color="#666" />
                <Text style={styles.instructions}>{orderData.deliveryInstructions}</Text>
              </View>
            )}
            <TouchableOpacity 
              style={styles.locationAction}
              onPress={() => openMaps('customer')}
            >
              <Icon name="directions" size={16} color="#F44336" />
              <Text style={styles.locationActionText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Order Items ({orderData.items.length})</Text>
          {orderData.items.map((item, index) => (
            <View key={index} style={styles.itemCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price}</Text>
              </View>
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>{item.quantity}x</Text>
              </View>
            </View>
          ))}
          
          <View style={styles.paymentInfo}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Payment Method:</Text>
              <Text style={styles.paymentValue}>{orderData.paymentMethod}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Delivery Fee:</Text>
              <Text style={styles.paymentValue}>₹{orderData.deliveryFee}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {orderData.status === 'assigned_to_partner' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={() => handleStatusUpdate('picked_up')}
            >
              <Icon name="shopping-bag" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Mark as Picked Up</Text>
            </TouchableOpacity>
          )}

          {orderData.status === 'picked_up' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={() => handleStatusUpdate('out_for_delivery')}
            >
              <Icon name="local-shipping" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Start Delivery</Text>
            </TouchableOpacity>
          )}

          {orderData.status === 'out_for_delivery' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.successBtn]}
              onPress={() => handleStatusUpdate('delivered')}
            >
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Mark as Delivered</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryBtn]}
            onPress={() => {
              Alert.alert('Support', 'Contact support for assistance');
            }}
          >
            <Icon name="help" size={20} color="#666" />
            <Text style={styles.secondaryBtnText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      )}
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  orderHeader: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  orderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2196F3',
    letterSpacing: 0.5,
  },
  orderAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  // 
  progressContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepContent: {
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  stepIconActive: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
    borderWidth: 2.5,
  },
  stepIconCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  stepLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#FF9800',
    fontWeight: '600',
  },
  stepLabelCompleted: {
    color: '#333',
    fontWeight: '600',
  },
  stepConnector: {
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: -10,
    marginBottom: 20,
  },
  stepConnectorCompleted: {
    backgroundColor: '#4CAF50',
  },
  // 
  quickActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    minWidth: width / 3.5,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  locationsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  locationCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '500',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  landmark: {
    fontSize: 13,
    color: '#FF9800',
    marginBottom: 8,
    fontWeight: '500',
  },
  instructionsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  instructions: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 6,
    flex: 1,
  },
  locationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
  },
  locationActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
    color: '#4CAF50',
  },
  routeConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: '#4CAF50',
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeDistance: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  routeTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  itemsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  itemPrice: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  quantityBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  quantityText: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  paymentInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    padding: 16,
    paddingBottom: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  primaryBtn: {
    backgroundColor: '#FF9800',
  },
  successBtn: {
    backgroundColor: '#4CAF50',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
});
export default DeliveryTrackingScreen;
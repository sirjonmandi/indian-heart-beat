import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Constants } from '../../utils/constants';

const LocationPermissionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestLocationPermission = async () => {
    setIsRequesting(true);
    
    try {
      const permission = Platform.OS === 'ios' 
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      
      if (result === RESULTS.GRANTED) {
        // Get current location
        Geolocation.getCurrentPosition(
          (position) => {
            setIsRequesting(false);
            navigation.navigate(Constants.SCREENS.PINCODE_CHECK, {
              location: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }
            });
          },
          (error) => {
            setIsRequesting(false);
            Alert.alert('Error', 'Could not get your location. Please try again.');
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      } else {
        setIsRequesting(false);
        Alert.alert(
          'Permission Required',
          'Location permission is required for delivery. Please grant permission in settings.',
          [
            { text: 'Skip for now', onPress: () => navigation.navigate(Constants.SCREENS.PINCODE_CHECK) },
            { text: 'Try Again', onPress: requestLocationPermission }
          ]
        );
      }
    } catch (error) {
      setIsRequesting(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSkip = () => {
    navigation.navigate(Constants.SCREENS.PINCODE_CHECK);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="location-on" size={100} color="#2C2C2C" />
          </View>
          
          <Text style={styles.title}>Enable Location</Text>
          <Text style={styles.subtitle}>
            We need your location to show nearby stores and provide accurate delivery estimates.
          </Text>

          <View style={styles.benefitsContainer}>
            {[
              { icon: 'store', text: 'Find nearby liquor stores' },
              { icon: 'access-time', text: 'Accurate delivery time' },
              { icon: 'local-shipping', text: 'Real-time order tracking' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name={benefit.icon} size={20} color="#2C2C2C" />
                <Text style={styles.benefitText}>{benefit.text}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.allowButton, isRequesting && styles.disabledButton]}
            onPress={requestLocationPermission}
            disabled={isRequesting}
          >
            <Text style={styles.allowButtonText}>
              {isRequesting ? 'Getting Location...' : 'Allow Location Access'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFD700',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2C2C2C',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#2C2C2C',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitText: {
    fontSize: 15,
    color: '#2C2C2C',
    marginLeft: 12,
    fontWeight: '500',
  },
  allowButton: {
    width: '100%',
    backgroundColor: '#2C2C2C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: '#666',
    elevation: 0,
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  skipButton: {
    marginTop: 16,
    paddingVertical: 12,
  },
  skipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C2C2C',
    textDecorationLine: 'underline',
  },
});
export default LocationPermissionScreen;

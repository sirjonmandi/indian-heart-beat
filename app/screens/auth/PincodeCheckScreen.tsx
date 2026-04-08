import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../utils/constants';

const { width } = Dimensions.get('window');

const PincodeCheckScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [pincode, setPincode] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const checkServiceAvailability = async () => {
    if (!pincode || pincode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit pincode');
      return;
    }

    setIsChecking(true);
    
    try {
      // API call to check service availability
      // For demo, simulate check
      setTimeout(() => {
        setIsChecking(false);
        
        // Mock service check - assume service available for demo
        const isServiceAvailable = true;
        
        if (isServiceAvailable) {
          // Complete onboarding and navigate to main app
          dispatch({ type: 'AUTH_SUCCESS', payload: { user: { pincode } } });
          navigation.reset({
            index: 0,
            routes: [{ name: 'Main' }],
          });
        } else {
          Alert.alert(
            'Service Unavailable',
            `Sorry, we don't deliver to ${pincode} yet. We're expanding soon!`,
            [
              { text: 'Try Another Pincode', onPress: () => setPincode('') },
              { text: 'Notify Me', onPress: () => {
                Alert.alert('Success', 'We\'ll notify you when service is available in your area!');
              }}
            ]
          );
        }
      }, 2000);
    } catch (error) {
      setIsChecking(false);
      Alert.alert('Error', 'Could not check service availability. Please try again.');
    }
  };

  const handleSkip = () => {
    // For demo purposes, allow skip and go to main app
    dispatch({ type: 'AUTH_SUCCESS', payload: { user: { pincode: '110001' } } });
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFD700', '#FFA500']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#2C2C2C" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Service Area</Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="location-city" size={80} color="#2C2C2C" />
          </View>
          
          <Text style={styles.title}>Check Service Availability</Text>
          <Text style={styles.subtitle}>
            Enter your pincode to see if we deliver to your area
          </Text>

          {/* Pincode Input */}
          <View style={styles.inputContainer}>
            <Icon name="location-on" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit pincode"
              placeholderTextColor="#999"
              value={pincode}
              onChangeText={(text) => setPincode(text.replace(/[^0-9]/g, ''))}
              keyboardType="numeric"
              maxLength={6}
              autoFocus
            />
          </View>

          {/* Service Info */}
          <View style={styles.serviceInfoContainer}>
            <Text style={styles.serviceInfoTitle}>Why do we need your pincode?</Text>
            
            <View style={styles.infoItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>Verify delivery availability</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>Calculate accurate delivery time</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>Show nearby stores</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Icon name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>Apply correct delivery charges</Text>
            </View>
          </View>

          {/* Popular Pincodes */}
          <View style={styles.popularPincodesContainer}>
            <Text style={styles.popularTitle}>Popular Areas:</Text>
            <View style={styles.pincodeChips}>
              {['110001', '110016', '110021', '110048'].map((code) => (
                <TouchableOpacity
                  key={code}
                  style={styles.pincodeChip}
                  onPress={() => setPincode(code)}
                >
                  <Text style={styles.pincodeChipText}>{code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Check Button */}
          <TouchableOpacity
            style={[
              styles.checkButton,
              (!pincode || pincode.length !== 6 || isChecking) && styles.disabledButton
            ]}
            onPress={checkServiceAvailability}
            disabled={!pincode || pincode.length !== 6 || isChecking}
          >
            <Text style={styles.checkButtonText}>
              {isChecking ? 'Checking...' : 'Check Availability'}
            </Text>
            {!isChecking && (
              <Icon name="arrow-forward" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            )}
          </TouchableOpacity>

          {/* Footer Text */}
          <Text style={styles.footerText}>
            Don't see your area? We're expanding rapidly across India!
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C2C2C',
  },
  skipText: {
    fontSize: 16,
    color: '#2C2C2C',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: '#2C2C2C',
    textAlign: 'center',
    marginBottom: 40,
    opacity: 0.8,
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    letterSpacing: 2,
  },
  serviceInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  serviceInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C2C2C',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
  popularPincodesContainer: {
    marginBottom: 30,
  },
  popularTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2C',
    marginBottom: 15,
  },
  pincodeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pincodeChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2C2C2C',
  },
  pincodeChipText: {
    fontSize: 14,
    color: '#2C2C2C',
    fontWeight: '500',
  },
  checkButton: {
    backgroundColor: '#2C2C2C',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  buttonIcon: {
    marginLeft: 5,
  },
  footerText: {
    fontSize: 14,
    color: '#2C2C2C',
    textAlign: 'center',
    opacity: 0.8,
    fontStyle: 'italic',
  },
});

export default PincodeCheckScreen;
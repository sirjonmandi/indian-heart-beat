import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { setUserType, updateUserType, setAuthenticated } from '@store/slices/authSlice';

const { width } = Dimensions.get('window');

interface UserTypeOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  benefits: string[];
}

const UserTypeSelectionScreen: React.FC = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [selectedType, setSelectedType] = useState<string>('');

  const userTypes: UserTypeOption[] = [
    {
      id: 'customer',
      title: 'Customer',
      subtitle: 'Order your favorite drinks',
      description: 'Get alcohol delivered to your doorstep in 10 minutes',
      icon: 'person',
      color: '#FFC107',
      benefits: [
        '10-minute delivery',
        'Wide selection of products',
        'Secure payments',
        'Track your orders',
        'Exclusive offers'
      ]
    },
    {
      id: 'shop_owner',
      title: 'Shop Owner',
      subtitle: 'Grow your liquor business',
      description: 'Partner with us to reach more customers and increase sales',
      icon: 'store',
      color: '#4CAF50',
      benefits: [
        'Increase your revenue',
        'Reach more customers',
        'Easy inventory management',
        'Quick settlements',
        'Business analytics'
      ]
    },
    {
      id: 'delivery_partner',
      title: 'Delivery Partner',
      subtitle: 'Earn money on your schedule',
      description: 'Flexible work hours and competitive earnings',
      icon: 'delivery-dining',
      color: '#2196F3',
      benefits: [
        'Flexible working hours',
        'Competitive earnings',
        'Weekly payouts',
        'Performance bonuses',
        'Insurance coverage'
      ]
    }
  ];

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
  };

  const handleContinue = async () => {
    if (!selectedType) {
      Alert.alert('Please select', 'Please select your user type to continue');
      return;
    }

    try {
      console.log(`🔄 Setting user type to: ${selectedType}`);
      
      // TODO: Uncomment when API is ready
      // await dispatch(updateUserType(selectedType)).unwrap();
      
      // DUMMY: For now, just set user type locally for testing
      dispatch(setUserType(selectedType));
      
      // Simulate API delay
      setTimeout(() => {
        console.log(`✅ User type set to: ${selectedType}`);
        
        // Force authentication state to trigger navigation
        dispatch(setAuthenticated(true));
        
        Alert.alert(
          'Welcome!', 
          `You're now registered as a ${selectedType.replace('_', ' ')}.`,
          [
            {
              text: 'Continue',
              onPress: () => {
                console.log('🚀 Proceeding to main app...');
              }
            }
          ]
        );
      }, 500);
      
    } catch (error) {
      console.error('Failed to update user type:', error);
      Alert.alert('Error', 'Failed to update user type. Please try again.');
    }
  };

  const renderUserTypeCard = (userType: UserTypeOption) => {
    const isSelected = selectedType === userType.id;
    
    return (
      <TouchableOpacity
        key={userType.id}
        style={[
          styles.userTypeCard,
          isSelected && styles.selectedCard,
          { borderColor: userType.color }
        ]}
        onPress={() => handleSelectType(userType.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: userType.color + '20' }]}>
          <Icon name={userType.icon} size={40} color={userType.color} />
        </View>
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{userType.title}</Text>
          <Text style={styles.cardSubtitle}>{userType.subtitle}</Text>
          <Text style={styles.cardDescription}>{userType.description}</Text>
          
          <View style={styles.benefitsList}>
            {userType.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Icon name="check-circle" size={16} color={userType.color} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: userType.color }]}>
            <Icon name="check" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you'd like to use BeerGo
          </Text>
        </View>

        <View style={styles.userTypesContainer}>
          {userTypes.map(renderUserTypeCard)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedType && styles.disabledButton
          ]}
          onPress={handleContinue}
          disabled={!selectedType}
        >
          <Text style={[
            styles.continueButtonText,
            !selectedType && styles.disabledButtonText
          ]}>
            Continue
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.footerText}>
          You can change this later in your profile settings
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
  },
  userTypesContainer: {
    gap: 20,
  },
  userTypeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  selectedCard: {
    borderWidth: 3,
    shadowOpacity: 0.15,
    elevation: 6,
    transform: [{ scale: 1.02 }],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    alignSelf: 'center',
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  benefitsList: {
    width: '100%',
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  continueButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  disabledButtonText: {
    color: '#7f8c8d',
  },
  footerText: {
    fontSize: 12,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default UserTypeSelectionScreen;
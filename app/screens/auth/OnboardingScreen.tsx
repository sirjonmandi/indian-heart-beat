import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  ImageBackground,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { Constants } from '../../utils/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';

// temp user data for testing and imports 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginSuccess, setAuthenticated, setUserType } from '@/store/slices/authSlice';
import { useDispatch } from 'react-redux';

const user = {
    id: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-01',
    status: 'active',
    ageVerificationStatus: 'verified',
    isVerified: true,
    ageVerified: true,
    addresses: null,
    deviceTokens: 'token_abc123',
    preferences: {
      notifications: true,
      darkMode: false,
      language: 'en',
      currency: 'INR',
    },
  };
const token = 'token_abc123';
const userType = 'customer';

const { width, height } = Dimensions.get('window');

const OnboardingScreen: React.FC = () => {
  const dispatch = useDispatch();

  const navigation = useNavigation();

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(60)).current;
  const taglineFade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(0.85)).current;
  const chipsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(taglineFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          friction: 5,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(chipsFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const setUserAuthData = async () => {
    try {
      // console.log('================ handleSuccessfulLogin ====================');
      // console.log('Login Success:', JSON.stringify(user, null, 2));
      // console.log('====================================');
      await AsyncStorage.multiSet([
        ['authToken', token],
        ['user', JSON.stringify(user)],
        ['userType', userType],
      ]);
      dispatch(setUserType(userType));
      dispatch(setAuthenticated(true));
      dispatch(loginSuccess({ user, token }));
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  };
  const handleGetStarted = () => {
    setUserAuthData();
    // navigation.replace(Constants.SCREENS.LOGIN);
  };

  const chips = ['🍛 Biryani','🍕 Pizza', '🍜 Noodles', '🍔 Burgers', '🥗 Salads'];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Background food image with overlay */}  
        <ImageBackground
          source={require('../../../assets/images/background.jpg')}
          style={styles.bgImage}
          resizeMode="cover"
        >
          {/* Dark gradient overlay */}
          <LinearGradient
            colors={['#00000000','#000000']}
            // locations={[0, 0.4, 1]}
            style={styles.overlay}
          />

          {/* Bottom content card */}
          <View style={styles.bottomSheet}>
            {/* Headline */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideUpAnim }],
              }}
            >
              <Image source={require('../../../assets/images/text_logo.webp')} style={styles.logoImage} resizeMode="contain" />
            </Animated.View>
            
            {/* Flavor chips */}
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={[styles.chipsRow, { opacity: chipsFade }]}
              contentContainerStyle={{ paddingHorizontal: 4 }}
            >
              {chips.map((chip, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{chip}</Text>
                </View>
              ))}
            </Animated.ScrollView>


            {/* Tagline */}
            <Animated.Text style={[styles.tagline, { opacity: taglineFade }]}>
              Discover all types of food in our restaurant with fast delivery and pickup options.
            </Animated.Text>

            {/* CTA Buttons */}
            <Animated.View
              style={[styles.buttonsContainer, { transform: [{ scale: buttonScale }] }]}
            >
              <TouchableOpacity
                onPress={handleGetStarted}
                activeOpacity={0.88}
                style={styles.primaryBtnWrapper}
              >
                <LinearGradient
                  colors={['#FF6B35', '#FF3D00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.primaryBtn}
                >
                  <Text style={styles.primaryBtnText}>Get Started </Text>
                  <Icon name="arrow-forward" style={styles.primaryBtnArrow} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topBadge: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
  },
  badgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 28,
    paddingBottom: 48,
    paddingTop: 24,
  },
  chipsRow: {
    marginBottom: 24,
    flexGrow: 0,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
    marginRight: 8,
  },
  chipText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
  headline: {
    fontSize: 50,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 56,
    letterSpacing: -1.5,
    marginBottom: 14,
  },
  headlineAccent: {
    color: '#FF6B35',
  },
  tagline: {
    fontSize: 15,
    color: '#ffffff',
    lineHeight: 23,
    marginBottom: 28,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 0,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.12)',
  },
  statValue: {
    color: '#FF6B35',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryBtnWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    // shadowColor: '#FF3D00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryBtnArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  loginText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '400',
  },
  loginLink: {
    color: '#FF6B35',
    fontWeight: '700',
  },
  logoImage:{
    width: 250,
    height: 200,
    // marginBottom: 16,
  }
});

export default OnboardingScreen;
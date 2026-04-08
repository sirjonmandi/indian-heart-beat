import { Colors } from '@/styles/colors';
import React, { useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Image,
  Animated,
  Easing,
} from 'react-native';



const SplashScreen: React.FC = () => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
   Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* App Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/images/app_logo.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />

          </View>
        </Animated.View>
      </Animated.View>
      {/* Footer */}
        {/* Loading Indicator */}
          <ActivityIndicator 
            size="large" 
            color="#FFF" 
            style={styles.loader}
          />

          {/* Loading Text */}
          <Text style={styles.loadingText}>Initializing...</Text>
          <View style={styles.footer}>
            <Image 
              source={require('../../../assets/images/text_logo.webp')} 
              style={styles.logoText}
              resizeMode="contain"
            />
          </View>
      {/* <Text style={styles.footer}>Enterprise solutions at your doorstep.</Text> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    backgroundColor: Colors.primaryBg,
  },
  content: {
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },

  logoImage: {
    width: 240,
    height: 240,
    marginBottom: 16,
  },
  logoText: {
    width: 100,
    height: 100,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 2,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textWhite,
    // marginBottom: 100,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
});

export default SplashScreen;
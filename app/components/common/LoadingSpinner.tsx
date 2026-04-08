import { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../styles/colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
  animating?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = Colors.primary,
  style,
  animating = true,
}) => {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animating) {
      const spinAnimation = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      );
      spinAnimation.start();

      return () => spinAnimation.stop();
    }
  }, [animating, spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          sizeStyles[size],
          { borderTopColor: color, transform: [{ rotate: spin }] },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 3,
    borderColor: Colors.gray200,
    borderRadius: 50,
  },
  small: {
    width: 20,
    height: 20,
    borderWidth: 2,
  },
  medium: {
    width: 30,
    height: 30,
  },
  large: {
    width: 40,
    height: 40,
  },
});

export default LoadingSpinner;
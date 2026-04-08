import { useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface OTPInputProps {
  length: number;
  value: string;
  onChange: (otp: string) => void;
  style?: ViewStyle;
}

const OTPInput: React.FC<OTPInputProps> = ({
  length,
  value,
  onChange,
  style,
}) => {
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = value.split('');
    newOtp[index] = text;
    const otpString = newOtp.join('');
    
    onChange(otpString);

    // Auto-focus next input
    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {Array(length).fill(0).map((_, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            value[index] && styles.inputFilled,
          ]}
          value={value[index] || ''}
          onChangeText={(text) => handleChangeText(text, index)}
          onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
          keyboardType="numeric"
          maxLength={1}
          textAlign="center"
          selectTextOnFocus
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  input: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    // color: Colors.textPrimary,
    color: '#999',
    backgroundColor: '#16191d',
  },
  inputFilled: {
    borderColor: '#ba181b',
    // borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '20',
  },
});

export default OTPInput;
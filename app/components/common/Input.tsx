import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  style?: ViewStyle;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor={Colors.gray500}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    backgroundColor: Colors.white,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.error,
    marginTop: Spacing.xs,
  },
});

export default Input;
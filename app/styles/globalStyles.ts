import { StyleSheet } from 'react-native';
import {Typography } from './typography';
import { Spacing } from './spacing';
import { Colors } from './colors';

export const GlobalStyles = StyleSheet.create({
  // Container Styles
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
  },
  
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  
  // Text Styles
  heading1: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  
  heading2: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  
  heading3: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  
  bodyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textPrimary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.base,
  },
  
  bodyTextSecondary: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  
  // Button Styles
  button: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textWhite,
  },
  
  // Input Styles
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
  
  // Card Styles
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // Layout Styles
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Margin and Padding Utilities
  mt_xs: { marginTop: Spacing.xs },
  mt_sm: { marginTop: Spacing.sm },
  mt_md: { marginTop: Spacing.md },
  mt_lg: { marginTop: Spacing.lg },
  
  mb_xs: { marginBottom: Spacing.xs },
  mb_sm: { marginBottom: Spacing.sm },
  mb_md: { marginBottom: Spacing.md },
  mb_lg: { marginBottom: Spacing.lg },
  
  mx_sm: { marginHorizontal: Spacing.sm },
  mx_md: { marginHorizontal: Spacing.md },
  mx_lg: { marginHorizontal: Spacing.lg },
  
  p_sm: { padding: Spacing.sm },
  p_md: { padding: Spacing.md },
  p_lg: { padding: Spacing.lg },
  
  px_sm: { paddingHorizontal: Spacing.sm },
  px_md: { paddingHorizontal: Spacing.md },
  px_lg: { paddingHorizontal: Spacing.lg },
  
  py_sm: { paddingVertical: Spacing.sm },
  py_md: { paddingVertical: Spacing.md },
  py_lg: { paddingVertical: Spacing.lg },
});
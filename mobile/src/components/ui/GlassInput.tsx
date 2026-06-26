import React, { forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors, spacing } from '../../theme';

interface GlassInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassInput = forwardRef<TextInput, GlassInputProps>(
  ({ label, error, containerStyle, leftIcon, rightIcon, onFocus, onBlur, ...props }, ref) => {
    const focusAnim = useSharedValue(0);

    const borderStyle = useAnimatedStyle(() => ({
      borderColor: error
        ? colors.error
        : interpolate(focusAnim.value, [0, 1], [0.3, 1]) > 0.7
          ? colors.primary
          : 'rgba(255,255,255,0.80)',
      shadowOpacity: interpolate(focusAnim.value, [0, 1], [0.06, 0.12]),
    }));

    const handleFocus = (e: any) => {
      focusAnim.value = withSpring(1, { damping: 15, stiffness: 200 });
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      focusAnim.value = withSpring(0, { damping: 15, stiffness: 200 });
      onBlur?.(e);
    };

    const Inner = (
      <View style={styles.inner}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          ref={ref}
          style={[styles.input, leftIcon && styles.inputWithLeft]}
          placeholderTextColor={colors.textTertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <Animated.View
          style={[
            styles.inputContainer,
            borderStyle,
            error && { borderColor: colors.error },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="light" style={styles.blur}>
              {Inner}
            </BlurView>
          ) : (
            <View style={styles.androidFallback}>{Inner}</View>
          )}
        </Animated.View>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  },
);

GlassInput.displayName = 'GlassInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.80)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 4,
  },
  blur: {
    borderRadius: 16,
  },
  androidFallback: {
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: spacing.base,
  },
  leftIcon: {
    marginRight: spacing.sm,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.text,
    letterSpacing: -0.41,
  },
  inputWithLeft: {
    marginLeft: 4,
  },
  error: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 4,
  },
});

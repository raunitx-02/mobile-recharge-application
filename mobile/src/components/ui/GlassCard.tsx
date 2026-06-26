import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { glassStyles, colors } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  intensity?: number;
  small?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  padding = 20,
  intensity = 80,
  small = false,
}) => {
  const baseStyle = small ? glassStyles.cardSmall : glassStyles.card;

  if (Platform.OS === 'ios') {
    return (
      <BlurView
        intensity={intensity}
        tint="light"
        style={[baseStyle, { overflow: 'hidden' }, style]}
      >
        <View style={{ padding }}>{children}</View>
      </BlurView>
    );
  }

  return (
    <View style={[baseStyle, { backgroundColor: 'rgba(255,255,255,0.92)', padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({});

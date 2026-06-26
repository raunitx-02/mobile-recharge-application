import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../theme';

interface OperatorCardProps {
  id: string;
  name: string;
  color: string;
  selected?: boolean;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export const OperatorCard: React.FC<OperatorCardProps> = ({
  id,
  name,
  color,
  selected = false,
  onSelect,
  compact = false,
}) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(id);
  };

  const initials = name.slice(0, 2).toUpperCase();

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.card,
          compact && styles.compact,
          selected && { borderColor: color, borderWidth: 2 },
        ]}
      >
        <View style={[styles.logo, { backgroundColor: color + '22' }]}>
          <Text style={[styles.logoText, { color }]}>{initials}</Text>
        </View>
        {!compact && <Text style={styles.name}>{name}</Text>}
        {selected && <View style={[styles.dot, { backgroundColor: color }]} />}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.80)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 72,
  },
  compact: {
    flexDirection: 'row',
    minWidth: 'auto',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logoText: {
    fontWeight: '700',
    fontSize: 14,
  },
  name: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  dot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

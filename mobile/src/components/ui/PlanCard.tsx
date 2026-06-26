import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme';

interface PlanCardProps {
  amount: number;
  validity: string;
  description: string;
  type: string;
  onSelect: (amount: number) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  amount, 
  validity, 
  description, 
  type, 
  onSelect 
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePress = () => {
    scale.value = withSpring(0.96, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 10 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(amount);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity 
        style={styles.card} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.amountContainer}>
            <Text style={styles.currency}>₹</Text>
            <Text style={styles.amount}>{amount}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{type.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.validity}>Validity: {validity}</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.footer}>
          <Text style={styles.selectText}>Select Plan</Text>
          <Text style={styles.arrow}>➔</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2
  },
  card: {
    padding: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  currency: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 2
  },
  amount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5
  },
  badge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary
  },
  validity: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8
  },
  description: {
    fontSize: 13,
    color: colors.textTertiary,
    lineHeight: 18,
    marginBottom: 16
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(60,60,67,0.08)',
    paddingTop: 12
  },
  selectText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  arrow: {
    fontSize: 14,
    color: colors.primary
  }
});

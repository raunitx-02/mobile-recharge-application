import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

interface BalanceCardProps {
  name: string;
  balance: number;
  onAddMoney?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({ name, balance, onAddMoney }) => {
  const [hidden, setHidden] = useState(false);
  const eyeScale = useSharedValue(1);

  const toggleVisibility = () => {
    eyeScale.value = withSpring(0.8, { damping: 10 }, () => {
      eyeScale.value = withSpring(1, { damping: 10 });
    });
    setHidden((prev) => !prev);
  };

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eyeScale.value }],
  }));

  const getInitials = (n: string) =>
    n
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  return (
    <Animated.View entering={FadeIn.duration(600)} style={styles.wrapper}>
      <LinearGradient
        colors={[colors.primary, colors.primaryLight, '#0A84FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Top row */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{name.split(' ')[0]} 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {hidden ? '₹ ••••••' : formatCurrency(balance)}
            </Text>
            <TouchableOpacity onPress={toggleVisibility} style={styles.eyeBtn}>
              <Animated.Text style={[styles.eyeIcon, eyeStyle]}>
                {hidden ? '🙈' : '👁️'}
              </Animated.Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Money */}
        <TouchableOpacity style={styles.addBtn} onPress={onAddMoney} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ Add Money</Text>
        </TouchableOpacity>

        {/* Decorative circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: spacing.base,
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: 28,
    padding: spacing.xl,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    marginTop: 2,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  balanceSection: {
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: -1,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 20,
  },
  addBtn: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.40)',
  },
  addBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: 20,
    right: 60,
  },
});

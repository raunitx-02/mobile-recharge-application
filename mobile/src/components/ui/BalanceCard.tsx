import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

// ─── Props ────────────────────────────────────────────────────────────────────

interface BalanceCardProps {
  name: string;
  balance: number;
  onAddMoney?: () => void;
  onWithdraw?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function formatBalance(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// ─── Component ────────────────────────────────────────────────────────────────

const BalanceCard: React.FC<BalanceCardProps> = ({ name, balance, onAddMoney, onWithdraw }) => {
  const [isHidden, setIsHidden] = useState(false);
  const eyeScale = useSharedValue(1);

  const eyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eyeScale.value }],
  }));

  const handleEyePress = useCallback(() => {
    eyeScale.value = withSpring(0.65, { damping: 5, stiffness: 400 }, () => {
      eyeScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
    setIsHidden((prev) => !prev);
  }, [eyeScale]);

  const formattedBalance = formatBalance(balance);
  const maskedBalance = '₹ • • • • • •';
  const displayBalance = isHidden ? maskedBalance : formattedBalance;

  return (
    <Animated.View entering={FadeInDown.duration(480).springify()} style={styles.wrapper}>
      <LinearGradient
        colors={['#06154A', '#0F2E92', '#1A5CCC', '#007AFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* ── Decorative circles ──────────────────────────── */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        {/* ── Top bar: brand left, avatar right ───────────── */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandName}>AetherPay</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
          </View>
        </View>

        {/* ── Balance label + amount + eye ────────────────── */}
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <View style={styles.balanceRow}>
          <Text
            style={styles.balanceAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
          >
            {displayBalance}
          </Text>
          <Pressable onPress={handleEyePress} hitSlop={14} style={styles.eyeBtn}>
            <Animated.Text style={[styles.eyeEmoji, eyeAnimatedStyle]}>
              {isHidden ? '🙈' : '👁️'}
            </Animated.Text>
          </Pressable>
        </View>

        {/* ── Cashback strip ──────────────────────────────── */}
        <View style={styles.cashbackStrip}>
          <Text style={styles.cashbackEmoji}>✨</Text>
          <Text style={styles.cashbackText}>₹89 cashback earned this month</Text>
        </View>

        {/* ── Divider ─────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Action buttons ──────────────────────────────── */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addBtn} onPress={onAddMoney} activeOpacity={0.85}>
            <Text style={styles.addBtnEmoji}>＋</Text>
            <Text style={styles.addBtnText}>Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.withdrawBtn} onPress={onWithdraw} activeOpacity={0.85}>
            <Text style={styles.withdrawBtnEmoji}>↑</Text>
            <Text style={styles.withdrawBtnText}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 28,
    shadowColor: '#1A4FCC',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.42,
    shadowRadius: 32,
    elevation: 18,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
  },
  // Decorative circles
  circle1: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  circle2: {
    position: 'absolute',
    top: 30,
    right: 50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  circle3: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  // Top row
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  brandName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  avatarInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Balance
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  balanceAmount: {
    flex: 1,
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.8,
    lineHeight: 50,
  },
  eyeBtn: {
    padding: 4,
  },
  eyeEmoji: {
    fontSize: 22,
  },
  // Cashback strip
  cashbackStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  cashbackEmoji: {
    fontSize: 13,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.13)',
    marginBottom: 20,
  },
  // Actions
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addBtnEmoji: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
    lineHeight: 20,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  withdrawBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'transparent',
  },
  withdrawBtnEmoji: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  withdrawBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BalanceCard;

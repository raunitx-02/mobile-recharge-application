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
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

// ─── Props ────────────────────────────────────────────────────────────────────

interface BalanceCardProps {
  name: string;
  balance: number;
  onAddMoney?: () => void;
  onWithdraw?: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function maskBalance(formatted: string): string {
  // Keep the ₹ symbol and replace digits with bullets
  return formatted.replace(/[\d,]/g, '•').replace(/••+/g, '••••••');
}

// ─── Component ────────────────────────────────────────────────────────────────

const BalanceCard: React.FC<BalanceCardProps> = ({
  name,
  balance,
  onAddMoney,
  onWithdraw,
}) => {
  const [isHidden, setIsHidden] = useState(false);

  // Animated spring scale for eye toggle
  const eyeScale = useSharedValue(1);

  const eyeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: eyeScale.value }],
  }));

  const handleEyePress = useCallback(() => {
    eyeScale.value = withSpring(0.75, { damping: 6, stiffness: 300 }, () => {
      eyeScale.value = withSpring(1, { damping: 8, stiffness: 250 });
    });
    setIsHidden((prev) => !prev);
  }, [eyeScale]);

  const formattedBalance = formatBalance(balance);
  const displayBalance = isHidden ? maskBalance(formattedBalance) : formattedBalance;

  return (
    <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.wrapper}>
      <LinearGradient
        colors={['#0A2463', '#1B4FCC', '#007AFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* ── Decorative Circles ──────────────────────────────── */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        <View style={styles.decorCircle3} />

        {/* ── Top Row: Brand + Avatar ──────────────────────────── */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandName}>AetherPay</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{getInitials(name)}</Text>
          </View>
        </View>

        {/* ── Balance Section ──────────────────────────────────── */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <View style={styles.balanceRow}>
            <Text
              style={styles.balanceAmount}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {displayBalance}
            </Text>
            <Pressable onPress={handleEyePress} hitSlop={12} style={styles.eyeButton}>
              <Animated.View style={eyeAnimatedStyle}>
                <Ionicons
                  name={isHidden ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="rgba(255,255,255,0.75)"
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* ── Divider ─────────────────────────────────────────── */}
        <View style={styles.divider} />

        {/* ── Bottom Row: Action Buttons ───────────────────────── */}
        <View style={styles.bottomRow}>
          <TouchableOpacity
            style={styles.addMoneyButton}
            onPress={onAddMoney}
            activeOpacity={0.85}
          >
            <Ionicons name="add-circle-outline" size={18} color="#007AFF" style={{ marginRight: 6 }} />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={onWithdraw}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-down-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.withdrawText}>Withdraw</Text>
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
    // Shadow
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 28,
    elevation: 16,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },

  // Decorative Circles
  decorCircle1: {
    position: 'absolute',
    top: -70,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 40,
    right: 60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: -40,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Top Row
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  // Balance
  balanceSection: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceAmount: {
    flex: 1,
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    lineHeight: 52,
  },
  eyeButton: {
    padding: 4,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 20,
  },

  // Bottom Buttons
  bottomRow: {
    flexDirection: 'row',
    gap: 12,
  },
  addMoneyButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.1,
  },
  withdrawButton: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  withdrawText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.1,
  },
});

export default BalanceCard;

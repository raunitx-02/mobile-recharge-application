import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface BalanceCardProps {
  name: string;
  balance: number;  // cashback balance
  onAddMoney?: () => void;
  onWithdraw?: () => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
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

const BalanceCard: React.FC<BalanceCardProps> = ({ name, balance, onAddMoney, onWithdraw }) => {
  const [isHidden, setIsHidden] = useState(false);
  const eyeScale = useSharedValue(1);

  const eyeAnim = useAnimatedStyle(() => ({
    transform: [{ scale: eyeScale.value }],
  }));

  const handleEyePress = useCallback(() => {
    eyeScale.value = withSpring(0.65, { damping: 5, stiffness: 400 }, () => {
      eyeScale.value = withSpring(1, { damping: 10, stiffness: 200 });
    });
    setIsHidden((p) => !p);
  }, [eyeScale]);

  const formatted = formatBalance(balance);
  const display   = isHidden ? '₹ ● ● ● ● ●' : formatted;

  return (
    <Animated.View entering={FadeInDown.duration(480).springify()} style={styles.wrapper}>
      <LinearGradient
        colors={['#064E3B', '#065F46', '#047857', '#10B981']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1.2 }}
        style={styles.card}
      >
        {/* Decorative circles */}
        <View style={[styles.deco, { width: 240, height: 240, top: -80, right: -70 }]} />
        <View style={[styles.deco, { width: 140, height: 140, top: 30,  left: -50 }]} />
        <View style={[styles.deco, { width: 100, height: 100, bottom: -30, right: 60 }]} />

        {/* Header */}
        <View style={styles.topRow}>
          <View style={styles.brandRow}>
            <View style={styles.brandDot} />
            <Text style={styles.brandText}>OPTIONS PAY WALLET</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        </View>

        {/* Balance */}
        <Text style={styles.balLabel}>Available Wallet Balance</Text>
        <View style={styles.balRow}>
          <Text
            style={styles.balAmount}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {display}
          </Text>
          <Pressable onPress={handleEyePress} hitSlop={14} style={styles.eyeBtn}>
            <Animated.Text style={[styles.eyeEmoji, eyeAnim]}>
              {isHidden ? '🙈' : '👁️'}
            </Animated.Text>
          </Pressable>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {onAddMoney && (
            <TouchableOpacity onPress={onAddMoney} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>➕ Add Money</Text>
            </TouchableOpacity>
          )}
          {onWithdraw && (
            <TouchableOpacity onPress={onWithdraw} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>📤 Withdraw</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 28,
    shadowColor: '#047857',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.38,
    shadowRadius: 30,
    elevation: 18,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
  },
  deco: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brandDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)' },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1.2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },

  balLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  balRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  balAmount: {
    flex: 1,
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    lineHeight: 44,
  },
  eyeBtn: { padding: 4 },
  eyeEmoji: { fontSize: 22 },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default BalanceCard;

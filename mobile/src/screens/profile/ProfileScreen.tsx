import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import Toast from 'react-native-toast-message';

export const ProfileScreen: React.FC = () => {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      'Logout Session',
      'Are you sure you want to end AetherPay session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await clearAuth();
            Toast.show({
              type: 'info',
              text1: 'Logged Out',
              text2: 'Session closed successfully'
            });
          }
        }
      ]
    );
  };

  const getInitials = (n: string) => {
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name ? getInitials(user.name) : 'AP'}</Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Agent'}</Text>
        <Text style={styles.phone}>+91 {user?.phone || '9876543210'}</Text>
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>KYC Status</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{user?.kycStatus?.toUpperCase() || 'PENDING'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Referral Code</Text>
          <Text style={styles.val}>{user?.referralCode || 'AETHER12'}</Text>
        </View>
      </GlassCard>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Close Session & Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 80
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 16
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff'
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5
  },
  phone: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  card: {
    padding: 20,
    gap: 16,
    marginBottom: 24
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,60,67,0.06)',
    paddingBottom: 12
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500'
  },
  val: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  badge: {
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.warning
  },
  logoutBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error
  }
});

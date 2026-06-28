import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, Share } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import Toast from 'react-native-toast-message';

export const ProfileScreen: React.FC = () => {
  const { user, setUser, clearAuth } = useAuthStore();
  
  // Views: 'main' | 'refer' | 'policy'
  const [activeView, setActiveView] = useState<'main' | 'refer' | 'policy'>('main');
  const [policyType, setPolicyType] = useState<'about' | 'privacy' | 'terms' | 'refund'>('about');

  // Edit Profile Modal
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  // KYC Modal
  const [kycModal, setKycModal] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const getInitials = (n: string) => {
    return n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout Session',
      'Are you sure you want to log out of AetherPay?',
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

  const handleSaveProfile = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name Required', text2: 'Please enter your full name' });
      return;
    }
    setUser({ ...user, name, email });
    setEditModal(false);
    Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Personal details updated successfully' });
  };

  const handleKycVerify = () => {
    if (panNumber.length !== 10) {
      Toast.show({ type: 'error', text1: 'Invalid PAN', text2: 'Please enter a valid 10-character PAN number' });
      return;
    }
    if (aadhaarNumber.length !== 12) {
      Toast.show({ type: 'error', text1: 'Invalid Aadhaar', text2: 'Aadhaar must be exactly 12 digits' });
      return;
    }

    setKycLoading(true);
    setTimeout(() => {
      setUser({ ...user, kycStatus: 'verified' });
      setKycLoading(false);
      setKycModal(false);
      Alert.alert('KYC Completed ✅', 'Your Aadhaar & PAN details have been verified successfully. KYC status is now active.');
    }, 1500);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Join AetherPay and earn instant wallet cashbacks on all utility bills and recharges! Use my code: ${user?.referralCode || 'AETHER12'}`
      });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to trigger share sheet' });
    }
  };

  const getPolicyContent = () => {
    switch (policyType) {
      case 'about':
        return {
          title: 'About AetherPay',
          text: 'AetherPay is India’s next-generation digital payments platform, designed to make recharges and utility bill payments fast, simple, and rewarding. Our platform handles processing for telecom prepaid/postpaid, DTH connections, electricity board bills, domestic gas pipelines, water connections, broadband subscriptions, FASTag top-ups, and direct landlord rental payments. AetherPay is powered by secure APIs to ensure zero-failure transaction rates.'
        };
      case 'privacy':
        return {
          title: 'Privacy Policy',
          text: 'At AetherPay, we take your privacy seriously. All user credentials and passwords are encrypted using strong industry algorithms. We collect and store phone numbers, emails, and transaction history solely to process billing operations, handle merchant settlements, and credit earned wallet cashbacks. Your personal identifying data is never shared with third-party advertising companies.'
        };
      case 'terms':
        return {
          title: 'Terms & Conditions',
          text: 'By registering and funding your AetherPay wallet, you agree to comply with our general usage terms. Users must complete KYC verification (PAN and Aadhaar validation) before being permitted to withdraw earned cashbacks into their UPI or bank accounts. Wallet balances loaded via debit/credit card or net banking are non-refundable and must be utilized for utility recharges.'
        };
      case 'refund':
        return {
          title: 'Refund Policy',
          text: 'Recharge failures are automatically detected by our system. If an aggregator API provider rejects a transaction, the debited amount is instantly refunded back to your AetherPay wallet. Once a recharge is successfully credited by the telecom carrier or biller board, no refund requests can be processed.'
        };
    }
  };

  if (activeView === 'refer') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setActiveView('main')} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Profile</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>Refer & Earn Program</Text>
          <Text style={styles.subtitle}>Invite friends to pay bills and earn unlimited cash back credits.</Text>
        </View>

        <GlassCard style={styles.referCard}>
          <Text style={styles.referLabel}>Your Referral Code</Text>
          <Text style={styles.referCode}>{user?.referralCode || 'AETHER12'}</Text>
          <GlassButton title="Share Invite Link" onPress={handleShareReferral} />
        </GlassCard>

        <Text style={styles.sectionTitle}>How it works</Text>
        <GlassCard style={styles.card}>
          <View style={styles.step}>
            <Text style={styles.stepNum}>1</Text>
            <Text style={styles.stepText}>Share your referral link or code with your friends.</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>2</Text>
            <Text style={styles.stepText}>Your friend signs up on AetherPay and completes their KYC verification.</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNum}>3</Text>
            <Text style={styles.stepText}>Once they perform their first recharge or bill payment of ₹100 or more, you both get ₹50 cashback credited to your wallets!</Text>
          </View>
        </GlassCard>
      </ScrollView>
    );
  }

  if (activeView === 'policy') {
    const policy = getPolicyContent();
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => setActiveView('main')} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Profile</Text>
        </TouchableOpacity>
        
        <View style={styles.header}>
          <Text style={styles.title}>{policy.title}</Text>
        </View>

        <GlassCard style={styles.card}>
          <Text style={styles.policyText}>{policy.text}</Text>
        </GlassCard>
      </ScrollView>
    );
  }

  const isKycVerified = user?.kycStatus === 'verified';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name ? getInitials(name) : 'AP'}</Text>
        </View>
        <Text style={styles.name}>{name || 'User'}</Text>
        <Text style={styles.phone}>+91 {user?.phone || '7292858748'}</Text>
      </View>

      <GlassCard style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>KYC Status</Text>
          <View style={[styles.badge, { backgroundColor: isKycVerified ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 159, 10, 0.1)' }]}>
            <Text style={[styles.badgeText, { color: isKycVerified ? colors.success : colors.warning }]}>
              {user?.kycStatus?.toUpperCase() || 'PENDING'}
            </Text>
          </View>
        </View>

        {!isKycVerified && (
          <TouchableOpacity style={styles.kycActionBtn} onPress={() => setKycModal(true)}>
            <Text style={styles.kycActionText}>⚡ Complete KYC Verification</Text>
          </TouchableOpacity>
        )}
      </GlassCard>

      <Text style={styles.sectionTitle}>Account Options</Text>
      <GlassCard style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={() => setEditModal(true)}>
          <Text style={styles.menuText}>👤 Edit Personal Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => setActiveView('refer')}>
          <Text style={styles.menuText}>🎁 Refer & Earn Rewards</Text>
        </TouchableOpacity>
      </GlassCard>

      <Text style={styles.sectionTitle}>Information & Policies</Text>
      <GlassCard style={styles.card}>
        <TouchableOpacity style={styles.menuItem} onPress={() => { setPolicyType('about'); setActiveView('policy'); }}>
          <Text style={styles.menuText}>ℹ️ About Us</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { setPolicyType('privacy'); setActiveView('policy'); }}>
          <Text style={styles.menuText}>🔒 Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { setPolicyType('terms'); setActiveView('policy'); }}>
          <Text style={styles.menuText}>📜 Terms & Conditions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => { setPolicyType('refund'); setActiveView('policy'); }}>
          <Text style={styles.menuText}>💸 Refund Policy</Text>
        </TouchableOpacity>
      </GlassCard>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Close Session & Logout</Text>
      </TouchableOpacity>
      
      {/* Edit Profile Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <GlassInput label="Full Name" value={name} onChangeText={setName} placeholder="John Doe" icon="👤" />
            <GlassInput label="Email Address" value={email} onChangeText={setEmail} placeholder="john@example.com" keyboardType="email-address" icon="✉️" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{flex: 1}}>
                <GlassButton title="Save Changes" onPress={handleSaveProfile} />
              </View>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* KYC Modal */}
      <Modal visible={kycModal} transparent animationType="slide">
        <View style={styles.modalBg}>
          <GlassCard style={styles.modalCard}>
            <Text style={styles.modalTitle}>Identity Verification (KYC)</Text>
            <Text style={styles.modalSubtitle}>Please enter valid credentials to unlock wallet cashbacks and bank withdrawals.</Text>
            <GlassInput label="PAN Card Number" value={panNumber} onChangeText={(t) => setPanNumber(t.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} autoCapitalize="characters" icon="💳" />
            <GlassInput label="Aadhaar Card Number" value={aadhaarNumber} onChangeText={(t) => setAadhaarNumber(t.replace(/[^0-9]/g, ''))} placeholder="1234 5678 9012" maxLength={12} keyboardType="numeric" icon="🪪" />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setKycModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <View style={{flex: 1}}>
                <GlassButton title="Submit & Verify" onPress={handleKycVerify} loading={kycLoading} />
              </View>
            </View>
          </GlassCard>
        </View>
      </Modal>

      <View style={styles.footerSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    padding: 20,
    paddingTop: 60,
    gap: 16
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)',
    marginBottom: 10
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  header: {
    alignItems: 'center',
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 12
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
    gap: 16
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  val: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800'
  },
  kycActionBtn: {
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4
  },
  kycActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
    letterSpacing: -0.2
  },
  menuItem: {
    paddingVertical: 4
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  logoutBtn: {
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.error
  },
  referCard: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(52, 199, 89, 0.04)',
    borderColor: 'rgba(52, 199, 89, 0.08)'
  },
  referLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  referCode: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.success,
    letterSpacing: 2
  },
  step: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start'
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,122,255,0.08)',
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 24
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  },
  policyText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20
  },
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16
  },
  modalCard: {
    padding: 24,
    gap: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5
  },
  modalSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginBottom: 8
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 12
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.04)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary
  },
  footerSpacing: {
    height: 100
  }
});

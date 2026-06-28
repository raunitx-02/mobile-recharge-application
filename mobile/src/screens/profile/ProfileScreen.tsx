import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Share,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/auth.store';
import Toast from 'react-native-toast-message';
import { colors } from '../../theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getInitials = (n: string): string =>
  n
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ---------------------------------------------------------------------------
// Policy content
// ---------------------------------------------------------------------------

type PolicyType = 'about' | 'privacy' | 'terms' | 'refund';

const POLICY_CONTENT: Record<PolicyType, { title: string; text: string }> = {
  about: {
    title: 'About AetherPay',
    text: 'AetherPay is India\u2019s next-generation digital payments platform, designed to make recharges and utility bill payments fast, simple, and rewarding. Our platform handles processing for telecom prepaid/postpaid, DTH connections, electricity board bills, domestic gas pipelines, water connections, broadband subscriptions, FASTag top-ups, and direct landlord rental payments. AetherPay is powered by secure APIs to ensure zero-failure transaction rates.',
  },
  privacy: {
    title: 'Privacy Policy',
    text: 'At AetherPay, we take your privacy seriously. All user credentials and passwords are encrypted using strong industry algorithms. We collect and store phone numbers, emails, and transaction history solely to process billing operations, handle merchant settlements, and credit earned wallet cashbacks. Your personal identifying data is never shared with third-party advertising companies.',
  },
  terms: {
    title: 'Terms & Conditions',
    text: 'By registering and funding your AetherPay wallet, you agree to comply with our general usage terms. Users must complete KYC verification (PAN and Aadhaar validation) before being permitted to withdraw earned cashbacks into their UPI or bank accounts. Wallet balances loaded via debit/credit card or net banking are non-refundable and must be utilized for utility recharges.',
  },
  refund: {
    title: 'Refund Policy',
    text: 'Recharge failures are automatically detected by our system. If an aggregator API provider rejects a transaction, the debited amount is instantly refunded back to your AetherPay wallet. Once a recharge is successfully credited by the telecom carrier or biller board, no refund requests can be processed.',
  },
};

// ---------------------------------------------------------------------------
// MenuRow component
// ---------------------------------------------------------------------------

interface MenuRowProps {
  emoji: string;
  iconBg: string;
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

const MenuRow: React.FC<MenuRowProps> = ({ emoji, iconBg, label, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.menuRow, isLast && styles.menuRowLast]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.menuIcon, { backgroundColor: iconBg }]}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
    <Text style={styles.menuChevron}>{'\u203a'}</Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Refer & Earn View
// ---------------------------------------------------------------------------

interface ReferViewProps {
  referralCode: string;
  onBack: () => void;
  onShare: () => void;
}

const ReferView: React.FC<ReferViewProps> = ({ referralCode, onBack, onShare }) => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.subViewScroll}
    showsVerticalScrollIndicator={false}
  >
    <StatusBar barStyle="dark-content" />
    <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
      <Text style={styles.backText}>{'\u2039'}  Back to Profile</Text>
    </TouchableOpacity>

    <Text style={styles.subViewTitle}>Refer &amp; Earn</Text>
    <Text style={styles.subViewSubtitle}>
      Invite friends to AetherPay and earn unlimited wallet cashbacks!
    </Text>

    {/* Referral code card */}
    <LinearGradient
      colors={['#34C759', '#30B0C7']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.referCard}
    >
      <View style={[styles.referCircle, { width: 160, height: 160, top: -40, right: -40 }]} />
      <View style={[styles.referCircle, { width: 100, height: 100, bottom: -20, left: -20 }]} />

      <Text style={styles.referLabelText}>Your Referral Code</Text>
      <Text style={styles.referCodeText}>{referralCode}</Text>

      <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.85}>
        <Text style={styles.shareBtnText}>&#128640;  Share Now</Text>
      </TouchableOpacity>
    </LinearGradient>

    {/* Steps */}
    <Text style={styles.sectionTitle}>How it works</Text>
    <View style={styles.card}>
      {[
        'Share your referral code or link with friends.',
        'Your friend signs up on AetherPay and completes KYC verification.',
        'Once they do their first recharge/bill payment of \u20b9100+, you both earn \u20b950 cashback!',
      ].map((text, i) => (
        <View key={i} style={[styles.step, i < 2 && styles.stepBorder]}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNum}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{text}</Text>
        </View>
      ))}
    </View>

    <View style={styles.footerSpacingView} />
  </ScrollView>
);

// ---------------------------------------------------------------------------
// Policy View
// ---------------------------------------------------------------------------

interface PolicyViewProps {
  type: PolicyType;
  onBack: () => void;
}

const PolicyView: React.FC<PolicyViewProps> = ({ type, onBack }) => {
  const { title, text } = POLICY_CONTENT[type];
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.subViewScroll}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Text style={styles.backText}>{'\u2039'}  Back to Profile</Text>
      </TouchableOpacity>

      <Text style={styles.subViewTitle}>{title}</Text>

      <View style={styles.card}>
        <Text style={styles.policyText}>{text}</Text>
      </View>

      <View style={styles.footerSpacingView} />
    </ScrollView>
  );
};

// ---------------------------------------------------------------------------
// Main ProfileScreen
// ---------------------------------------------------------------------------

export const ProfileScreen: React.FC = () => {
  const { user, setUser, clearAuth } = useAuthStore();

  const [activeView, setActiveView] = useState<'main' | 'refer' | 'policy'>('main');
  const [policyType, setPolicyType] = useState<PolicyType>('about');

  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [kycModal, setKycModal] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const isKycVerified = user?.kycStatus === 'verified';
  const displayName = user?.name || name || 'User';
  const displayPhone = user?.phone || '';
  const referCode = user?.referralCode || 'AETH12';

  const handleLogout = () => {
    Alert.alert('Logout Session', 'Are you sure you want to log out of AetherPay?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await clearAuth();
          Toast.show({ type: 'info', text1: 'Logged Out', text2: 'Session closed successfully' });
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Name Required', text2: 'Please enter your full name' });
      return;
    }
    setUser({ ...user, name: name.trim(), email: email.trim() });
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
      Alert.alert('KYC Completed \u2705', 'Your Aadhaar & PAN details have been verified successfully. KYC status is now active.');
    }, 1500);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Join AetherPay and earn instant wallet cashbacks on all utility bills and recharges! Use my code: ${referCode}`,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to trigger share sheet' });
    }
  };

  if (activeView === 'refer') {
    return (
      <ReferView
        referralCode={referCode}
        onBack={() => setActiveView('main')}
        onShare={handleShareReferral}
      />
    );
  }

  if (activeView === 'policy') {
    return <PolicyView type={policyType} onBack={() => setActiveView('main')} />;
  }

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO GRADIENT CARD ─────────────────────────────────────── */}
        <LinearGradient
          colors={['#0A2463', '#1B4FCC', '#007AFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          {/* Decorative circles */}
          <View style={[styles.decCircle, { width: 180, height: 180, top: -50, right: -50 }]} />
          <View style={[styles.decCircle, { width: 120, height: 120, top: 60, left: -40 }]} />
          <View style={[styles.decCircle, { width: 80, height: 80, bottom: 20, right: 80 }]} />

          {/* Top row: title + edit */}
          <View style={styles.heroTopRow}>
            <Text style={styles.heroTitle}>Profile</Text>
            <TouchableOpacity
              onPress={() => {
                setName(user?.name || '');
                setEmail(user?.email || '');
                setEditModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.heroEditBtn}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.heroAvatarWrap}>
            <View style={styles.heroAvatar}>
              <Text style={styles.heroAvatarText}>
                {displayName ? getInitials(displayName) : 'AP'}
              </Text>
            </View>
          </View>

          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroPhone}>+91 {displayPhone}</Text>

          {/* KYC badge */}
          <View
            style={[
              styles.kycBadge,
              {
                backgroundColor: isKycVerified
                  ? 'rgba(52,199,89,0.85)'
                  : 'rgba(255,149,0,0.85)',
              },
            ]}
          >
            <Text style={styles.kycBadgeText}>
              {isKycVerified ? 'VERIFIED ✓' : 'PENDING ⚠️'}
            </Text>
          </View>
        </LinearGradient>

        {/* ── OVERVIEW STAT CARDS ────────────────────────────────────── */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>Jun 2025</Text>
            <Text style={styles.statLabel}>Member Since</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
        </View>

        {/* ── ACCOUNT SECTION ────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.listCard}>
          <MenuRow
            emoji="👤"
            iconBg="#EAF3FF"
            label="Edit Profile"
            onPress={() => {
              setName(user?.name || '');
              setEmail(user?.email || '');
              setEditModal(true);
            }}
          />
          {!isKycVerified && (
            <MenuRow
              emoji="🛡️"
              iconBg="#FFF6EA"
              label="Complete KYC"
              onPress={() => setKycModal(true)}
            />
          )}
          <MenuRow
            emoji="🎁"
            iconBg="#EAFFF0"
            label="Refer & Earn"
            onPress={() => setActiveView('refer')}
          />
          <MenuRow
            emoji="🔔"
            iconBg="#F3EAFF"
            label="Notifications"
            onPress={() =>
              Toast.show({ type: 'info', text1: 'Notifications', text2: 'All notifications are enabled' })
            }
            isLast
          />
        </View>

        {/* ── POLICIES SECTION ───────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Policies</Text>
        <View style={styles.listCard}>
          <MenuRow
            emoji="ℹ️"
            iconBg="#F2F2F7"
            label="About Us"
            onPress={() => { setPolicyType('about'); setActiveView('policy'); }}
          />
          <MenuRow
            emoji="🔒"
            iconBg="#F2F2F7"
            label="Privacy Policy"
            onPress={() => { setPolicyType('privacy'); setActiveView('policy'); }}
          />
          <MenuRow
            emoji="📜"
            iconBg="#F2F2F7"
            label="Terms & Conditions"
            onPress={() => { setPolicyType('terms'); setActiveView('policy'); }}
          />
          <MenuRow
            emoji="💸"
            iconBg="#F2F2F7"
            label="Refund Policy"
            onPress={() => { setPolicyType('refund'); setActiveView('policy'); }}
            isLast
          />
        </View>

        {/* ── SUPPORT SECTION ────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.listCard}>
          <MenuRow
            emoji="🎧"
            iconBg="#EAF8F8"
            label="Help & Support"
            onPress={() =>
              Toast.show({ type: 'info', text1: 'Help & Support', text2: 'Connecting you to our support team…' })
            }
          />
          <MenuRow
            emoji="⭐"
            iconBg="#FFFBEA"
            label="Rate AetherPay"
            onPress={() =>
              Toast.show({ type: 'success', text1: 'Thank you!', text2: 'Redirecting to app store\u2026' })
            }
            isLast
          />
        </View>

        {/* ── LOGOUT ─────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footerSpacingView} />
      </ScrollView>

      {/* ── EDIT PROFILE MODAL ─────────────────────────────────────── */}
      <Modal visible={editModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.modalSubtitle}>Update your personal details below.</Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              placeholderTextColor="#C7C7CC"
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              placeholderTextColor="#C7C7CC"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── KYC MODAL ──────────────────────────────────────────────── */}
      <Modal visible={kycModal} transparent animationType="slide" statusBarTranslucent>
        <View style={styles.modalBg}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Identity Verification (KYC)</Text>
            <Text style={styles.modalSubtitle}>
              Enter valid credentials to unlock wallet cashbacks &amp; bank withdrawals.
            </Text>

            <Text style={styles.inputLabel}>PAN Card Number</Text>
            <TextInput
              style={styles.input}
              value={panNumber}
              onChangeText={(t) => setPanNumber(t.toUpperCase())}
              placeholder="ABCDE1234F"
              placeholderTextColor="#C7C7CC"
              autoCapitalize="characters"
              maxLength={10}
              returnKeyType="next"
            />

            <Text style={styles.inputLabel}>Aadhaar Number</Text>
            <TextInput
              style={styles.input}
              value={aadhaarNumber}
              onChangeText={(t) => setAadhaarNumber(t.replace(/[^0-9]/g, ''))}
              placeholder="1234 5678 9012"
              placeholderTextColor="#C7C7CC"
              keyboardType="numeric"
              maxLength={12}
              returnKeyType="done"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setKycModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, kycLoading && styles.modalSaveBtnLoading]}
                onPress={handleKycVerify}
                activeOpacity={0.85}
                disabled={kycLoading}
              >
                <LinearGradient
                  colors={['#1B4FCC', '#007AFF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.kycGradientBtn}
                >
                  <Text style={styles.modalSaveText}>
                    {kycLoading ? 'Verifying\u2026' : 'Verify & Submit'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  mainScroll: {
    paddingBottom: 0,
  },
  subViewScroll: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Back button
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },

  // Sub-view headings
  subViewTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.6,
    marginBottom: 6,
  },
  subViewSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 24,
  },

  // Hero card
  heroCard: {
    height: 220,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: Platform.OS === 'ios' ? 56 : 36,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  decCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroEditBtn: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  heroAvatarWrap: {
    marginBottom: 8,
  },
  heroAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  heroAvatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1B4FCC',
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  heroPhone: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.70)',
    marginBottom: 10,
  },
  kycBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  kycBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },

  // Stat cards
  statRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },

  // Section title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },

  // List card (grouped)
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },

  // Menu row
  menuRow: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,60,67,0.08)',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  menuChevron: {
    fontSize: 22,
    color: '#C7C7CC',
    fontWeight: '400',
  },

  // Logout
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,59,48,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },

  // Footer spacing
  footerSpacingView: {
    height: 110,
  },

  // Referral card
  referCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    overflow: 'hidden',
  },
  referCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  referLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.80)',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  referCodeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 4,
    marginBottom: 20,
  },
  shareBtn: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.50)',
  },
  shareBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Steps card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingBottom: 16,
  },
  stepBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,60,67,0.08)',
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '800',
    color: '#007AFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 20,
  },

  // Policy
  policyText: {
    fontSize: 14,
    color: '#3C3C43',
    lineHeight: 22,
  },

  // Modal
  modalBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(60,60,67,0.18)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#3C3C43',
    marginBottom: 6,
    marginTop: 4,
  },
  input: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.1)',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3C3C43',
  },
  modalSaveBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalSaveBtnLoading: {
    opacity: 0.7,
  },
  kycGradientBtn: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 26,
  },
  modalSaveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

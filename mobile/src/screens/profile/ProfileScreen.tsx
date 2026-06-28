import React, { useState, useRef } from 'react';
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
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/auth.store';
import Toast from 'react-native-toast-message';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const getInitials = (n: string): string =>
  n
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

// ─────────────────────────────────────────────────────────────────────────────
// Policy Data
// ─────────────────────────────────────────────────────────────────────────────

type PolicyType = 'about' | 'privacy' | 'terms' | 'refund';

const POLICY: Record<PolicyType, { title: string; text: string }> = {
  about: {
    title: 'About AetherPay',
    text: 'AetherPay is India\u2019s next-generation digital payments platform, designed to make recharges and utility bill payments fast, simple, and rewarding. Our platform handles telecom prepaid/postpaid, DTH, electricity boards, gas pipelines, water connections, broadband, FASTag top-ups, and direct rent payments. Powered by secure BBPS APIs to ensure zero-failure transaction rates and instant cashbacks.',
  },
  privacy: {
    title: 'Privacy Policy',
    text: 'We take your privacy seriously. All credentials are encrypted using AES-256. We collect phone numbers, emails, and transaction history solely to process billing operations, merchant settlements, and credit wallet cashbacks. Your personal data is never sold or shared with third-party advertisers.',
  },
  terms: {
    title: 'Terms & Conditions',
    text: 'By registering on AetherPay, you agree to our usage terms. KYC verification (PAN + Aadhaar) is mandatory before withdrawing earned cashbacks into UPI or bank accounts. Wallet balances loaded via cards or net banking are non-refundable and must be used for utility recharges.',
  },
  refund: {
    title: 'Refund Policy',
    text: 'Recharge failures are automatically detected. If an aggregator API rejects a transaction, the debited amount is instantly refunded to your AetherPay wallet. Once a recharge is successfully credited by the telecom carrier or biller, no refunds can be processed.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Reusable Components
// ─────────────────────────────────────────────────────────────────────────────

interface MenuRowProps {
  emoji: string;
  iconBg: string;
  label: string;
  sublabel?: string;
  onPress: () => void;
  isLast?: boolean;
  badge?: string;
}

const MenuRow: React.FC<MenuRowProps> = ({
  emoji, iconBg, label, sublabel, onPress, isLast, badge,
}) => (
  <TouchableOpacity
    style={[styles.menuRow, isLast && styles.menuRowLast]}
    onPress={onPress}
    activeOpacity={0.65}
  >
    <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
    </View>
    <View style={styles.menuTextWrap}>
      <Text style={styles.menuLabel}>{label}</Text>
      {sublabel ? <Text style={styles.menuSublabel}>{sublabel}</Text> : null}
    </View>
    {badge ? (
      <View style={styles.menuBadge}>
        <Text style={styles.menuBadgeText}>{badge}</Text>
      </View>
    ) : (
      <Text style={styles.menuChevron}>›</Text>
    )}
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Views (Refer & Earn, Policy)
// ─────────────────────────────────────────────────────────────────────────────

const ReferView: React.FC<{ code: string; onBack: () => void; onShare: () => void }> = ({
  code, onBack, onShare,
}) => (
  <ScrollView
    style={styles.container}
    contentContainerStyle={styles.subScroll}
    showsVerticalScrollIndicator={false}
  >
    <StatusBar barStyle="dark-content" />
    <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
      <Text style={styles.backBtnText}>‹  Back to Profile</Text>
    </TouchableOpacity>
    <Text style={styles.subTitle}>Refer & Earn</Text>
    <Text style={styles.subSubtitle}>
      Invite friends and earn ₹50 cashback for every successful referral!
    </Text>

    <LinearGradient
      colors={['#1AAF5D', '#0DAFB8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.referCard}
    >
      <View style={[styles.circle, { width: 200, height: 200, top: -60, right: -60 }]} />
      <View style={[styles.circle, { width: 120, height: 120, bottom: -30, left: -30 }]} />
      <Text style={styles.referLabel}>Your Referral Code</Text>
      <Text style={styles.referCode}>{code}</Text>
      <TouchableOpacity style={styles.shareBtn} onPress={onShare} activeOpacity={0.85}>
        <Text style={styles.shareBtnText}>🚀  Share & Earn</Text>
      </TouchableOpacity>
    </LinearGradient>

    <Text style={[styles.sectionLabel, { marginTop: 28 }]}>How It Works</Text>
    <View style={styles.card}>
      {[
        ['Share your referral code with friends.', '1'],
        ['Friend signs up & completes KYC verification.', '2'],
        ['They make a ₹100+ recharge — you both earn ₹50!', '3'],
      ].map(([text, num], i) => (
        <View key={num} style={[styles.step, i < 2 && styles.stepDivider]}>
          <View style={styles.stepNum}><Text style={styles.stepNumText}>{num}</Text></View>
          <Text style={styles.stepText}>{text}</Text>
        </View>
      ))}
    </View>
    <View style={{ height: 120 }} />
  </ScrollView>
);

const PolicyView: React.FC<{ type: PolicyType; onBack: () => void }> = ({ type, onBack }) => {
  const { title, text } = POLICY[type];
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.subScroll}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
        <Text style={styles.backBtnText}>‹  Back to Profile</Text>
      </TouchableOpacity>
      <Text style={styles.subTitle}>{title}</Text>
      <View style={styles.card}>
        <Text style={styles.policyText}>{text}</Text>
      </View>
      <View style={{ height: 120 }} />
    </ScrollView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Input Row (for modals)
// ─────────────────────────────────────────────────────────────────────────────

interface InputRowProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
  editable?: boolean;
  sublabel?: string;
  prefix?: string;
}

const InputRow: React.FC<InputRowProps> = ({
  label, value, onChangeText, placeholder, keyboardType = 'default',
  autoCapitalize = 'words', maxLength, editable = true, sublabel, prefix,
}) => (
  <View style={styles.inputWrap}>
    <Text style={styles.inputLabel}>{label}</Text>
    {sublabel ? <Text style={styles.inputSublabel}>{sublabel}</Text> : null}
    <View style={[styles.inputBox, !editable && styles.inputBoxDisabled]}>
      {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
      <TextInput
        style={[styles.input, prefix ? { paddingLeft: 0 } : null]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#AEAEB2"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
        editable={editable}
        returnKeyType="next"
      />
    </View>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export const ProfileScreen: React.FC = () => {
  const { user, setUser, clearAuth } = useAuthStore();

  // View state
  const [activeView, setActiveView] = useState<'main' | 'refer' | 'policy'>('main');
  const [policyType, setPolicyType] = useState<PolicyType>('about');

  // Edit profile modal
  const [editModal, setEditModal] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '7292858748');

  // KYC modal
  const [kycModal, setKycModal] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [kycLoading, setKycLoading] = useState(false);

  const isKycVerified = user?.kycStatus === 'verified';
  const displayName = user?.name || name || 'User';
  const displayPhone = user?.phone || phone || '7292858748';
  const referCode = user?.referralCode ?? 'AETH12';

  // ── Handlers ────────────────────────────────────────────────────────────

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
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length !== 10) {
      Toast.show({ type: 'error', text1: 'Invalid Number', text2: 'Phone must be exactly 10 digits' });
      return;
    }
    setUser({ ...user, name: name.trim(), email: email.trim(), phone: cleaned });
    setEditModal(false);
    Toast.show({ type: 'success', text1: 'Profile Updated', text2: 'Changes saved successfully' });
  };

  const handleKycVerify = () => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(panNumber)) {
      Toast.show({ type: 'error', text1: 'Invalid PAN', text2: 'Format: ABCDE1234F' });
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
      Alert.alert('KYC Verified ✅', 'Your identity has been verified. You can now withdraw wallet cashbacks.');
    }, 1600);
  };

  const handleShareReferral = async () => {
    try {
      await Share.share({
        message: `Join AetherPay — India's best recharge & bill payment app. Use my code ${referCode} and earn ₹50 cashback on your first recharge! Download: https://aetherpay.in/r/${referCode}`,
      });
    } catch {
      Toast.show({ type: 'error', text1: 'Could not open share sheet' });
    }
  };

  // ── Sub-views ─────────────────────────────────────────────────────────────

  if (activeView === 'refer') {
    return <ReferView code={referCode} onBack={() => setActiveView('main')} onShare={handleShareReferral} />;
  }
  if (activeView === 'policy') {
    return <PolicyView type={policyType} onBack={() => setActiveView('main')} />;
  }

  // ── Main view ─────────────────────────────────────────────────────────────

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.mainScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ HERO GRADIENT HEADER ═══ */}
        <LinearGradient
          colors={['#06154A', '#0F2E92', '#1A5CCC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1.2 }}
          style={styles.hero}
        >
          {/* Decorative circles */}
          <View style={[styles.circle, { width: 220, height: 220, top: -70, right: -60 }]} />
          <View style={[styles.circle, { width: 140, height: 140, top: 30, left: -50 }]} />
          <View style={[styles.circle, { width: 100, height: 100, bottom: -20, right: 80 }]} />

          {/* Top nav row */}
          <View style={styles.heroNav}>
            <Text style={styles.heroNavTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.heroEditPill}
              onPress={() => {
                setName(user?.name ?? '');
                setEmail(user?.email ?? '');
                setPhone(user?.phone ?? '7292858748');
                setEditModal(true);
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.heroEditPillText}>✏️  Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
            </View>
          </View>

          {/* Name & Phone */}
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroPhone}>+91 {displayPhone}</Text>
          {user?.email ? (
            <Text style={styles.heroEmail}>{user.email}</Text>
          ) : null}

          {/* KYC badge */}
          <View style={[
            styles.kycBadge,
            { backgroundColor: isKycVerified ? 'rgba(26,175,93,0.85)' : 'rgba(255,149,0,0.85)' },
          ]}>
            <Text style={styles.kycBadgeText}>
              {isKycVerified ? '✓  KYC VERIFIED' : '⚠  KYC PENDING'}
            </Text>
          </View>
        </LinearGradient>

        {/* ═══ QUICK STATS ═══ */}
        <View style={styles.statsRow}>
          {[
            { label: 'Member Since', value: 'Jun 2025' },
            { label: 'Referrals', value: '3' },
            { label: 'Recharges', value: '27' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ═══ ACCOUNT SECTION ═══ */}
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.listCard}>
          <MenuRow
            emoji="👤"
            iconBg="#EAF3FF"
            label="Personal Details"
            sublabel={`${displayName}  ·  +91 ${displayPhone}`}
            onPress={() => {
              setName(user?.name ?? '');
              setEmail(user?.email ?? '');
              setPhone(user?.phone ?? '7292858748');
              setEditModal(true);
            }}
          />
          <MenuRow
            emoji="🛡️"
            iconBg="#FFF6EA"
            label="KYC Verification"
            sublabel={isKycVerified ? 'Fully Verified' : 'Tap to complete — required for withdrawal'}
            onPress={() => { if (!isKycVerified) setKycModal(true); }}
            badge={isKycVerified ? 'Done' : undefined}
          />
          <MenuRow
            emoji="🎁"
            iconBg="#EAFFF0"
            label="Refer & Earn"
            sublabel="Earn ₹50 per referral · Code: AETH12"
            onPress={() => setActiveView('refer')}
          />
          <MenuRow
            emoji="🔔"
            iconBg="#F3EAFF"
            label="Notification Settings"
            sublabel="All channels enabled"
            onPress={() => Toast.show({ type: 'info', text1: 'Notifications', text2: 'All notifications are enabled' })}
            isLast
          />
        </View>

        {/* ═══ POLICIES SECTION ═══ */}
        <Text style={styles.sectionLabel}>Legal & Policies</Text>
        <View style={styles.listCard}>
          <MenuRow emoji="ℹ️"  iconBg="#F2F2F7" label="About AetherPay" onPress={() => { setPolicyType('about');   setActiveView('policy'); }} />
          <MenuRow emoji="🔒" iconBg="#F2F2F7" label="Privacy Policy"  onPress={() => { setPolicyType('privacy'); setActiveView('policy'); }} />
          <MenuRow emoji="📜" iconBg="#F2F2F7" label="Terms & Conditions" onPress={() => { setPolicyType('terms');   setActiveView('policy'); }} />
          <MenuRow emoji="💸" iconBg="#F2F2F7" label="Refund Policy"   onPress={() => { setPolicyType('refund');  setActiveView('policy'); }} isLast />
        </View>

        {/* ═══ SUPPORT SECTION ═══ */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={styles.listCard}>
          <MenuRow
            emoji="🎧"
            iconBg="#EAF8F8"
            label="Help & Support"
            sublabel="24×7 — Chat, Email & Call"
            onPress={() => Toast.show({ type: 'info', text1: 'Support', text2: 'Connecting you to our team…' })}
          />
          <MenuRow
            emoji="⭐"
            iconBg="#FFFBEA"
            label="Rate AetherPay"
            sublabel="Love the app? Leave us a review!"
            onPress={() => Toast.show({ type: 'success', text1: 'Thank you!', text2: 'Redirecting to store…' })}
            isLast
          />
        </View>

        {/* ═══ LOGOUT ═══ */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutText}>🚪  Sign Out</Text>
        </TouchableOpacity>

        {/* App version */}
        <Text style={styles.version}>AetherPay v1.0.0 · Made in India 🇮🇳</Text>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ═══ EDIT PROFILE MODAL ═══ */}
      <Modal visible={editModal} transparent animationType="slide" statusBarTranslucent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />

              <Text style={styles.modalTitle}>Edit Profile</Text>
              <Text style={styles.modalSubtitle}>Update your name, email and mobile number below.</Text>

              <InputRow
                label="Full Name"
                value={name}
                onChangeText={setName}
                placeholder="Rahul Sharma"
                autoCapitalize="words"
              />

              <InputRow
                label="Mobile Number"
                sublabel="OTP verification required for number change"
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                autoCapitalize="none"
                maxLength={10}
                prefix="+91  "
              />

              <InputRow
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                placeholder="rahul@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {/* Locked: Phone change note */}
              <View style={styles.phoneNote}>
                <Text style={styles.phoneNoteText}>
                  📲  Phone number changes require OTP verification on the new number for security.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setEditModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#0F2E92', '#1A5CCC', '#007AFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGradient}
                  >
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ═══ KYC MODAL ═══ */}
      <Modal visible={kycModal} transparent animationType="slide" statusBarTranslucent>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalBg}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>Identity Verification</Text>
              <Text style={styles.modalSubtitle}>
                Enter your PAN and Aadhaar details to unlock wallet withdrawals and higher transaction limits.
              </Text>

              <InputRow
                label="PAN Card Number"
                sublabel="Format: ABCDE1234F"
                value={panNumber}
                onChangeText={(t) => setPanNumber(t.toUpperCase())}
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                maxLength={10}
              />
              <InputRow
                label="Aadhaar Number"
                sublabel="12-digit Aadhaar card number"
                value={aadhaarNumber}
                onChangeText={(t) => setAadhaarNumber(t.replace(/\D/g, '').slice(0, 12))}
                placeholder="1234 5678 9012"
                keyboardType="number-pad"
                maxLength={12}
              />

              <View style={styles.kycNote}>
                <Text style={styles.kycNoteText}>
                  🔒  Your KYC data is securely encrypted and used only for identity verification as mandated by RBI regulations.
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setKycModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, kycLoading && { opacity: 0.7 }]}
                  onPress={handleKycVerify}
                  activeOpacity={0.85}
                  disabled={kycLoading}
                >
                  <LinearGradient
                    colors={['#0F2E92', '#1A5CCC', '#007AFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGradient}
                  >
                    {kycLoading
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.saveBtnText}>Verify & Submit</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  mainScroll: { paddingBottom: 0 },
  subScroll: {
    paddingTop: Platform.OS === 'ios' ? 64 : 44,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ── Back ──────────────────────────────────────────────────────────────────
  backBtn: { alignSelf: 'flex-start', marginBottom: 20 },
  backBtnText: { fontSize: 17, fontWeight: '600', color: '#007AFF' },

  // ── Sub-view headings ─────────────────────────────────────────────────────
  subTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.8,
    marginBottom: 6,
  },
  subSubtitle: { fontSize: 15, color: '#6E6E73', lineHeight: 22, marginBottom: 24 },

  // ── Hero gradient ─────────────────────────────────────────────────────────
  hero: {
    paddingTop: Platform.OS === 'ios' ? 60 : 42,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  heroNavTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroEditPill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroEditPillText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Avatar
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 30, fontWeight: '900', color: '#1A5CCC' },
  heroName: { fontSize: 24, fontWeight: '800', color: '#fff', marginBottom: 4, letterSpacing: -0.5 },
  heroPhone: { fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 2 },
  heroEmail: { fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 12 },
  kycBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  kycBadgeText: { fontSize: 12, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  // ── Stats ─────────────────────────────────────────────────────────────────
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 20, gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: { fontSize: 16, fontWeight: '800', color: '#1C1C1E', marginBottom: 3 },
  statLabel: { fontSize: 11, fontWeight: '500', color: '#8E8E93', textAlign: 'center' },

  // ── Section label ─────────────────────────────────────────────────────────
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6E6E73',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginLeft: 20,
    marginTop: 28,
    marginBottom: 10,
  },

  // ── List card ─────────────────────────────────────────────────────────────
  listCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  // ── Menu Row ──────────────────────────────────────────────────────────────
  menuRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.12)',
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuEmoji: { fontSize: 20 },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
  menuSublabel: { fontSize: 12, color: '#8E8E93', fontWeight: '400', lineHeight: 16 },
  menuChevron: { fontSize: 22, color: '#C7C7CC', fontWeight: '400', paddingLeft: 8 },
  menuBadge: {
    backgroundColor: '#EAFFF0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  menuBadgeText: { fontSize: 11, fontWeight: '700', color: '#1AAF5D' },

  // ── Logout ────────────────────────────────────────────────────────────────
  logoutBtn: {
    marginHorizontal: 20,
    marginTop: 28,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,59,48,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,59,48,0.18)',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#FF3B30' },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AEAEB2',
    marginTop: 16,
    fontWeight: '500',
  },

  // ── Refer card ────────────────────────────────────────────────────────────
  referCard: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  referLabel: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.75)', marginBottom: 10, letterSpacing: 0.5 },
  referCode: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: 5, marginBottom: 22 },
  shareBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 24,
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  shareBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },

  // ── Steps card ────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 14 },
  stepDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.1)',
  },
  stepNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#EAF3FF',
    justifyContent: 'center', alignItems: 'center',
  },
  stepNumText: { fontSize: 13, fontWeight: '800', color: '#1A5CCC' },
  stepText: { flex: 1, fontSize: 14, color: '#3C3C43', lineHeight: 21 },

  // ── Policy ────────────────────────────────────────────────────────────────
  policyText: { fontSize: 15, color: '#3C3C43', lineHeight: 24 },

  // ── Modal ─────────────────────────────────────────────────────────────────
  modalBg: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.48)' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(60,60,67,0.2)',
    alignSelf: 'center',
    marginBottom: 22,
  },
  modalTitle: {
    fontSize: 22, fontWeight: '800', color: '#1C1C1E',
    letterSpacing: -0.5, marginBottom: 5,
  },
  modalSubtitle: { fontSize: 13, color: '#8E8E93', lineHeight: 19, marginBottom: 20 },

  // ── Input row ─────────────────────────────────────────────────────────────
  inputWrap: { marginBottom: 14 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#3C3C43', marginBottom: 3 },
  inputSublabel: { fontSize: 11, color: '#AEAEB2', marginBottom: 6 },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.1)',
    paddingHorizontal: 16,
    height: 52,
  },
  inputBoxDisabled: { opacity: 0.55 },
  inputPrefix: { fontSize: 15, fontWeight: '600', color: '#3C3C43', marginRight: 2 },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  phoneNote: {
    backgroundColor: '#EAF3FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  phoneNoteText: { fontSize: 12, color: '#1A5CCC', lineHeight: 17, fontWeight: '500' },
  kycNote: {
    backgroundColor: '#EAFFF0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  kycNoteText: { fontSize: 12, color: '#1AAF5D', lineHeight: 17, fontWeight: '500' },

  // ── Modal actions ─────────────────────────────────────────────────────────
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1, height: 52, borderRadius: 26,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#3C3C43' },
  saveBtn: {
    flex: 1.4, height: 52, borderRadius: 26, overflow: 'hidden',
  },
  saveBtnGradient: {
    flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 26,
  },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

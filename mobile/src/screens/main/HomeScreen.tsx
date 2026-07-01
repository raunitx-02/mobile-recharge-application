import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions, FlatList, StatusBar, Platform,
  Animated, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/auth.store';
import { walletService } from '../../services/wallet.service';
import { colors } from '../../theme';
import { MainTabParamList, RootStackParamList } from '../../navigation/types';

const { width: W } = Dimensions.get('window');

type HomeNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'HomeTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

// ─── Service Grid ─────────────────────────────────────────────────────────────

const SERVICES = [
  { id: 'mobile_prepaid',  icon: '📱', label: 'Mobile\nPrepaid',  bg: '#EEE9FF', iconBg: '#5B3CF5' },
  { id: 'mobile_postpaid', icon: '📲', label: 'Postpaid\nBill',   bg: '#E8F0FF', iconBg: '#1D6FEB' },
  { id: 'dth',             icon: '📺', label: 'DTH',              bg: '#FFF7E6', iconBg: '#F59E0B' },
  { id: 'electricity',     icon: '⚡', label: 'Electricity',      bg: '#FFF0E8', iconBg: '#F06B2A' },
  { id: 'water',           icon: '💧', label: 'Water',            bg: '#E8F5FF', iconBg: '#2196F3' },
  { id: 'gas',             icon: '🔥', label: 'Piped Gas',        bg: '#FDEAEA', iconBg: '#E53935' },
  { id: 'broadband',       icon: '📡', label: 'Broadband',        bg: '#F0E8FF', iconBg: '#7B1FA2' },
  { id: 'more',            icon: '⊞',  label: 'More',             bg: '#F3F4F6', iconBg: '#6B7280' },
];

const BANNERS = [
  { id: '1', title: '₹50 Cashback', sub: 'On electricity & water bills', colors: ['#5B3CF5','#7C5CFA'] as [string,string] },
  { id: '2', title: '5% Extra',     sub: 'On Jio & Airtel recharges today', colors: ['#0C56C5','#1E80FF'] as [string,string] },
  { id: '3', title: 'Refer & Earn', sub: 'Get ₹100 per referral 🎁',       colors: ['#0CB072','#00C2A3'] as [string,string] },
];

// ─── Mini Transaction Card ────────────────────────────────────────────────────

const TxnIcon: Record<string, string> = {
  recharge: '📱', electricity: '⚡', water: '💧', gas: '🔥', dth: '📺',
  broadband: '📡', wallet: '👛', default: '💸',
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const { user } = useAuthStore();

  const [balance, setBalance]       = useState<number>(0);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [txns, setTxns]             = useState<any[]>([]);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const balanceFade = useRef(new Animated.Value(1)).current;
  const bannerX     = useRef(new Animated.Value(0)).current;
  const [activeBanner, setActiveBanner] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const res = await walletService.getBalance();
      const bal = res?.data?.balance ?? res?.balance ?? 0;
      setBalance(bal);

      const txRes = await walletService.getTransactions({ limit: 5, page: 1 }).catch(() => ({ data: [] }));
      const txList: any[] = txRes?.data?.transactions ?? txRes?.data ?? [];
      setTxns(txList.slice(0, 5));
    } catch (e: any) {
      // silent fail — user already sees old data
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  // Banner auto-slide
  useEffect(() => {
    const t = setInterval(() => {
      setActiveBanner(prev => (prev + 1) % BANNERS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const toggleBalance = useCallback(() => {
    Animated.sequence([
      Animated.timing(balanceFade, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(balanceFade, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setBalanceVisible(v => !v);
  }, [balanceFade]);

  const navigateToRecharge = useCallback((serviceType: string) => {
    navigation.navigate('RechargeTab', { serviceType });
  }, [navigation]);

  const firstName = user?.name?.split(' ')[0] || 'User';
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Header Gradient */}
      <LinearGradient colors={['#5B3CF5', '#7C5CFA', '#9B6FFD']} style={s.header}>
        <View style={s.headerRow}>
          <View>
            <Text style={s.greeting}>{greeting} 👋</Text>
            <Text style={s.userName}>{firstName}</Text>
          </View>
          <TouchableOpacity
            style={s.notifBtn}
            onPress={() => Toast.show({ type: 'info', text1: 'Notifications coming soon!' })}
          >
            <Text style={s.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={s.balanceCard}>
          <View style={s.balanceTop}>
            <Text style={s.balanceLabel}>Cashback Balance</Text>
            <TouchableOpacity onPress={toggleBalance} style={s.eyeBtn}>
              <Text style={s.eyeIcon}>{balanceVisible ? '👁️' : '🙈'}</Text>
            </TouchableOpacity>
          </View>
          <Animated.Text style={[s.balanceAmt, { opacity: balanceFade, marginBottom: 0 }]}>
            {loading ? '...' : balanceVisible ? `₹${balance.toFixed(2)}` : '₹ ••••'}
          </Animated.Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={s.scroll}
      >
        {/* Services Grid */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Pay & Recharge</Text>
          <View style={s.grid}>
            {SERVICES.map(svc => (
              <TouchableOpacity
                key={svc.id}
                style={s.gridItem}
                onPress={() => svc.id === 'more'
                  ? navigation.navigate('RechargeTab', undefined)
                  : navigateToRecharge(svc.id)
                }
                activeOpacity={0.7}
              >
                <View style={[s.gridIconWrap, { backgroundColor: svc.bg }]}>
                  <Text style={s.gridIcon}>{svc.icon}</Text>
                </View>
                <Text style={s.gridLabel}>{svc.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Offer Banners */}
        <View style={s.section}>
          <View style={s.bannerWrap}>
            {BANNERS.map((b, i) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.9}
                style={[s.bannerSlide, i === activeBanner ? {} : s.bannerHidden]}
                onPress={() => {}}
              >
                <LinearGradient colors={b.colors} style={s.bannerGradient}>
                  <View>
                    <Text style={s.bannerTitle}>{b.title}</Text>
                    <Text style={s.bannerSub}>{b.sub}</Text>
                  </View>
                  <Text style={s.bannerArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
          {/* Dots */}
          <View style={s.bannerDots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[s.dot, i === activeBanner && s.dotActive]} />
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('HistoryTab')}>
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
          ) : txns.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>📭</Text>
              <Text style={s.emptyText}>No transactions yet</Text>
              <Text style={s.emptySub}>Start with a mobile recharge!</Text>
              <TouchableOpacity style={s.emptyBtn} onPress={() => navigateToRecharge('mobile_prepaid')}>
                <Text style={s.emptyBtnText}>Recharge Now</Text>
              </TouchableOpacity>
            </View>
          ) : (
            txns.map(txn => (
              <View key={txn.id || Math.random()} style={s.txnCard}>
                <View style={s.txnIconWrap}>
                  <Text style={s.txnIcon}>{TxnIcon[txn.type || txn.category] || TxnIcon.default}</Text>
                </View>
                <View style={s.txnMid}>
                  <Text style={s.txnTitle}>{txn.operator || txn.biller_name || txn.type || 'Transaction'}</Text>
                  <Text style={s.txnSub}>{txn.account_no || txn.mobile || txn.consumer_no || '—'}</Text>
                  <Text style={s.txnDate}>
                    {txn.created_at ? new Date(txn.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    }) : '—'}
                  </Text>
                </View>
                <View style={s.txnRight}>
                  <Text style={s.txnAmt}>₹{parseFloat(txn.amount || txn.recharge_amount || 0).toFixed(0)}</Text>
                  <View style={[s.txnBadge, {
                    backgroundColor: txn.status === 'success' ? colors.successBg
                      : txn.status === 'pending' ? colors.warningBg : colors.errorBg,
                  }]}>
                    <Text style={[s.txnBadgeText, {
                      color: txn.status === 'success' ? colors.success
                        : txn.status === 'pending' ? colors.warning : colors.error,
                    }]}>{txn.status || 'Unknown'}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 20,
  },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 2 },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  notifBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  notifIcon: { fontSize: 18 },

  balanceCard: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  balanceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 0.5 },
  eyeBtn: { padding: 4 },
  eyeIcon: { fontSize: 16 },
  balanceAmt: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 20 },
  balanceActions: { flexDirection: 'row', alignItems: 'center' },
  balanceActionBtn: { flex: 1, alignItems: 'center', gap: 6 },
  balanceActionIcon: { fontSize: 18, color: '#fff', fontWeight: '700' },
  balanceActionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  balanceDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.25)' },

  scroll: { paddingBottom: 100 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: colors.text, letterSpacing: -0.3, marginBottom: 14 },
  seeAll: { fontSize: 13, color: colors.primary, fontWeight: '700' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: (W - 32 - 36) / 4,
    alignItems: 'center',
    gap: 8,
  },
  gridIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  gridIcon: { fontSize: 24 },
  gridLabel: {
    fontSize: 10.5,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 13,
  },

  bannerWrap: { position: 'relative', height: 90, borderRadius: 18, overflow: 'hidden' },
  bannerSlide: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bannerHidden: { opacity: 0 },
  bannerGradient: {
    flex: 1, borderRadius: 18, padding: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  bannerTitle: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  bannerSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  bannerArrow: { fontSize: 24, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { width: 18, backgroundColor: colors.primary },

  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  txnIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: colors.backgroundMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  txnIcon: { fontSize: 20 },
  txnMid: { flex: 1, gap: 2 },
  txnTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  txnSub: { fontSize: 12, color: colors.textSecondary },
  txnDate: { fontSize: 11, color: colors.textMuted },
  txnRight: { alignItems: 'flex-end', gap: 6 },
  txnAmt: { fontSize: 16, fontWeight: '800', color: colors.text },
  txnBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  txnBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  emptyWrap: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 6 },
  emptySub: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
  emptyBtn: {
    backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 100,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});

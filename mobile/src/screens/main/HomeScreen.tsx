import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  FlatList,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
// @expo/vector-icons removed — using inline emoji icons
import Toast from 'react-native-toast-message';

import { useAuthStore } from '../../store/auth.store';
import { walletService } from '../../services/wallet.service';
import { formatCurrency } from '../../utils/formatters';
import { colors } from '../../theme';
import BalanceCard from '../../components/ui/BalanceCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 48;

// ─── Types ───────────────────────────────────────────────────────────────────

interface StatPill {
  id: string;
  label: string;
  value: string;
  accentColor: string;
}

interface OfferBanner {
  id: string;
  colors: [string, string, ...string[]];
  title: string;
  subtitle: string;
}

interface ServiceItem {
  id: string;
  icon: string;
  label: string;
  bgColor: string;
}

interface Transaction {
  id: string;
  operator: string;
  accountNo: string;
  date: string;
  amount: string;
  accentColor: string;
  status: 'success' | 'pending' | 'failed';
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STAT_PILLS: StatPill[] = [
  { id: 'saved', label: 'Total Saved', value: '₹1,340', accentColor: '#34C759' },
  { id: 'cashback', label: 'Cashback', value: '₹89', accentColor: '#FF9500' },
  { id: 'bills', label: 'Bills Paid', value: '12', accentColor: '#007AFF' },
];

const OFFER_BANNERS: OfferBanner[] = [
  {
    id: 'b1',
    colors: ['#007AFF', '#5AC8FA'],
    title: '₹50 Cashback',
    subtitle: 'On electricity & water bills',
  },
  {
    id: 'b2',
    colors: ['#34C759', '#30B0C7'],
    title: 'Refer & Earn ₹100',
    subtitle: 'Invite friends to get rewarded',
  },
  {
    id: 'b3',
    colors: ['#FF6B35', '#FF9500'],
    title: '5% Extra Cashback',
    subtitle: 'On all Jio & Airtel recharges',
  },
];

const SERVICES: ServiceItem[] = [
  { id: 'mobile', icon: '📱', label: 'Mobile', bgColor: '#EAF3FF' },
  { id: 'dth', icon: '📡', label: 'DTH', bgColor: '#FFF6EA' },
  { id: 'electricity', icon: '⚡', label: 'Electricity', bgColor: '#FFF0EA' },
  { id: 'water', icon: '💧', label: 'Water', bgColor: '#EAF3FF' },
  { id: 'gas', icon: '🔥', label: 'Gas', bgColor: '#FFEAEA' },
  { id: 'fastag', icon: '🛣️', label: 'FASTag', bgColor: '#FFF6EA' },
  { id: 'broadband', icon: '🌐', label: 'Broadband', bgColor: '#EAFFF0' },
  { id: 'more', icon: '🔷', label: 'More', bgColor: '#F0EAFF' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    operator: 'Jio Prepaid',
    accountNo: '+91 98765 43210',
    date: '28 Jun, 10:32 AM',
    amount: '₹239',
    accentColor: '#007AFF',
    status: 'success',
  },
  {
    id: 't2',
    operator: 'MSEB Electricity',
    accountNo: 'CA No. 5201948302',
    date: '27 Jun, 06:15 PM',
    amount: '₹1,420',
    accentColor: '#34C759',
    status: 'success',
  },
  {
    id: 't3',
    operator: 'Airtel Postpaid',
    accountNo: '+91 91234 56789',
    date: '25 Jun, 02:00 PM',
    amount: '₹599',
    accentColor: '#FF9500',
    status: 'success',
  },
  {
    id: 't4',
    operator: 'Tata Sky DTH',
    accountNo: 'Sub ID: 7845612',
    date: '22 Jun, 11:45 AM',
    amount: '₹349',
    accentColor: '#FF6B35',
    status: 'success',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function getGreetingEmoji(): string {
  const hour = new Date().getHours();
  if (hour < 12) return '☀️';
  if (hour < 17) return '🌤️';
  return '🌙';
}

function getFirstName(fullName?: string | null): string {
  if (!fullName) return 'User';
  return fullName.split(' ')[0];
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatPillCard: React.FC<{ item: StatPill }> = ({ item }) => (
  <View style={styles.statPill}>
    <View style={[styles.statAccentBar, { backgroundColor: item.accentColor }]} />
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  </View>
);

const OfferBannerCard: React.FC<{ item: OfferBanner }> = ({ item }) => (
  <TouchableOpacity activeOpacity={0.92} style={styles.bannerTouchable}>
    <LinearGradient
      colors={item.colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.bannerCard}
    >
      <View style={styles.bannerCircle1} />
      <View style={styles.bannerCircle2} />
      <View style={styles.bannerCircle3} />
      <View style={styles.bannerContent}>
        <Text style={styles.bannerTitle}>{item.title}</Text>
        <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
        <TouchableOpacity style={styles.claimButton} activeOpacity={0.85}>
          <Text style={styles.claimButtonText}>Claim Now</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const ServiceCard: React.FC<{ item: ServiceItem; onPress: () => void }> = ({ item, onPress }) => (
  <TouchableOpacity style={styles.serviceCard} onPress={onPress} activeOpacity={0.75}>
    <View style={[styles.serviceIconBox, { backgroundColor: item.bgColor }]}>
      <Text style={styles.serviceIcon}>{item.icon}</Text>
    </View>
    <Text style={styles.serviceLabel} numberOfLines={1}>
      {item.label}
    </Text>
  </TouchableOpacity>
);

const TransactionCard: React.FC<{ item: Transaction }> = ({ item }) => (
  <View style={styles.txCard}>
    <View style={[styles.txAccentBar, { backgroundColor: item.accentColor }]} />
    <View style={styles.txLeft}>
      <View style={[styles.txIconCircle, { backgroundColor: item.accentColor + '18' }]}>
        <Text style={{ fontSize: 18 }}>🧾</Text>
      </View>
      <View style={styles.txDetails}>
        <Text style={styles.txOperator}>{item.operator}</Text>
        <Text style={styles.txAccountNo}>{item.accountNo}</Text>
        <Text style={styles.txDate}>{item.date}</Text>
      </View>
    </View>
    <View style={styles.txRight}>
      <Text style={styles.txAmount}>{item.amount}</Text>
      <View style={[styles.txStatusBadge, { backgroundColor: '#34C75918' }]}>
        <Text style={[styles.txStatusText, { color: '#34C759' }]}>Success</Text>
      </View>
    </View>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [balance, setBalance] = useState<number>(0);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  const bannerRef = useRef<FlatList>(null);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (activeBannerIndex + 1) % OFFER_BANNERS.length;
      bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveBannerIndex(nextIndex);
    }, 3200);
    return () => clearInterval(timer);
  }, [activeBannerIndex]);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await walletService.getBalance();
      const body = res.data?.data || res.data;
      if (body && typeof body.balance === 'number') {
        setBalance(body.balance);
      }
    } catch {
      // silently fall back to cached/default
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchBalance();
      Toast.show({ type: 'success', text1: 'Updated!', text2: 'Your data is fresh.' });
    } catch {
      Toast.show({ type: 'error', text1: 'Refresh failed', text2: 'Please try again.' });
    } finally {
      setRefreshing(false);
    }
  }, [fetchBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleServicePress = useCallback(
    (service: ServiceItem) => {
      if (service.id === 'more') {
        Toast.show({ type: 'info', text1: 'More services coming soon!' });
        return;
      }
      navigation.navigate('RechargeTab', { serviceType: service.id });
    },
    [navigation],
  );

  const handleAddMoney = useCallback(() => {
    navigation.navigate('AddMoney');
  }, [navigation]);

  const handleWithdraw = useCallback(() => {
    navigation.navigate('Withdraw');
  }, [navigation]);

  const onBannerViewableChange = useCallback(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setActiveBannerIndex(viewableItems[0].index ?? 0);
    }
  }, []);

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 60 });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.greetingBlock}>
            <Text style={styles.greetingEmoji}>{getGreetingEmoji()}</Text>
            <View>
              <Text style={styles.greetingText}>{getGreeting()},</Text>
              <Text style={styles.greetingName}>{getFirstName(user?.name)} 👋</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notifButton} activeOpacity={0.75}>
            <View style={styles.notifDot} />
            <Text style={styles.notifIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <BalanceCard
          name={user?.name ?? 'User'}
          balance={balance}
          onAddMoney={handleAddMoney}
          onWithdraw={handleWithdraw}
        />

        {/* Quick Stats */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.statsScroll}
          contentContainerStyle={styles.statsScrollContent}
        >
          {STAT_PILLS.map((pill) => (
            <StatPillCard key={pill.id} item={pill} />
          ))}
        </ScrollView>

        {/* Offer Banners */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Special Offers</Text>
          <TouchableOpacity>
            <Text style={styles.sectionSeeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={bannerRef}
          data={OFFER_BANNERS}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          snapToInterval={BANNER_WIDTH + 16}
          snapToAlignment="start"
          decelerationRate="fast"
          onViewableItemsChanged={onBannerViewableChange}
          viewabilityConfig={viewConfigRef.current}
          contentContainerStyle={styles.bannerListContent}
          renderItem={({ item }) => <OfferBannerCard item={item} />}
          getItemLayout={(_, index) => ({
            length: BANNER_WIDTH + 16,
            offset: (BANNER_WIDTH + 16) * index,
            index,
          })}
        />

        {/* Banner Dots */}
        <View style={styles.bannerDots}>
          {OFFER_BANNERS.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeBannerIndex && styles.dotActive]} />
          ))}
        </View>

        {/* Popular Services */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
        </View>

        <View style={styles.servicesGrid}>
          {SERVICES.map((svc) => (
            <ServiceCard key={svc.id} item={svc} onPress={() => handleServicePress(svc)} />
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
            <Text style={styles.sectionSeeAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.txList}>
          {transactions.map((tx) => (
            <TransactionCard key={tx.id} item={tx} />
          ))}
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  greetingBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  greetingEmoji: {
    fontSize: 28,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6E6E73',
    letterSpacing: 0.1,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  notifIcon: {
    fontSize: 20,
  },
  notifDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    borderWidth: 1.5,
    borderColor: '#FFF',
    zIndex: 1,
  },
  statsScroll: {
    marginTop: 12,
  },
  statsScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    minWidth: 130,
  },
  statAccentBar: {
    width: 4,
    height: '100%',
    minHeight: 56,
    borderRadius: 2,
  },
  statContent: {
    paddingVertical: 10,
    paddingLeft: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  sectionSeeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  bannerListContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  bannerTouchable: {
    width: BANNER_WIDTH,
    height: 165,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  bannerCard: {
    flex: 1,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  bannerCircle1: {
    position: 'absolute',
    top: -60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  bannerCircle2: {
    position: 'absolute',
    top: 30,
    right: 60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  bannerCircle3: {
    position: 'absolute',
    bottom: -30,
    right: 20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bannerContent: {
    padding: 20,
    paddingTop: 0,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 14,
  },
  claimButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  claimButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C7C7CC',
  },
  dotActive: {
    width: 20,
    backgroundColor: '#007AFF',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  serviceCard: {
    width: (SCREEN_WIDTH - 32 - 30) / 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  serviceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIcon: {
    fontSize: 24,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A3A3C',
    textAlign: 'center',
  },
  txList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  txAccentBar: {
    width: 4,
    alignSelf: 'stretch',
    minHeight: 72,
  },
  txLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  txIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txDetails: {
    flex: 1,
  },
  txOperator: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  txAccountNo: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
    marginTop: 2,
  },
  txDate: {
    fontSize: 11,
    color: '#AEAEB2',
    marginTop: 3,
  },
  txRight: {
    alignItems: 'flex-end',
    paddingRight: 16,
    gap: 6,
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.3,
  },
  txStatusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  txStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default HomeScreen;

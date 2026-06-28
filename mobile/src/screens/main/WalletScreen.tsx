import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/auth.store';
import { walletService } from '../../services/wallet.service';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CashbackTx {
  id: string;
  description: string;
  amount: number;        // always positive (cashback credits only)
  source: string;        // e.g. "Jio Prepaid ₹239"
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock cashback transactions
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_CB: CashbackTx[] = [
  { id: 'cb1', description: 'Cashback on Recharge',     source: 'Jio Prepaid ₹299',           amount: 14.95, created_at: new Date().toISOString() },
  { id: 'cb2', description: 'Cashback on Recharge',     source: 'Airtel Prepaid ₹179',         amount: 8.95,  created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 'cb3', description: 'Cashback on Bill Payment', source: 'BSES Electricity ₹1240',       amount: 24.80, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 'cb4', description: 'Referral Bonus',           source: 'Friend: Amit S. joined',       amount: 50.00, created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 'cb5', description: 'Cashback on Recharge',     source: 'Tata Play DTH ₹350',           amount: 10.50, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 'cb6', description: 'Cashback on Bill Payment', source: 'Delhi Jal Board ₹480',         amount: 9.60,  created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: 'cb7', description: 'Referral Bonus',           source: 'Friend: Priya K. joined',      amount: 50.00, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 'cb8', description: 'Cashback on Recharge',     source: 'Vi Prepaid ₹199',              amount: 9.95,  created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && now.getDate() === d.getDate()) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function groupByDate(txs: CashbackTx[]): Array<{ label: string; data: CashbackTx[] }> {
  const map = new Map<string, CashbackTx[]>();
  txs.forEach((tx) => {
    const label = fmtDate(tx.created_at);
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(tx);
  });
  return Array.from(map.entries()).map(([label, data]) => ({ label, data }));
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

const WalletScreen: React.FC = () => {
  const { user } = useAuthStore();

  const [balance, setBalance]     = useState(178.75);   // total cashback earned
  const [txList, setTxList]       = useState<CashbackTx[]>(MOCK_CB);
  const [refreshing, setRefresh]  = useState(false);

  // Total stats
  const totalEarned = MOCK_CB.reduce((s, t) => s + t.amount, 0);
  const usableNow   = Math.floor(balance); // whole rupees usable

  const load = useCallback(async () => {
    try {
      const res = await walletService.getBalance();
      const bal = parseFloat(res?.data?.data?.balance ?? res?.data?.balance ?? 0);
      if (!isNaN(bal) && bal > 0) setBalance(bal);
    } catch { /* keep mock */ }
    try {
      const res2 = await walletService.getHistory();
      const list = res2?.data?.data?.transactions ?? res2?.data?.data ?? [];
      if (Array.isArray(list) && list.length > 0) setTxList(list);
    } catch { /* keep mock */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefresh(true);
    await load();
    setRefresh(false);
  }, [load]);

  const groups = groupByDate(txList);

  // Max cashback that can be used on a ₹299 recharge (20% capping example)
  const exampleMax20 = (299 * 0.20).toFixed(2);

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
          />
        }
      >
        {/* ══════════════════════════════════════════
            HERO — Cashback Balance Card
        ══════════════════════════════════════════ */}
        <LinearGradient
          colors={['#064E3B', '#065F46', '#047857', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1.2 }}
          style={styles.hero}
        >
          {/* Decorative circles */}
          <View style={[styles.deco, { width: 260, height: 260, top: -90, right: -80 }]} />
          <View style={[styles.deco, { width: 160, height: 160, top: 40,  left: -50 }]} />
          <View style={[styles.deco, { width: 100, height: 100, bottom: -20, right: 60 }]} />

          {/* Header row */}
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroTopLabel}>CASHBACK WALLET</Text>
              <Text style={styles.heroTopSub}>Earned from your recharges</Text>
            </View>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeEmoji}>✨</Text>
            </View>
          </View>

          {/* Balance */}
          <Text style={styles.balLabel}>Available Cashback</Text>
          <Text style={styles.balAmount}>₹{balance.toFixed(2)}</Text>

          {/* 20% usage rule strip */}
          <View style={styles.ruleStrip}>
            <Text style={styles.ruleIcon}>ℹ</Text>
            <Text style={styles.ruleText}>
              Use up to{' '}
              <Text style={styles.ruleBold}>20% of recharge amount</Text>
              {' '}as cashback discount
            </Text>
          </View>
        </LinearGradient>

        {/* ══════════════════════════════════════════
            STAT CARDS
        ══════════════════════════════════════════ */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#10B981' }]}>
            <Text style={styles.statValue}>₹{totalEarned.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Earned</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#1D6FEB' }]}>
            <Text style={styles.statValue}>₹{usableNow}</Text>
            <Text style={styles.statLabel}>Usable Now</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#D97B00' }]}>
            <Text style={styles.statValue}>{MOCK_CB.length}</Text>
            <Text style={styles.statLabel}>Transactions</Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════
            HOW CASHBACK WORKS
        ══════════════════════════════════════════ */}
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>💡  How Cashback Works</Text>
          <View style={styles.howDivider} />

          <View style={styles.howRow}>
            <View style={styles.howNumBadge}><Text style={styles.howNum}>1</Text></View>
            <Text style={styles.howText}>
              Complete any recharge or bill payment to earn cashback instantly.
            </Text>
          </View>

          <View style={styles.howRow}>
            <View style={styles.howNumBadge}><Text style={styles.howNum}>2</Text></View>
            <Text style={styles.howText}>
              Cashback is credited to this wallet within a few seconds of success.
            </Text>
          </View>

          <View style={styles.howRow}>
            <View style={styles.howNumBadge}><Text style={styles.howNum}>3</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.howText}>
                Apply cashback on your next recharge — capped at{' '}
                <Text style={styles.howBold}>20% of the recharge amount.</Text>
              </Text>
              <View style={styles.examplePill}>
                <Text style={styles.exampleText}>
                  Example: On ₹299 recharge → max ₹{exampleMax20} cashback can be applied
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.howRow, { borderBottomWidth: 0 }]}>
            <View style={styles.howNumBadge}><Text style={styles.howNum}>4</Text></View>
            <Text style={styles.howText}>
              Invite friends and earn ₹50 bonus cashback per successful referral!
            </Text>
          </View>
        </View>

        {/* ══════════════════════════════════════════
            TRANSACTION HISTORY
        ══════════════════════════════════════════ */}
        <Text style={styles.sectionTitle}>Cashback History</Text>

        {groups.map(({ label, data }) => (
          <View key={label}>
            <Text style={styles.groupLabel}>{label}</Text>
            <View style={styles.txCard}>
              {data.map((tx, i) => (
                <View
                  key={tx.id}
                  style={[styles.txRow, i < data.length - 1 && styles.txRowBorder]}
                >
                  {/* Green coin icon */}
                  <View style={styles.txIcon}>
                    <Text style={styles.txIconText}>₹</Text>
                  </View>

                  {/* Description */}
                  <View style={styles.txInfo}>
                    <Text style={styles.txDesc} numberOfLines={1}>
                      {tx.description}
                    </Text>
                    <Text style={styles.txSource} numberOfLines={1}>
                      {tx.source}
                    </Text>
                    <Text style={styles.txTime}>{fmtTime(tx.created_at)}</Text>
                  </View>

                  {/* Amount */}
                  <View style={styles.txAmountWrap}>
                    <Text style={styles.txAmount}>+₹{tx.amount.toFixed(2)}</Text>
                    <View style={styles.txStatusBadge}>
                      <Text style={styles.txStatusText}>CREDITED</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Bottom spacer for tab bar */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#F2F2F7' },
  content: { paddingBottom: 0 },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    paddingTop: Platform.OS === 'ios' ? 62 : 44,
    paddingBottom: 32,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  deco: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 22,
  },
  heroTopLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
  },
  heroTopSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 3,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  heroBadgeEmoji: { fontSize: 22 },

  balLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 6,
  },
  balAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -2,
    marginBottom: 20,
  },

  // 20% rule strip
  ruleStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
  },
  ruleIcon: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '700' },
  ruleText: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  ruleBold: { fontWeight: '800', color: '#FFFFFF' },

  // ── Stats ───────────────────────────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 14,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: { fontSize: 17, fontWeight: '800', color: '#1C1C1E', marginBottom: 3 },
  statLabel: { fontSize: 11, fontWeight: '500', color: '#8E8E93' },

  // ── How it works ────────────────────────────────────────────────────────────
  howCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  howTitle: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 14 },
  howDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(60,60,67,0.1)',
    marginBottom: 14,
  },
  howRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.08)',
    alignItems: 'flex-start',
  },
  howNumBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  howNum:  { fontSize: 12, fontWeight: '800', color: '#047857' },
  howText: { flex: 1, fontSize: 14, color: '#3C3C43', lineHeight: 21 },
  howBold: { fontWeight: '700', color: '#047857' },
  examplePill: {
    marginTop: 8,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 10,
  },
  exampleText: { fontSize: 12, color: '#065F46', fontWeight: '600', lineHeight: 17 },

  // ── Section title ───────────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6E6E73',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginLeft: 20,
    marginTop: 28,
    marginBottom: 10,
  },

  // ── Group label ─────────────────────────────────────────────────────────────
  groupLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 24,
    marginBottom: 8,
  },

  // ── Transaction card ────────────────────────────────────────────────────────
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  txRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(60,60,67,0.10)',
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  txIconText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#047857',
  },
  txInfo: { flex: 1 },
  txDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  txSource: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
    marginBottom: 2,
  },
  txTime: {
    fontSize: 11,
    color: '#AEAEB2',
  },
  txAmountWrap: { alignItems: 'flex-end', gap: 4 },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#047857',
  },
  txStatusBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  txStatusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.4,
  },
});

export default WalletScreen;

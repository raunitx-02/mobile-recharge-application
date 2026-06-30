import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  Platform, StatusBar, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/auth.store';
import { walletService } from '../../services/wallet.service';
import { colors } from '../../theme';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000 && now.getDate() === d.getDate()) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

const WalletScreen: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const { user } = useAuthStore();

  const [balance, setBalance]       = useState(0);
  const [txList, setTxList]         = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading]       = useState(true);

  const fetchWallet = useCallback(async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions({ limit: 30, page: 1 }).catch(() => ({ data: [] })),
      ]);
      setBalance(balRes?.data?.balance ?? balRes?.balance ?? 0);
      const txs: any[] = txRes?.data?.transactions ?? txRes?.data ?? [];
      setTxList(txs);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWallet();
  }, [fetchWallet]);

  // Group transactions by date label
  const grouped: { label: string; data: any[] }[] = [];
  txList.forEach(tx => {
    const label = fmtDate(tx.created_at || new Date().toISOString());
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) last.data.push(tx);
    else grouped.push({ label, data: [tx] });
  });

  const TxnIcon: Record<string, string> = {
    recharge: '📱', electricity: '⚡', water: '💧', gas: '🔥',
    dth: '📺', broadband: '📡', credit: '💰', debit: '↑',
    cashback: '🎁', referral: '👥', withdrawal: '🏦', default: '💸',
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#5B3CF5', '#7C5CFA']} style={s.header}>
        <View style={s.headerTop}>
          <Text style={s.headerTitle}>My Wallet</Text>
        </View>

        <View style={s.balanceBlock}>
          <Text style={s.balanceLabel}>Available Cashback</Text>
          {loading ? (
            <ActivityIndicator color="#fff" style={{ marginVertical: 8 }} />
          ) : (
            <Text style={s.balanceAmt}>₹{balance.toFixed(2)}</Text>
          )}
          <Text style={s.balanceNote}>Use up to 20% on any recharge or bill payment</Text>
        </View>

        <View style={s.actionRow}>
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => navigation.navigate('AddMoney')}
          >
            <Text style={s.actionBtnIcon}>＋</Text>
            <Text style={s.actionBtnLabel}>Add Money</Text>
          </TouchableOpacity>
          <View style={s.actionDivider} />
          <TouchableOpacity
            style={s.actionBtn}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <Text style={s.actionBtnIcon}>↑</Text>
            <Text style={s.actionBtnLabel}>Withdraw</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* How cashback works */}
      <View style={s.infoCard}>
        <Text style={s.infoTitle}>💡 How Cashback Works</Text>
        <Text style={s.infoText}>
          Earn cashback on every recharge &amp; bill payment.
          Use up to <Text style={s.infoHighlight}>20%</Text> of any transaction amount from your wallet balance.
        </Text>
      </View>

      {/* Transactions */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={s.scroll}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
        ) : txList.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>👛</Text>
            <Text style={s.emptyTitle}>No transactions yet</Text>
            <Text style={s.emptySub}>Your cashback history will appear here</Text>
          </View>
        ) : (
          grouped.map(group => (
            <View key={group.label}>
              <Text style={s.dateLabel}>{group.label}</Text>
              {group.data.map((tx, i) => {
                const isCredit = tx.type === 'credit' || tx.type === 'cashback' || tx.type === 'referral' || (parseFloat(tx.amount) > 0 && tx.transaction_type === 'credit');
                return (
                  <View key={tx.id || i} style={s.txCard}>
                    <View style={[s.txIconWrap, { backgroundColor: isCredit ? colors.successBg : colors.errorBg }]}>
                      <Text style={s.txIcon}>{TxnIcon[tx.type || tx.category] || TxnIcon.default}</Text>
                    </View>
                    <View style={s.txMid}>
                      <Text style={s.txTitle}>{tx.description || tx.type || 'Transaction'}</Text>
                      <Text style={s.txSub}>{tx.source || tx.account_no || tx.operator || '—'}</Text>
                      <Text style={s.txTime}>{fmtTime(tx.created_at || new Date().toISOString())}</Text>
                    </View>
                    <Text style={[s.txAmt, { color: isCredit ? colors.success : colors.error }]}>
                      {isCredit ? '+' : '-'}₹{Math.abs(parseFloat(tx.amount || '0')).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
};

export default WalletScreen;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: { marginBottom: 20 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.4 },

  balanceBlock: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  balanceLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '600', marginBottom: 6, letterSpacing: 0.5 },
  balanceAmt: { fontSize: 38, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 8 },
  balanceNote: { fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 17 },

  actionRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, overflow: 'hidden' },
  actionBtn: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  actionBtnIcon: { fontSize: 20, color: '#fff', fontWeight: '700' },
  actionBtnLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  actionDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },

  infoCard: {
    margin: 16,
    backgroundColor: colors.primarySubtle,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight + '40',
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 6 },
  infoText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  infoHighlight: { fontWeight: '800', color: colors.primary },

  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  dateLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 6 },

  txCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard, borderRadius: 14, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  txIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txIcon: { fontSize: 20 },
  txMid: { flex: 1, gap: 2 },
  txTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  txSub: { fontSize: 12, color: colors.textSecondary },
  txTime: { fontSize: 11, color: colors.textMuted },
  txAmt: { fontSize: 16, fontWeight: '800' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textMuted },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, RefreshControl,
  ScrollView, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { rechargeService } from '../../services/recharge.service';
import { walletService } from '../../services/wallet.service';
import { colors } from '../../theme';

type TxStatus = 'success' | 'pending' | 'failed';
type FilterType = 'All' | 'Mobile' | 'Bills' | 'Wallet';

interface HistoryTx {
  id: string;
  operator?: string;
  biller_name?: string;
  account_no?: string;
  consumer_no?: string;
  mobile?: string;
  recharge_amount?: string;
  amount?: string;
  status: TxStatus;
  type?: string;
  created_at: string;
  transaction_id?: string;
  validity_days?: number;
}

const TYPE_ICON: Record<string, string> = {
  prepaid: '📱', postpaid: '📲', dth: '📺',
  electricity: '⚡', water: '💧', gas: '🔥',
  broadband: '📡', fastag: '🛣️', insurance: '🛡️',
  credit: '💰', debit: '↑', cashback: '🎁',
  default: '💸',
};

const FILTERS: FilterType[] = ['All', 'Mobile', 'Bills', 'Wallet'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  if (now.toDateString() === d.toDateString()) return 'Today';
  const yest = new Date(now); yest.setDate(now.getDate() - 1);
  if (yest.toDateString() === d.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function HistoryScreen() {
  const [filter, setFilter]       = useState<FilterType>('All');
  const [txns, setTxns]           = useState<HistoryTx[]>([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);

  const fetchTxns = useCallback(async (pg = 1, refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      const res = await rechargeService.getHistory(pg).catch(() => null);
      const wRes = await walletService.getTransactions({ page: pg, limit: 20 }).catch(() => null);

      const rechargeTxns: HistoryTx[] = res?.data?.transactions ?? res?.data ?? [];
      const walletTxns: HistoryTx[] = wRes?.data?.transactions ?? wRes?.data ?? [];

      // Merge and sort by date
      const merged = [...rechargeTxns, ...walletTxns].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      if (pg === 1) setTxns(merged);
      else setTxns(prev => [...prev, ...merged]);
      setHasMore(merged.length >= 15);
      setPage(pg);
    } catch {
      // silent
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchTxns(1); }, []);

  const onRefresh = useCallback(() => { fetchTxns(1, true); }, [fetchTxns]);

  // Filter
  const filtered = txns.filter(tx => {
    if (filter === 'All') return true;
    if (filter === 'Mobile') return ['prepaid', 'postpaid'].includes(tx.type || '');
    if (filter === 'Bills') return ['electricity', 'water', 'gas', 'broadband', 'dth', 'fastag'].includes(tx.type || '');
    if (filter === 'Wallet') return ['credit', 'debit', 'cashback', 'referral'].includes(tx.type || '');
    return true;
  });

  // Group by date
  const grouped: { label: string; data: HistoryTx[] }[] = [];
  filtered.forEach(tx => {
    const label = fmtDate(tx.created_at);
    const last = grouped[grouped.length - 1];
    if (last && last.label === label) last.data.push(tx);
    else grouped.push({ label, data: [tx] });
  });

  const getTitle = (tx: HistoryTx) =>
    tx.operator || tx.biller_name || (tx.type ? tx.type.charAt(0).toUpperCase() + tx.type.slice(1) : 'Transaction');

  const getSubtitle = (tx: HistoryTx) =>
    tx.account_no || tx.consumer_no || tx.mobile || tx.transaction_id?.slice(0, 16) || '—';

  const getAmount = (tx: HistoryTx) =>
    parseFloat(tx.recharge_amount || tx.amount || '0');

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Transaction History</Text>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.filtersScroll}
        contentContainerStyle={s.filtersContent}
      >
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[s.chip, filter === f && s.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.chipText, filter === f && s.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={s.scroll}
        onScrollEndDrag={() => {
          if (hasMore && !loading) fetchTxns(page + 1);
        }}
      >
        {loading && txns.length === 0 ? (
          <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 60 }} />
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📭</Text>
            <Text style={s.emptyTitle}>No transactions</Text>
            <Text style={s.emptySub}>
              {filter === 'All' ? 'Your transaction history will appear here' : `No ${filter} transactions found`}
            </Text>
          </View>
        ) : (
          grouped.map(group => (
            <View key={group.label}>
              <View style={s.dateRow}>
                <Text style={s.dateLabel}>{group.label}</Text>
                <View style={s.dateLine} />
              </View>
              {group.data.map((tx, i) => {
                const amt = getAmount(tx);
                const isCredit = tx.type === 'credit' || tx.type === 'cashback' || tx.type === 'referral';
                const icon = TYPE_ICON[tx.type || ''] || TYPE_ICON.default;
                return (
                  <View key={tx.id || i} style={s.txCard}>
                    {/* Timeline dot */}
                    <View style={s.timeline}>
                      <View style={[s.dot, {
                        backgroundColor: tx.status === 'success' ? colors.success
                          : tx.status === 'pending' ? colors.warning : colors.error
                      }]} />
                      {i < group.data.length - 1 && <View style={s.dotLine} />}
                    </View>

                    {/* Card */}
                    <View style={s.txContent}>
                      <View style={[s.txIconWrap, {
                        backgroundColor: tx.status === 'success' ? colors.successBg
                          : tx.status === 'pending' ? colors.warningBg : colors.errorBg,
                      }]}>
                        <Text style={s.txIcon}>{icon}</Text>
                      </View>
                      <View style={s.txMid}>
                        <Text style={s.txTitle} numberOfLines={1}>{getTitle(tx)}</Text>
                        <Text style={s.txSub} numberOfLines={1}>{getSubtitle(tx)}</Text>
                        <View style={s.txMeta}>
                          <Text style={s.txTime}>
                            {new Date(tx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                          <View style={[s.statusBadge, {
                            backgroundColor: tx.status === 'success' ? colors.successBg
                              : tx.status === 'pending' ? colors.warningBg : colors.errorBg,
                          }]}>
                            <Text style={[s.statusText, {
                              color: tx.status === 'success' ? colors.success
                                : tx.status === 'pending' ? colors.warning : colors.error,
                            }]}>{tx.status}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={s.txRight}>
                        <Text style={[s.txAmt, {
                          color: isCredit ? colors.success : colors.text
                        }]}>
                          {isCredit ? '+' : ''}₹{amt.toFixed(0)}
                        </Text>
                        {tx.validity_days && (
                          <Text style={s.validity}>{tx.validity_days}d validity</Text>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}
        {!loading && hasMore && txns.length > 0 && (
          <TouchableOpacity style={s.loadMore} onPress={() => fetchTxns(page + 1)}>
            <Text style={s.loadMoreText}>Load more →</Text>
          </TouchableOpacity>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },

  filtersScroll: { flexShrink: 0, maxHeight: 52 },
  filtersContent: {
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
  },
  chip: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  chipActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  chipTextActive: { color: colors.primary, fontWeight: '800' },

  scroll: { paddingVertical: 8, paddingHorizontal: 16 },

  dateRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12, gap: 10 },
  dateLabel: { fontSize: 12, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8 },
  dateLine: { flex: 1, height: 1, backgroundColor: colors.border },

  txCard: { flexDirection: 'row', marginBottom: 8, gap: 12 },

  timeline: { width: 20, alignItems: 'center', paddingTop: 20 },
  dot: { width: 10, height: 10, borderRadius: 5, zIndex: 1 },
  dotLine: { flex: 1, width: 1.5, backgroundColor: colors.border, marginTop: 4 },

  txContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: colors.border, gap: 12,
  },
  txIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txIcon: { fontSize: 20 },
  txMid: { flex: 1, gap: 3 },
  txTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  txSub: { fontSize: 12, color: colors.textSecondary },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  txTime: { fontSize: 11, color: colors.textMuted },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmt: { fontSize: 16, fontWeight: '800', color: colors.text },
  validity: { fontSize: 10, color: colors.textMuted, fontWeight: '500' },

  empty: { alignItems: 'center', paddingVertical: 80 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 40 },

  loadMore: {
    alignItems: 'center', paddingVertical: 16, marginTop: 8,
    backgroundColor: colors.backgroundCard, borderRadius: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  loadMoreText: { fontSize: 14, color: colors.primary, fontWeight: '700' },
});

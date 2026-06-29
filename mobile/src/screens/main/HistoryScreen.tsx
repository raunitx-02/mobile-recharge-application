import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { rechargeService } from '../../services/recharge.service';
import { colors } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

// ─── Types ────────────────────────────────────────────────────────────────────

type TxStatus = 'success' | 'pending' | 'failed';
type TxType =
  | 'prepaid'
  | 'postpaid'
  | 'dth'
  | 'electricity'
  | 'water'
  | 'gas'
  | 'broadband'
  | 'fastag'
  | string;

interface HistoryTx {
  id: string;
  operator: string;
  account_no: string;
  recharge_amount: string;
  status: TxStatus;
  type: TxType;
  created_at: string;
  transaction_id?: string;
}

type FilterType = 'All' | 'Mobile' | 'Bills' | 'Wallet' | 'FASTag';

interface GroupedHistory {
  label: string;
  data: HistoryTx[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: HistoryTx[] = [
  {
    id: 'd1',
    operator: 'Jio Prepaid Recharge',
    account_no: '9876543210',
    recharge_amount: '299.00',
    status: 'success',
    type: 'prepaid',
    created_at: new Date().toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
  {
    id: 'd2',
    operator: 'Tata Play DTH',
    account_no: '3024859345',
    recharge_amount: '350.00',
    status: 'success',
    type: 'dth',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
  {
    id: 'd3',
    operator: 'BSES Rajdhani Electricity',
    account_no: '1004859302',
    recharge_amount: '1240.00',
    status: 'success',
    type: 'electricity',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
  {
    id: 'd4',
    operator: 'Delhi Jal Board Water Bill',
    account_no: 'DJB-9485903',
    recharge_amount: '480.00',
    status: 'pending',
    type: 'water',
    created_at: new Date(Date.now() - 172800000).toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
  {
    id: 'd5',
    operator: 'Airtel Postpaid Bill',
    account_no: '9123456789',
    recharge_amount: '799.00',
    status: 'success',
    type: 'postpaid',
    created_at: new Date(Date.now() - 259200000).toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
  {
    id: 'd6',
    operator: 'IGL Piped Gas',
    account_no: 'IGL-30294857',
    recharge_amount: '1100.00',
    status: 'failed',
    type: 'gas',
    created_at: new Date(Date.now() - 345600000).toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
  {
    id: 'd7',
    operator: 'Airtel Xstream Fiber',
    account_no: '7001234567',
    recharge_amount: '999.00',
    status: 'success',
    type: 'broadband',
    created_at: new Date(Date.now() - 432000000).toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
  {
    id: 'd8',
    operator: 'NHAI FASTag Recharge',
    account_no: 'DL01CA1234',
    recharge_amount: '500.00',
    status: 'success',
    type: 'fastag',
    created_at: new Date(Date.now() - 518400000).toISOString(),
    transaction_id: 'TXN' + Math.random().toString(36).slice(2, 12).toUpperCase(),
  },
];

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, { bg: string; emoji: string }> = {
  prepaid: { bg: '#EAF3FF', emoji: '📱' },
  postpaid: { bg: '#EAF3FF', emoji: '📱' },
  dth: { bg: '#FFF6EA', emoji: '📡' },
  electricity: { bg: '#FFF0EA', emoji: '⚡' },
  water: { bg: '#EAF3FF', emoji: '💧' },
  gas: { bg: '#FFEAEA', emoji: '🔥' },
  broadband: { bg: '#EAFFF0', emoji: '🌐' },
  fastag: { bg: '#FFF6EA', emoji: '🛣️' },
};

function getCategoryConfig(type: string): { bg: string; emoji: string } {
  return CATEGORY_MAP[type.toLowerCase()] ?? { bg: '#F5F5F5', emoji: '⚡' };
}

// ─── Filter Logic ─────────────────────────────────────────────────────────────

const FILTERS: FilterType[] = ['All', 'Mobile', 'Bills', 'Wallet', 'FASTag'];

function applyFilter(tx: HistoryTx, filter: FilterType): boolean {
  if (filter === 'All') return true;
  if (filter === 'Mobile') return ['prepaid', 'postpaid'].includes(tx.type);
  if (filter === 'Bills') return ['electricity', 'water', 'gas', 'broadband', 'dth'].includes(tx.type);
  if (filter === 'FASTag') return tx.type === 'fastag';
  if (filter === 'Wallet') return tx.type === 'wallet';
  return true;
}

// ─── Date Grouping ────────────────────────────────────────────────────────────

function getDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

  if (date >= startOfToday) return 'TODAY';
  if (date >= startOfYesterday) return 'YESTERDAY';

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase();
}

function groupHistory(transactions: HistoryTx[]): GroupedHistory[] {
  const groups: Record<string, HistoryTx[]> = {};
  const order: string[] = [];

  transactions.forEach((tx) => {
    const label = getDateLabel(tx.created_at);
    if (!groups[label]) {
      groups[label] = [];
      order.push(label);
    }
    groups[label].push(tx);
  });

  return order.map((label) => ({ label, data: groups[label] }));
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TxStatus, { label: string; bg: string; text: string }> = {
  success: { label: 'SUCCESS', bg: '#EAFFF0', text: '#1DB954' },
  pending: { label: 'PENDING', bg: '#FFF6EA', text: '#FF9500' },
  failed: { label: 'FAILED', bg: '#FFEAEA', text: '#FF3B30' },
};

// ─── Transaction Card ─────────────────────────────────────────────────────────

const TransactionCard: React.FC<{ tx: HistoryTx }> = ({ tx }) => {
  const [expanded, setExpanded] = useState(false);
  const category = getCategoryConfig(tx.type);
  const statusCfg = STATUS_CONFIG[tx.status];

  return (
    <TouchableOpacity
      style={styles.txCard}
      activeOpacity={0.92}
      onPress={() => setExpanded((v) => !v)}
    >
      {/* Main row */}
      <View style={styles.txRow}>
        {/* Left icon */}
        <View style={[styles.txIcon, { backgroundColor: category.bg }]}>
          <Text style={styles.txEmoji}>{category.emoji}</Text>
        </View>

        {/* Center info */}
        <View style={styles.txCenter}>
          <Text style={styles.txOperator} numberOfLines={1}>
            {tx.operator}
          </Text>
          <Text style={styles.txAccount}>{tx.account_no}</Text>
          <Text style={styles.txTime}>{timeAgo(tx.created_at)}</Text>
        </View>

        {/* Right amount + status */}
        <View style={styles.txRight}>
          <Text style={styles.txAmount}>-₹{tx.recharge_amount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
            <Text style={[styles.statusText, { color: statusCfg.text }]}>
              {statusCfg.label}
            </Text>
          </View>
        </View>
      </View>

      {/* Expanded details */}
      {expanded && (
        <View style={styles.txExpanded}>
          <View style={styles.expandDivider} />

          <View style={styles.expandRow}>
            <Text style={styles.expandKey}>Transaction ID</Text>
            <Text style={styles.expandValue} selectable>
              {tx.transaction_id ?? 'N/A'}
            </Text>
          </View>

          <View style={styles.expandRow}>
            <Text style={styles.expandKey}>Payment Mode</Text>
            <Text style={styles.expandValue}>Wallet Balance</Text>
          </View>

          <View style={styles.expandRow}>
            <Text style={styles.expandKey}>Operator Code</Text>
            <Text style={styles.expandValue}>{tx.type.toUpperCase()}</Text>
          </View>

          <View style={styles.expandRow}>
            <Text style={styles.expandKey}>Account</Text>
            <Text style={styles.expandValue}>{tx.account_no}</Text>
          </View>

          {tx.status === 'failed' && (
            <TouchableOpacity style={styles.disputeBtn} activeOpacity={0.75}>
              <Text style={styles.disputeText}>Raise Dispute →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const HistoryScreen: React.FC = () => {
  const [transactions, setTransactions] = useState<HistoryTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rechargeService.getHistory();
      if (Array.isArray(res) && res.length > 0) {
        setTransactions(res);
      } else {
        setTransactions(MOCK_DATA);
      }
    } catch {
      setTransactions(MOCK_DATA);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  }, [fetchHistory]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filtered = transactions.filter((tx) => applyFilter(tx, activeFilter));
  const grouped = groupHistory(filtered);

  const thisMonthTotal = transactions
    .filter((tx) => {
      const d = new Date(tx.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, tx) => acc + parseFloat(tx.recharge_amount), 0);

  const thisMonthCount = transactions.filter((tx) => {
    const d = new Date(tx.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />

      <FlatList
        data={[{ key: 'content' }]}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#007AFF"
            colors={['#007AFF']}
          />
        }
        ListHeaderComponent={
          <>
            {/* ── Header ── */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Transaction{`\n`}History</Text>
              <Text style={styles.headerSubtitle}>All your recharges & bill payments</Text>
            </View>

            {/* ── Month Summary Card ── */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>This Month</Text>
                <Text style={styles.summaryValue}>
                  ₹{thisMonthTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryCol}>
                <Text style={styles.summaryLabel}>Transactions</Text>
                <Text style={styles.summaryValue}>{thisMonthCount}</Text>
              </View>
            </View>

            {/* ── Filter Pills ── */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.filterPill,
                    activeFilter === f && styles.filterPillActive,
                  ]}
                  onPress={() => setActiveFilter(f)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === f && styles.filterTextActive,
                    ]}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* ── Transaction List ── */}
            {loading ? (
              <ActivityIndicator
                color="#007AFF"
                size="large"
                style={{ marginTop: 48 }}
              />
            ) : grouped.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🧾</Text>
                <Text style={styles.emptyText}>No transactions found</Text>
                <Text style={styles.emptySubtext}>Try a different filter</Text>
              </View>
            ) : (
              grouped.map((group) => (
                <View key={group.label}>
                  <Text style={styles.dateHeader}>{group.label}</Text>
                  {group.data.map((tx) => (
                    <TransactionCard key={tx.id} tx={tx} />
                  ))}
                </View>
              ))
            )}

            <View style={{ height: 110 }} />
          </>
        }
        renderItem={() => null}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // ── Header ──
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.8,
    lineHeight: 34,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },

  // ── Summary Card ──
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
    marginHorizontal: 12,
  },

  // ── Filters ──
  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterPill: {
    backgroundColor: '#E5E5EA',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterPillActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636366',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // ── Date header ──
  dateHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },

  // ── Transaction Card ──
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  txIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txEmoji: {
    fontSize: 24,
  },
  txCenter: {
    flex: 1,
    marginRight: 8,
  },
  txOperator: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  txAccount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginBottom: 2,
  },
  txTime: {
    fontSize: 11,
    color: '#AEAEB2',
    fontWeight: '500',
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // ── Expanded ──
  txExpanded: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  expandDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginBottom: 12,
  },
  expandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandKey: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  expandValue: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  disputeBtn: {
    marginTop: 8,
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  disputeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF3B30',
  },

  // ── Empty ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
});

export default HistoryScreen;

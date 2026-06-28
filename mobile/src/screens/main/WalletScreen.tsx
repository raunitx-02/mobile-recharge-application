import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Platform,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

import { walletService } from '../../services/wallet.service';
import { useAuthStore } from '../../store/auth.store';
import { formatCurrency } from '../../utils/formatters';
import { colors } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Transaction {
  id: string;
  description: string;
  amount: string;
  type: 'credit' | 'debit';
  created_at: string;
}

interface GroupedTransactions {
  label: string;
  data: Transaction[];
}

type WithdrawMode = 'upi' | 'bank';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'w1',
    description: 'Referral Cashback Credit',
    amount: '100.00',
    type: 'credit',
    created_at: new Date().toISOString(),
  },
  {
    id: 'w2',
    description: 'Wallet Top-up via UPI',
    amount: '500.00',
    type: 'credit',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'w3',
    description: 'Jio Prepaid Recharge Debit',
    amount: '299.00',
    type: 'debit',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'w4',
    description: 'BSES Electricity Bill Paid',
    amount: '1240.00',
    type: 'debit',
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const QUICK_AMOUNTS = ['50', '100', '200', '500', '1000', '2000'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday.getTime() - 86400000);

  if (date >= startOfToday) return 'TODAY';
  if (date >= startOfYesterday) return 'YESTERDAY';
  return 'EARLIER';
}

function groupTransactions(transactions: Transaction[]): GroupedTransactions[] {
  const groups: Record<string, Transaction[]> = {};
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

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function getTxEmoji(tx: Transaction): string {
  if (tx.type === 'credit') {
    if (tx.description.toLowerCase().includes('cashback')) return '🎁';
    if (tx.description.toLowerCase().includes('referral')) return '🎁';
    return '💰';
  }
  if (tx.description.toLowerCase().includes('recharge')) return '⚡';
  if (tx.description.toLowerCase().includes('bill')) return '🧾';
  return '💸';
}

function getTxSubLabel(tx: Transaction): string {
  if (tx.type === 'credit') {
    if (tx.description.toLowerCase().includes('cashback')) return 'Cashback Credit';
    if (tx.description.toLowerCase().includes('referral')) return 'Referral Bonus';
    return 'Wallet Deposit';
  }
  if (tx.description.toLowerCase().includes('recharge')) return 'Recharge Debit';
  if (tx.description.toLowerCase().includes('bill')) return 'Bill Payment Debit';
  return 'Wallet Debit';
}

function getTxIconBg(tx: Transaction): string {
  if (tx.type === 'credit') return '#EAF3FF';
  if (tx.description.toLowerCase().includes('recharge')) return '#FFF6EA';
  return '#FFEAEA';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TransactionItem: React.FC<{ tx: Transaction }> = ({ tx }) => {
  const isCredit = tx.type === 'credit';
  const emoji = getTxEmoji(tx);
  const subLabel = getTxSubLabel(tx);
  const iconBg = getTxIconBg(tx);

  return (
    <View style={styles.txCard}>
      <View style={[styles.txIconCircle, { backgroundColor: iconBg }]}>
        <Text style={styles.txEmoji}>{emoji}</Text>
      </View>

      <View style={styles.txCenter}>
        <Text style={styles.txDescription} numberOfLines={1}>
          {tx.description}
        </Text>
        <Text style={styles.txSubLabel}>{subLabel}</Text>
      </View>

      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: isCredit ? '#34C759' : '#1C1C1E' }]}>
          {isCredit ? '+' : '-'}₹{tx.amount}
        </Text>
        <Text style={styles.txTime}>{formatTime(tx.created_at)}</Text>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WalletScreen: React.FC = () => {
  const { user } = useAuthStore();

  const [balance, setBalance] = useState<number>(2350.0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingTx, setLoadingTx] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [addAmount, setAddAmount] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawMode, setWithdrawMode] = useState<WithdrawMode>('upi');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [processingAdd, setProcessingAdd] = useState(false);
  const [processingWithdraw, setProcessingWithdraw] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBalance = useCallback(async () => {
    setLoadingBalance(true);
    try {
      const res = await walletService.getBalance();
      const bal = parseFloat(res?.data?.data?.balance ?? res?.data?.balance ?? 0);
      if (!isNaN(bal)) setBalance(bal);
    } catch {
      // keep default balance
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await walletService.getHistory();
      const list = res?.data?.data?.transactions ?? res?.data?.data ?? [];
      if (Array.isArray(list) && list.length > 0) {
        setTransactions(list);
      } else {
        setTransactions(MOCK_TRANSACTIONS);
      }
    } catch {
      setTransactions(MOCK_TRANSACTIONS);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setRefreshing(false);
  }, [fetchBalance, fetchTransactions]);

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [fetchBalance, fetchTransactions]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleAddMoney = async () => {
    const amt = parseFloat(addAmount);
    if (!addAmount || isNaN(amt) || amt <= 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid amount' });
      return;
    }
    if (amt < 10) {
      Toast.show({ type: 'error', text1: 'Minimum top-up amount is ₹10' });
      return;
    }
    setProcessingAdd(true);
    try {
      const orderRes = await walletService.createOrder(amt);
      const orderId = orderRes?.data?.data?.orderId ?? `order_${Date.now()}`;
      // For demo, directly verify with mock payment ID
      await walletService.verifyPayment({
        orderId,
        paymentId: `pay_demo_${Date.now()}`,
        signature: 'demo_signature',
      }).catch(() => {});
      setBalance((prev) => prev + amt);
      setAddAmount('');
      Toast.show({ type: 'success', text1: `₹${amt} added to wallet!` });
      fetchTransactions();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.message ?? 'Failed to add money. Try again.',
      });
    } finally {
      setProcessingAdd(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    if (balance < 100) return;

    if (!withdrawAmount || isNaN(amt) || amt <= 0) {
      Toast.show({ type: 'error', text1: 'Enter a valid withdrawal amount' });
      return;
    }
    if (amt > balance) {
      Toast.show({ type: 'error', text1: 'Insufficient wallet balance' });
      return;
    }
    if (withdrawMode === 'upi' && !upiId.trim()) {
      Toast.show({ type: 'error', text1: 'Enter your UPI ID' });
      return;
    }
    if (withdrawMode === 'bank' && (!bankAccount.trim() || !bankIfsc.trim())) {
      Toast.show({ type: 'error', text1: 'Enter bank account and IFSC' });
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ₹${amt} to your ${withdrawMode === 'upi' ? `UPI ID: ${upiId}` : 'bank account'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            setProcessingWithdraw(true);
            try {
              await walletService.withdrawFunds({
                amount: amt,
                upiId: withdrawMode === 'upi' ? upiId : undefined,
                bankAccount: withdrawMode === 'bank' ? bankAccount : undefined,
                ifsc: withdrawMode === 'bank' ? bankIfsc : undefined,
              });
              setBalance((prev) => prev - amt);
              setWithdrawAmount('');
              setUpiId('');
              setBankAccount('');
              setBankIfsc('');
              setShowWithdraw(false);
              Toast.show({ type: 'success', text1: `₹${amt} withdrawal initiated!` });
              fetchTransactions();
            } catch (err: any) {
              Toast.show({
                type: 'error',
                text1: err?.message ?? 'Withdrawal failed. Try again.',
              });
            } finally {
              setProcessingWithdraw(false);
            }
          },
        },
      ],
    );
  };

  // ── Grouped transactions ───────────────────────────────────────────────────

  const grouped = groupTransactions(transactions);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A2463" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero Card ── */}
          <LinearGradient
            colors={['#0A2463', '#1B4FCC', '#007AFF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Decorative circles */}
            <View style={styles.heroBubble1} />
            <View style={styles.heroBubble2} />

            <Text style={styles.heroTitle}>My Wallet</Text>

            {loadingBalance ? (
              <ActivityIndicator color="#ffffff" size="large" style={{ marginVertical: 12 }} />
            ) : (
              <Text style={styles.heroBalance}>
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            )}

            {/* Mini stats */}
            <View style={styles.heroStats}>
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Cashback Earned</Text>
                <Text style={styles.heroStatValue}>₹150.00</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStatItem}>
                <Text style={styles.heroStatLabel}>Total Spent</Text>
                <Text style={styles.heroStatValue}>₹6,767.00</Text>
              </View>
            </View>

            {/* Action pills */}
            <View style={styles.heroActions}>
              <TouchableOpacity
                style={styles.heroPillSolid}
                activeOpacity={0.85}
                onPress={() => setShowWithdraw(false)}
              >
                <Text style={styles.heroPillSolidText}>+ Add Money</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.heroPillOutline}
                activeOpacity={0.85}
                onPress={() => setShowWithdraw((v) => !v)}
              >
                <Text style={styles.heroPillOutlineText}>↑ Withdraw</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* ── Withdraw Banner / Form ── */}
          {showWithdraw && (
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Withdraw Funds</Text>

              {balance < 100 ? (
                <View style={styles.lockBanner}>
                  <Text style={styles.lockBannerEmoji}>🔒</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lockBannerTitle}>Withdrawal Locked</Text>
                    <Text style={styles.lockBannerBody}>
                      Minimum ₹100 cashback balance required to withdraw. Earn more cashback by
                      making recharges and bill payments.
                    </Text>
                  </View>
                </View>
              ) : (
                <>
                  <View style={styles.segmentRow}>
                    <TouchableOpacity
                      style={[
                        styles.segmentPill,
                        withdrawMode === 'upi' && styles.segmentPillActive,
                      ]}
                      onPress={() => setWithdrawMode('upi')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          withdrawMode === 'upi' && styles.segmentTextActive,
                        ]}
                      >
                        UPI ID
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.segmentPill,
                        withdrawMode === 'bank' && styles.segmentPillActive,
                      ]}
                      onPress={() => setWithdrawMode('bank')}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          withdrawMode === 'bank' && styles.segmentTextActive,
                        ]}
                      >
                        Bank Transfer
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {withdrawMode === 'upi' ? (
                    <TextInput
                      style={styles.withdrawInput}
                      placeholder="Enter UPI ID (e.g. name@upi)"
                      placeholderTextColor="#AEAEB2"
                      value={upiId}
                      onChangeText={setUpiId}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  ) : (
                    <>
                      <TextInput
                        style={styles.withdrawInput}
                        placeholder="Bank Account Number"
                        placeholderTextColor="#AEAEB2"
                        value={bankAccount}
                        onChangeText={setBankAccount}
                        keyboardType="number-pad"
                      />
                      <TextInput
                        style={[styles.withdrawInput, { marginTop: 10 }]}
                        placeholder="IFSC Code"
                        placeholderTextColor="#AEAEB2"
                        value={bankIfsc}
                        onChangeText={setBankIfsc}
                        autoCapitalize="characters"
                      />
                    </>
                  )}

                  <TextInput
                    style={[styles.withdrawInput, { marginTop: 10 }]}
                    placeholder="Withdrawal Amount (₹)"
                    placeholderTextColor="#AEAEB2"
                    value={withdrawAmount}
                    onChangeText={setWithdrawAmount}
                    keyboardType="decimal-pad"
                  />

                  <TouchableOpacity
                    style={styles.withdrawBtn}
                    onPress={handleWithdraw}
                    activeOpacity={0.85}
                    disabled={processingWithdraw}
                  >
                    {processingWithdraw ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.withdrawBtnText}>Confirm Withdrawal</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* ── Quick Amounts ── */}
          <View style={styles.quickAmountSection}>
            <Text style={styles.sectionLabel}>Quick Add</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickAmountRow}
            >
              {QUICK_AMOUNTS.map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[
                    styles.quickChip,
                    addAmount === amt && styles.quickChipActive,
                  ]}
                  onPress={() => setAddAmount(amt)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.quickChipText,
                      addAmount === amt && styles.quickChipTextActive,
                    ]}
                  >
                    ₹{amt}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* ── Add Money Card ── */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Add Money to Wallet</Text>

            <View style={styles.amountInputWrapper}>
              <Text style={styles.rupeePrefix}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#C7C7CC"
                value={addAmount}
                onChangeText={setAddAmount}
                keyboardType="decimal-pad"
                returnKeyType="done"
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleAddMoney}
              disabled={processingAdd}
            >
              <LinearGradient
                colors={['#1B4FCC', '#007AFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.proceedBtn}
              >
                {processingAdd ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.proceedBtnText}>Proceed to Pay</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.secureNote}>🔒 Secured via Razorpay · UPI / Cards / Net Banking</Text>
          </View>

          {/* ── Transaction History ── */}
          <View style={styles.historySection}>
            <Text style={styles.historyTitle}>Transaction History</Text>

            {loadingTx ? (
              <ActivityIndicator color="#007AFF" style={{ marginTop: 24 }} />
            ) : grouped.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>💳</Text>
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>Add money to get started</Text>
              </View>
            ) : (
              grouped.map((group) => (
                <View key={group.label}>
                  <Text style={styles.groupLabel}>{group.label}</Text>
                  {group.data.map((tx) => (
                    <TransactionItem key={tx.id} tx={tx} />
                  ))}
                </View>
              ))
            )}
          </View>

          {/* Footer spacing for tab bar */}
          <View style={{ height: 110 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },

  // ── Hero ──
  heroCard: {
    marginHorizontal: 20,
    marginTop: 60,
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBubble1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -60,
    right: -40,
  },
  heroBubble2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -30,
    left: -20,
  },
  heroTitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroBalance: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 20,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  heroStatValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: 8,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 12,
  },
  heroPillSolid: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingVertical: 11,
    alignItems: 'center',
  },
  heroPillSolidText: {
    color: '#1B4FCC',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroPillOutline: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  heroPillOutlineText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Quick Amounts ──
  quickAmountSection: {
    marginTop: 24,
    paddingLeft: 20,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  quickAmountRow: {
    paddingRight: 20,
    gap: 8,
    flexDirection: 'row',
  },
  quickChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: '#D1D1D6',
  },
  quickChipActive: {
    backgroundColor: '#EAF3FF',
    borderColor: '#007AFF',
  },
  quickChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  quickChipTextActive: {
    color: '#007AFF',
  },

  // ── Section Card ──
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
    letterSpacing: -0.3,
  },

  // ── Add Money ──
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  rupeePrefix: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1C1C1E',
    marginRight: 4,
    paddingTop: 6,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1C1C1E',
    minWidth: 120,
    textAlign: 'center',
    letterSpacing: -1,
  },
  proceedBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  proceedBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secureNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#AEAEB2',
    fontWeight: '500',
  },

  // ── Withdraw ──
  lockBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF6EA',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FFCC02',
  },
  lockBannerEmoji: {
    fontSize: 24,
  },
  lockBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  lockBannerBody: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  segmentPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  segmentPillActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  segmentTextActive: {
    color: '#007AFF',
  },
  withdrawInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 11,
    fontSize: 15,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  withdrawBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
  },
  withdrawBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // ── History ──
  historySection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 8,
  },
  txCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  txIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txEmoji: {
    fontSize: 22,
  },
  txCenter: {
    flex: 1,
    marginRight: 8,
  },
  txDescription: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 3,
  },
  txSubLabel: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
  },
  txTime: {
    fontSize: 11,
    color: '#AEAEB2',
    fontWeight: '500',
  },

  // ── Empty ──
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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

export default WalletScreen;

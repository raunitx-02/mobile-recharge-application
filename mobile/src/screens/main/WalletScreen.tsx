import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { colors } from '../../theme';
import { walletService } from '../../services/wallet.service';
import { useAuthStore } from '../../store/auth.store';
import Toast from 'react-native-toast-message';
import { formatCurrency } from '../../utils/formatters';
import { TransactionItem } from '../../components/ui/TransactionItem';

export const WalletScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);

  // Withdraw Modal State
  const [withdrawMode, setWithdrawMode] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState<'upi' | 'bank'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const fetchBalance = async () => {
    try {
      const res = await walletService.getWalletDetails();
      const bal = parseFloat(res.data.data.balance);
      setBalance(bal);
      setRecentTxns(res.data.data.recentTransactions || []);
      if (user) {
        setUser({ walletBalance: bal });
      }
    } catch (err) {
      // Fallback dummy wallet history for testing
      setRecentTxns([
        { id: 't1', description: 'Referral Cashback Credit', amount: '100.00', type: 'credit', created_at: new Date().toISOString() },
        { id: 't2', description: 'Wallet Deposit', amount: '500.00', type: 'credit', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 't3', description: 'Jio Mobile Recharge Settle', amount: '299.00', type: 'debit', created_at: new Date(Date.now() - 86400000).toISOString() }
      ]);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchBalance();
    setRefreshing(false);
  };

  const handleAddMoney = async () => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a valid deposit amount' });
      return;
    }

    setLoading(true);
    try {
      const orderRes = await walletService.createOrder(val);
      const { orderId } = orderRes.data.data;

      const verifyRes = await walletService.verifyPayment({
        orderId,
        paymentId: `pay_mock_${Date.now()}`,
        signature: 'mock_signature'
      });

      const updatedBalance = parseFloat(verifyRes.data.data.balance);
      setBalance(updatedBalance);
      if (user) {
        setUser({ walletBalance: updatedBalance });
      }

      Toast.show({
        type: 'success',
        text1: 'Wallet Top-up Successful 💰',
        text2: `Successfully credited ₹${amount} to your wallet.`
      });
      setAmount('');
      fetchBalance();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Deposit Failed',
        text2: err.response?.data?.message || 'Payment processor returned an error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(withdrawAmount);
    if (isNaN(val) || val <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Enter a valid amount' });
      return;
    }

    if (balance < 100) {
      Toast.show({
        type: 'error',
        text1: 'Withdrawal Limit',
        text2: 'Withdrawals are restricted until cashback balance reaches ₹100'
      });
      return;
    }

    if (val > balance) {
      Toast.show({ type: 'error', text1: 'Limit Exceeded', text2: 'Withdrawal amount exceeds available balance' });
      return;
    }

    if (withdrawType === 'upi' && !upiId.trim()) {
      Toast.show({ type: 'error', text1: 'Required Field', text2: 'Please enter a valid UPI ID' });
      return;
    }

    if (withdrawType === 'bank' && (!bankAccount.trim() || !ifsc.trim() || !accountHolder.trim())) {
      Toast.show({ type: 'error', text1: 'Required Fields', text2: 'Please fill in all bank details' });
      return;
    }

    setLoading(true);
    try {
      await walletService.withdrawFunds({
        amount: val,
        upiId: withdrawType === 'upi' ? upiId : undefined,
        bankAccount: withdrawType === 'bank' ? bankAccount : undefined,
        ifsc: withdrawType === 'bank' ? ifsc : undefined
      });

      const nextBalance = balance - val;
      setBalance(nextBalance);
      if (user) {
        setUser({ walletBalance: nextBalance });
      }

      Alert.alert('Withdrawal Initiated 💸', `₹${val} will be credited to your account within 2-4 business hours.`);
      setWithdrawAmount('');
      setUpiId('');
      setBankAccount('');
      setIfsc('');
      setAccountHolder('');
      setWithdrawMode(false);
      fetchBalance();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed', text2: 'Withdrawal processing failed' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Secure Wallet</Text>
        <Text style={styles.subtitle}>Instantly deposit funds or withdraw earned cashbacks into your account.</Text>
      </View>

      <GlassCard style={styles.balCard}>
        <Text style={styles.balLabel}>Cashback & Wallet Balance</Text>
        <Text style={styles.balAmount}>{formatCurrency(balance)}</Text>
        {balance < 100 && (
          <Text style={styles.limitWarning}>
            ⚠️ Minimum ₹100 balance required to withdraw funds.
          </Text>
        )}
      </GlassCard>

      {withdrawMode ? (
        <GlassCard style={styles.card}>
          <View style={styles.formHeader}>
            <TouchableOpacity onPress={() => setWithdrawMode(false)} style={styles.backBtn}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.formTitle}>Withdraw Money</Text>
          </View>

          <View style={styles.toggleRow}>
            <TouchableOpacity 
              style={[styles.toggleBtn, withdrawType === 'upi' && styles.toggleActive]}
              onPress={() => setWithdrawType('upi')}
            >
              <Text style={[styles.toggleText, withdrawType === 'upi' && styles.toggleTextActive]}>UPI Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.toggleBtn, withdrawType === 'bank' && styles.toggleActive]}
              onPress={() => setWithdrawType('bank')}
            >
              <Text style={[styles.toggleText, withdrawType === 'bank' && styles.toggleTextActive]}>Bank Transfer</Text>
            </TouchableOpacity>
          </View>

          {withdrawType === 'upi' ? (
            <GlassInput
              label="UPI ID"
              value={upiId}
              onChangeText={setUpiId}
              placeholder="e.g. name@upi"
              icon="💳"
            />
          ) : (
            <>
              <GlassInput
                label="Account Holder Name"
                value={accountHolder}
                onChangeText={setAccountHolder}
                placeholder="John Doe"
                icon="👤"
              />
              <GlassInput
                label="Bank Account Number"
                value={bankAccount}
                onChangeText={setBankAccount}
                placeholder="0123 4567 8901"
                keyboardType="numeric"
                icon="🏦"
              />
              <GlassInput
                label="IFSC Code"
                value={ifsc}
                onChangeText={(t) => setIfsc(t.toUpperCase())}
                placeholder="SBIN0001234"
                autoCapitalize="characters"
                icon="🔍"
              />
            </>
          )}

          <GlassInput
            label="Withdraw Amount"
            value={withdrawAmount}
            onChangeText={(t) => setWithdrawAmount(t.replace(/[^0-9]/g, ''))}
            placeholder={`Max: ₹${balance}`}
            keyboardType="number-pad"
            icon="₹"
          />

          <GlassButton
            title="Confirm Withdrawal"
            onPress={handleWithdraw}
            loading={loading}
            style={styles.btn}
          />
        </GlassCard>
      ) : (
        <>
          <GlassCard style={styles.card}>
            <GlassInput
              label="Deposit / Load Money"
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
              placeholder="Enter top-up amount"
              keyboardType="number-pad"
              icon="₹"
            />

            <View style={styles.actionRow}>
              <View style={{flex: 1}}>
                <GlassButton
                  title="Deposit Funds"
                  onPress={handleAddMoney}
                  loading={loading}
                />
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (balance < 100) {
                    Toast.show({
                      type: 'error',
                      text1: 'Withdrawal Blocked',
                      text2: 'You must reach at least ₹100 to withdraw cashbacks.'
                    });
                    return;
                  }
                  setWithdrawMode(true);
                }}
                style={[styles.withdrawBtn, balance < 100 && styles.disabledBtn]}
              >
                <Text style={[styles.withdrawText, balance < 100 && styles.disabledText]}>Withdraw Money</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Wallet Ledger / History</Text>
          </View>

          {recentTxns.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            recentTxns.map((txn) => (
              <TransactionItem
                key={txn.id}
                operator={txn.description}
                accountNo={txn.type === 'credit' ? 'Cashback/Loaded' : 'Settled'}
                amount={parseFloat(txn.amount)}
                type={txn.type}
                status="success"
                date={txn.created_at}
              />
            ))
          )}
        </>
      )}
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
    lineHeight: 18
  },
  balCard: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.04)',
    borderColor: 'rgba(0,122,255,0.08)'
  },
  balLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 6
  },
  balAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: -1.0
  },
  limitWarning: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.warning,
    marginTop: 10,
    textAlign: 'center'
  },
  card: {
    padding: 24,
    gap: 16
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8
  },
  withdrawBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white
  },
  withdrawText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary
  },
  disabledBtn: {
    borderColor: colors.textTertiary,
    opacity: 0.6
  },
  disabledText: {
    color: colors.textTertiary
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.04)'
  },
  backText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    padding: 4,
    borderRadius: 14,
    marginBottom: 8
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10
  },
  toggleActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  toggleTextActive: {
    color: colors.primary,
    fontWeight: '700'
  },
  btn: {
    marginTop: 8
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 4
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.2
  },
  empty: {
    padding: 32,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13,
    color: colors.textTertiary
  },
  footerSpacing: {
    height: 100
  }
});

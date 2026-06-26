import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { colors } from '../../theme';
import { walletService } from '../../services/wallet.service';
import { useAuthStore } from '../../store/auth.store';
import Toast from 'react-native-toast-message';
import { formatCurrency } from '../../utils/formatters';

export const WalletScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      const res = await walletService.getWalletDetails();
      const bal = parseFloat(res.data.data.balance);
      setBalance(bal);
      if (user) {
        setUser({ walletBalance: bal });
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Fetch Failed', text2: 'Failed to sync latest wallet balance' });
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
      // 1. Create order
      const orderRes = await walletService.createRazorpayOrder(val);
      const { orderId, keyId } = orderRes.data.data;

      // 2. Settle payment (Mocked verify payment signature since we bypass webviews)
      const verifyRes = await walletService.verifyRazorpayPayment({
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_mock_${Date.now()}`,
        razorpay_signature: 'mock_signature',
        amount: val
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
        <Text style={styles.subtitle}>Instantly deposit funds into your secure merchant account wallet.</Text>
      </View>

      <GlassCard style={styles.balCard}>
        <Text style={styles.balLabel}>Current Balance</Text>
        <Text style={styles.balAmount}>{formatCurrency(balance)}</Text>
      </GlassCard>

      <GlassCard style={styles.card}>
        <GlassInput
          label="Top-up Amount (INR)"
          value={amount}
          onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
          placeholder="Enter deposit amount"
          keyboardType="number-pad"
          icon="₹"
        />

        <GlassButton
          title="Deposit Funds"
          onPress={handleAddMoney}
          loading={loading}
          style={styles.btn}
        />
      </GlassCard>
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
  card: {
    padding: 24,
    gap: 16
  },
  btn: {
    marginTop: 8
  }
});

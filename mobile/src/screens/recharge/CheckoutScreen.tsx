import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Switch, ActivityIndicator, Alert, Linking, Platform,
  StatusBar, Animated, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { walletService } from '../../services/wallet.service';
import { secureStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'Checkout'>;

const API_BASE = 'http://187.127.155.149';

const OPERATOR_COLORS: Record<string, [string, string]> = {
  Jio:    ['#0C56C5', '#1E80FF'],
  Airtel: ['#E3022A', '#FF4060'],
  Vi:     ['#5C2883', '#8040CC'],
  BSNL:   ['#1B6B3A', '#2EA055'],
  Default:['#5B3CF5', '#7C5CFA'],
};

export const CheckoutScreen: React.FC<Props> = ({ navigation, route }) => {
  const { plan, phone, operator, circle, operatorKwikId, type } = route.params;
  const { user } = useAuthStore();

  const walletBalance = user?.walletBalance ?? 0;
  const maxCashback  = Math.floor(plan.amount * 0.20 * 100) / 100; // 20% max, rounded down
  const usableCashback = Math.min(walletBalance, maxCashback);

  const [useCashback, setUseCashback]   = useState(false);
  const [initiating, setInitiating]     = useState(false);
  const [payableAmount, setPayableAmount] = useState(plan.amount);
  
  // Custom payment selection states
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('gpay');
  const [customUpiId, setCustomUpiId] = useState('');

  const opColors = OPERATOR_COLORS[operator] || OPERATOR_COLORS.Default;

  // Recalculate payable whenever toggle changes
  useEffect(() => {
    setPayableAmount(
      useCashback && usableCashback > 0
        ? Math.max(1, Math.round((plan.amount - usableCashback) * 100) / 100)
        : plan.amount
    );
  }, [useCashback, usableCashback, plan.amount]);

  const handlePay = useCallback(async () => {
    if (initiating) return;
    setInitiating(true);

    try {
      const token = await secureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
      if (!token) {
        Toast.show({ type: 'error', text1: 'Session expired', text2: 'Please login again' });
        return;
      }

      // Open PayU checkout page in browser — it will redirect back after payment
      const params = new URLSearchParams({
        token,
        amount:       String(payableAmount),
        phone,
        operator,
        circle,
        plan_amount:  String(plan.amount),
        plan_id:      String(plan.id || ''),
        validity:     plan.validity || '',
        cashback_used: String(useCashback ? usableCashback : 0),
        type,
      });

      const url = `${API_BASE}/api/payment/recharge-checkout?${params.toString()}`;

      Toast.show({
        type: 'info',
        text1: 'Opening Secure Checkout 🔒',
        text2: 'Complete payment in browser and return here',
        visibilityTime: 3000,
      });

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        throw new Error('Cannot open browser on this device');
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Failed to open checkout', text2: err.message });
    } finally {
      setInitiating(false);
    }
  }, [initiating, payableAmount, phone, operator, circle, plan, useCashback, usableCashback, type]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={opColors[0]} />

      {/* Header */}
      <LinearGradient colors={opColors} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerOp}>{operator} {type === 'prepaid' ? 'Prepaid' : type === 'postpaid' ? 'Postpaid' : 'DTH'}</Text>
          <Text style={styles.headerPhone}>{phone}</Text>
          <Text style={styles.headerCircle}>{circle}</Text>
        </View>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Plan Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected Plan</Text>
          <View style={styles.planRow}>
            <View style={styles.planAmount}>
              <Text style={styles.planRupee}>₹</Text>
              <Text style={styles.planAmountNum}>{plan.amount}</Text>
            </View>
            <View style={styles.planDetails}>
              <Text style={styles.planValidity}>📅 {plan.validity}</Text>
              {!!plan.data && <Text style={styles.planData}>📶 {plan.data}</Text>}
              {!!plan.calls && <Text style={styles.planExtra}>📞 {plan.calls}</Text>}
              {!!plan.sms && <Text style={styles.planExtra}>💬 {plan.sms}</Text>}
            </View>
          </View>
          {!!plan.description && (
            <View style={styles.descBox}>
              <Text style={styles.descText}>✨ {plan.description}</Text>
            </View>
          )}
        </View>

        {/* Cashback Toggle */}
        {walletBalance > 0 && (
          <View style={styles.card}>
            <View style={styles.cashbackRow}>
              <View style={styles.cashbackLeft}>
                <Text style={styles.cashbackTitle}>Use Wallet Cashback</Text>
                <Text style={styles.cashbackSub}>
                  {usableCashback > 0
                    ? `Save ₹${usableCashback.toFixed(2)} (max 20% of ₹${plan.amount})`
                    : `Wallet balance: ₹${walletBalance.toFixed(2)}`}
                </Text>
                <Text style={styles.cashbackBalance}>
                  Your balance: <Text style={styles.cashbackBalanceAmt}>₹{walletBalance.toFixed(2)}</Text>
                </Text>
              </View>
              <Switch
                value={useCashback}
                onValueChange={(v) => {
                  if (usableCashback <= 0) {
                    Toast.show({ type: 'info', text1: 'Not enough cashback', text2: `Minimum ₹1 cashback needed` });
                    return;
                  }
                  setUseCashback(v);
                }}
                trackColor={{ false: colors.border, true: colors.primarySubtle }}
                thumbColor={useCashback ? colors.primary : '#fff'}
              />
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Plan Amount</Text>
            <Text style={styles.summaryValue}>₹{plan.amount.toFixed(2)}</Text>
          </View>
          {useCashback && usableCashback > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.success }]}>Cashback Applied</Text>
              <Text style={[styles.summaryValue, { color: colors.success }]}>−₹{usableCashback.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotal}>Total Payable</Text>
            <Text style={styles.summaryTotalAmt}>₹{payableAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Methods Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Payment Method</Text>
          
          {/* UPI Apps list */}
          <Text style={styles.paymentSectionHeader}>⚡ Popular UPI Apps</Text>
          <View style={styles.upiAppsList}>
            {[
              { id: 'gpay', name: 'Google Pay', icon: '🟢', appUrl: 'gpay://' },
              { id: 'phonepe', name: 'PhonePe', icon: '🟣', appUrl: 'phonepe://' },
              { id: 'paytm', name: 'Paytm', icon: '🔵', appUrl: 'paytmmp://' },
            ].map(app => (
              <TouchableOpacity
                key={app.id}
                style={[styles.upiAppOption, selectedPaymentMethod === app.id && styles.selectedOption]}
                onPress={() => setSelectedPaymentMethod(app.id)}
              >
                <Text style={styles.upiAppIcon}>{app.icon}</Text>
                <Text style={styles.upiAppName}>{app.name}</Text>
                {selectedPaymentMethod === app.id && <Text style={styles.checkedIcon}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Other UPI ID input */}
          <TouchableOpacity
            style={[styles.upiAppOption, selectedPaymentMethod === 'custom_upi' && styles.selectedOption, { marginTop: 8 }]}
            onPress={() => setSelectedPaymentMethod('custom_upi')}
          >
            <Text style={styles.upiAppIcon}>🔑</Text>
            <Text style={styles.upiAppName}>Pay using other UPI ID</Text>
            {selectedPaymentMethod === 'custom_upi' && <Text style={styles.checkedIcon}>✓</Text>}
          </TouchableOpacity>

          {selectedPaymentMethod === 'custom_upi' && (
            <View style={styles.customUpiInputWrap}>
              <TextInput
                style={styles.customUpiInput}
                placeholder="Enter UPI ID (e.g. name@upi)"
                placeholderTextColor={colors.textMuted}
                value={customUpiId}
                onChangeText={setCustomUpiId}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}

          {/* Cards */}
          <TouchableOpacity
            style={[styles.upiAppOption, selectedPaymentMethod === 'card' && styles.selectedOption, { marginTop: 16 }]}
            onPress={() => setSelectedPaymentMethod('card')}
          >
            <Text style={styles.upiAppIcon}>💳</Text>
            <Text style={styles.upiAppName}>Credit / Debit Card</Text>
            {selectedPaymentMethod === 'card' && <Text style={styles.checkedIcon}>✓</Text>}
          </TouchableOpacity>

          {selectedPaymentMethod === 'card' && (
            <View style={styles.cardFormWrap}>
              <TextInput
                style={styles.customUpiInput}
                placeholder="Card Number"
                keyboardType="number-pad"
                maxLength={16}
                placeholderTextColor={colors.textMuted}
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                <TextInput
                  style={[styles.customUpiInput, { flex: 1 }]}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  maxLength={5}
                  placeholderTextColor={colors.textMuted}
                />
                <TextInput
                  style={[styles.customUpiInput, { flex: 1 }]}
                  placeholder="CVV"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={3}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          )}

          {/* Netbanking */}
          <TouchableOpacity
            style={[styles.upiAppOption, selectedPaymentMethod === 'netbanking' && styles.selectedOption, { marginTop: 8 }]}
            onPress={() => setSelectedPaymentMethod('netbanking')}
          >
            <Text style={styles.upiAppIcon}>🏦</Text>
            <Text style={styles.upiAppName}>Net Banking</Text>
            {selectedPaymentMethod === 'netbanking' && <Text style={styles.checkedIcon}>✓</Text>}
          </TouchableOpacity>

          {selectedPaymentMethod === 'netbanking' && (
            <View style={styles.bankGrid}>
              {['SBI', 'HDFC', 'ICICI', 'Axis'].map(bank => (
                <TouchableOpacity key={bank} style={styles.bankChip}>
                  <Text style={styles.bankChipText}>{bank}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.secureNote}>🔒 256-bit encrypted · Secured by PayU</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Pay Button - Fixed at Bottom */}
      <View style={styles.payBar}>
        <View style={styles.payBarLeft}>
          <Text style={styles.payBarLabel}>You Pay</Text>
          <Text style={styles.payBarAmt}>₹{payableAmount.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.payBtn}
          onPress={handlePay}
          disabled={initiating}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[colors.primary, colors.primaryLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.payBtnGradient}
          >
            {initiating ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payBtnText}>Pay Now →</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerOp: { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
  headerPhone: { fontSize: 20, fontWeight: '900', color: '#fff', marginTop: 2, letterSpacing: 0.5 },
  headerCircle: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  scroll: { padding: 16 },

  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },

  planRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  planAmount: { flexDirection: 'row', alignItems: 'baseline' },
  planRupee: { fontSize: 20, fontWeight: '700', color: colors.text, marginRight: 2 },
  planAmountNum: { fontSize: 40, fontWeight: '900', color: colors.text, letterSpacing: -2 },
  planDetails: { flex: 1, gap: 6 },
  planValidity: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  planData: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  planExtra: { fontSize: 13, color: colors.textMuted },
  descBox: {
    marginTop: 14,
    backgroundColor: colors.primarySubtle,
    borderRadius: 10,
    padding: 10,
  },
  descText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  cashbackRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cashbackLeft: { flex: 1, marginRight: 16 },
  cashbackTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  cashbackSub: { fontSize: 13, color: colors.textSecondary, lineHeight: 18 },
  cashbackBalance: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  cashbackBalanceAmt: { color: colors.success, fontWeight: '700' },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  summaryLabel: { fontSize: 14, color: colors.textSecondary },
  summaryValue: { fontSize: 14, color: colors.text, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: colors.border, marginBottom: 12 },
  summaryTotal: { fontSize: 16, fontWeight: '700', color: colors.text },
  summaryTotalAmt: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: -0.5 },

  paymentSectionHeader: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginTop: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  upiAppsList: { gap: 8 },
  upiAppOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  selectedOption: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  upiAppName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text, marginLeft: 10 },
  upiAppIcon: { fontSize: 18 },
  checkedIcon: { fontSize: 14, fontWeight: '800', color: colors.primary },
  customUpiInputWrap: { marginTop: 8, paddingHorizontal: 4 },
  customUpiInput: { borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background, padding: 12, fontSize: 14, color: colors.text, fontWeight: '500' },
  cardFormWrap: { marginTop: 8, gap: 8 },
  bankGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  bankChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.background },
  bankChipText: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  secureNote: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 16 },

  payBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  payBarLeft: { flex: 1 },
  payBarLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  payBarAmt: { fontSize: 22, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  payBtn: { flex: 1, borderRadius: 14, overflow: 'hidden' },
  payBtnGradient: { paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  payBtnText: { fontSize: 16, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
});

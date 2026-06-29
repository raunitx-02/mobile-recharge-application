import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { walletService } from '../../services/wallet.service';
import { colors } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Withdraw'>;

export const WithdrawScreen: React.FC<Props> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [mode, setMode] = useState<'upi' | 'bank'>('upi');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a positive amount' });
      return;
    }
    if (mode === 'upi' && !upiId.trim()) {
      Toast.show({ type: 'error', text1: 'Required Field', text2: 'Please enter your UPI ID' });
      return;
    }
    if (mode === 'bank' && (!bankAccount.trim() || !ifsc.trim())) {
      Toast.show({ type: 'error', text1: 'Required Fields', text2: 'Please enter bank account and IFSC code' });
      return;
    }

    setLoading(true);
    try {
      const res = await walletService.withdrawFunds({
        amount: amt,
        upiId: mode === 'upi' ? upiId.trim() : undefined,
        bankAccount: mode === 'bank' ? bankAccount.trim() : undefined,
        ifsc: mode === 'bank' ? ifsc.trim() : undefined
      });

      if (res.data?.success) {
        Toast.show({
          type: 'success',
          text1: 'Request Submitted 🚀',
          text2: 'Withdrawal request is pending approval.'
        });
        navigation.goBack();
      } else {
        throw new Error(res.data?.message || 'Failed to submit withdrawal');
      }
    } catch (e: any) {
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: e.message || 'Error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#F5F5F7', '#EAEAEA']} style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw Funds</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.label}>Enter Withdrawal Amount</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currencySym}>₹</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              placeholder="0"
              maxLength={6}
            />
          </View>

          {/* Mode Selector */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setMode('upi')}
              style={[styles.tab, mode === 'upi' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'upi' && styles.tabTextActive]}>UPI Transfer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('bank')}
              style={[styles.tab, mode === 'bank' && styles.tabActive]}
            >
              <Text style={[styles.tabText, mode === 'bank' && styles.tabTextActive]}>Bank Account</Text>
            </TouchableOpacity>
          </View>

          {mode === 'upi' ? (
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>UPI ID</Text>
              <TextInput
                style={styles.formInput}
                value={upiId}
                onChangeText={setUpiId}
                placeholder="username@upi"
                autoCapitalize="none"
              />
            </View>
          ) : (
            <View>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Bank Account Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={bankAccount}
                  onChangeText={setBankAccount}
                  placeholder="Enter bank account number"
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>IFSC Code</Text>
                <TextInput
                  style={styles.formInput}
                  value={ifsc}
                  onChangeText={setIfsc}
                  placeholder="SBIN0001234"
                  autoCapitalize="characters"
                />
              </View>
            </View>
          )}

          <TouchableOpacity onPress={handleWithdraw} style={styles.submitBtn} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitText}>Submit Withdrawal Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#E5E5E5'
  },
  backBtn: { padding: 8 },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  content: { padding: 24, flex: 1, justifyContent: 'center' },
  label: { fontSize: 14, color: '#6E6E73', fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderBottomWidth: 2,
    borderColor: colors.primary,
    paddingBottom: 8,
    marginHorizontal: 40
  },
  currencySym: { fontSize: 32, fontWeight: '800', color: colors.text, marginRight: 8 },
  input: { fontSize: 36, fontWeight: '900', color: colors.text, minWidth: 80, textAlign: 'center' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#E5E5EA', borderRadius: 10, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: '#FFFFFF', elevation: 1 },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6E6E73' },
  tabTextActive: { color: colors.primary },
  formGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: '#6E6E73', marginBottom: 8 },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1C1C1E'
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    elevation: 3
  },
  submitText: { color: 'white', fontSize: 16, fontWeight: '700' }
});

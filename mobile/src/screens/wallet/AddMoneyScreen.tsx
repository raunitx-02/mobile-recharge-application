import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { colors } from '../../theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { secureStorage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMoney'>;

export const AddMoneyScreen: React.FC<Props> = ({ navigation }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    const token = await secureStorage.get(STORAGE_KEYS.ACCESS_TOKEN);
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a positive amount' });
      return;
    }
    if (amt < 10) {
      Toast.show({ type: 'error', text1: 'Minimum Limit', text2: 'Minimum topup amount is ₹10' });
      return;
    }

    setLoading(true);
    try {
      // Use relative API base or fallback to production server IP
      const apiBase = 'http://187.127.155.149';
      const checkoutUrl = `${apiBase}/api/payment/initiate?amount=${amt}&token=${token}`;
      
      Toast.show({
        type: 'info',
        text1: 'Opening Payment Gateway 💳',
        text2: 'Please complete payment in the opened browser window.'
      });

      const supported = await Linking.canOpenURL(checkoutUrl);
      if (supported) {
        await Linking.openURL(checkoutUrl);
      } else {
        Toast.show({ type: 'error', text1: 'Failed to open gateway', text2: 'No browser app found on device' });
      }
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Failed to initiate', text2: e.message || 'Error occurred' });
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
        <Text style={styles.headerTitle}>Add Money</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Enter Topup Amount</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.currencySym}>₹</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            placeholder="0.00"
            maxLength={6}
            autoFocus
          />
        </View>

        {/* Quick Packages */}
        <View style={styles.grid}>
          {[100, 500, 1000, 2000].map((pkg) => (
            <TouchableOpacity
              key={pkg}
              onPress={() => setAmount(String(pkg))}
              style={[styles.pkgBtn, amount === String(pkg) && styles.pkgActive]}
            >
              <Text style={[styles.pkgText, amount === String(pkg) && styles.pkgTextActive]}>+ ₹{pkg}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={handleAdd} style={styles.payBtn} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.payText}>Proceed to PayU Gateway</Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.footerHint}>
          Payments are secured by PayU. Do not hit back or close the browser until the payment status updates.
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
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
  input: { fontSize: 36, fontWeight: '900', color: colors.text, minWidth: 120, textAlign: 'center' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  pkgBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 }
  },
  pkgActive: { borderColor: colors.primary, backgroundColor: 'rgba(0,122,255,0.05)' },
  pkgText: { fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  pkgTextActive: { color: colors.primary },
  payBtn: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 }
  },
  payText: { color: 'white', fontSize: 16, fontWeight: '700' },
  footerHint: { textAlign: 'center', fontSize: 11, color: '#8E8E93', marginTop: 24, lineHeight: 16 }
});

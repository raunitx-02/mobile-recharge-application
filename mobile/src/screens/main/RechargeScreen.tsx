import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { colors } from '../../theme';
import { rechargeService } from '../../services/recharge.service';
import { useAuthStore } from '../../store/auth.store';
import { RechargeConfirmModal } from '../../components/modals/RechargeConfirmModal';
import Toast from 'react-native-toast-message';

export const RechargeScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState<any>(null);
  const [circle, setCircle] = useState('National');
  
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Auto detect operator on entering 10-digit mobile number
  useEffect(() => {
    if (phone.length === 10) {
      detectOperatorInfo();
    } else {
      setOperator(null);
    }
  }, [phone]);

  const detectOperatorInfo = async () => {
    setDetecting(true);
    try {
      const res = await rechargeService.detectOperator(phone);
      const { operator: op, circle: cir } = res.data.data;
      setOperator(op);
      setCircle(cir || 'National');
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Detection Failed',
        text2: 'Failed to auto-detect operator info'
      });
    } finally {
      setDetecting(false);
    }
  };

  const handleCheckoutInit = () => {
    if (phone.length !== 10) {
      Toast.show({ type: 'error', text1: 'Invalid Phone', text2: 'Mobile number must be exactly 10 digits' });
      return;
    }
    if (!operator) {
      Toast.show({ type: 'error', text1: 'Missing Operator', text2: 'Please wait for operator auto-detection' });
      return;
    }
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a valid amount' });
      return;
    }

    setModalVisible(true);
  };

  const handlePaymentConfirm = async () => {
    setModalVisible(false);
    setLoading(true);
    
    try {
      const res = await rechargeService.initiateRecharge({
        type: 'prepaid',
        operatorCode: operator.code,
        accountNo: phone,
        circle,
        amount: parseFloat(amount)
      });
      
      const txn = res.data.data;

      if (txn.status === 'success') {
        Alert.alert('Recharge Successful ⚡', `Transaction of ₹${amount} completed. Commission paid.`);
        setPhone('');
        setAmount('');
        setOperator(null);
        
        // Update user state wallet balance
        if (user) {
          setUser({ walletBalance: parseFloat(txn.closing_balance) });
        }
      } else {
        Alert.alert('Recharge Processing ◴', 'Your transaction is pending billing provider completion confirmation.');
      }
    } catch (err: any) {
      Alert.alert('Transaction Failed ❌', err.response?.data?.message || 'Insufficent wallet balance or API provider error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.title}>Mobile Recharge</Text>
        <Text style={styles.subtitle}>Execute lightning fast mobile prepaid recharges instantly.</Text>
      </View>

      <GlassCard style={styles.card}>
        <GlassInput
          label="Mobile Number"
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
          placeholder="Enter 10-digit mobile"
          keyboardType="phone-pad"
          maxLength={10}
          icon="📱"
        />

        {detecting && <Text style={styles.loadingText}>Detecting carrier network...</Text>}
        
        {operator && (
          <View style={styles.operatorBox}>
            <Text style={styles.operatorText}>Operator: <strong>{operator.name}</strong></Text>
            <Text style={styles.operatorText}>Circle: <strong>{circle}</strong></Text>
          </View>
        )}

        <GlassInput
          label="Recharge Amount (INR)"
          value={amount}
          onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
          placeholder="Enter recharge denomination"
          keyboardType="number-pad"
          icon="₹"
        />

        <GlassButton
          title="Proceed to Settle Bill"
          onPress={handleCheckoutInit}
          loading={loading}
          style={styles.btn}
        />
      </GlassCard>

      <RechargeConfirmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handlePaymentConfirm}
        operator={operator?.name || 'Prepaid'}
        accountNo={phone}
        amount={parseFloat(amount) || 0}
      />
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
    paddingTop: 60
  },
  header: {
    alignItems: 'center',
    marginBottom: 28
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
  card: {
    padding: 24,
    gap: 16
  },
  loadingText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  operatorBox: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,122,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,122,255,0.1)'
  },
  operatorText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginVertical: 2
  },
  btn: {
    marginTop: 8
  }
});

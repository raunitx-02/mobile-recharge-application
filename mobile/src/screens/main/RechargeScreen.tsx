import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { colors } from '../../theme';
import { rechargeService } from '../../services/recharge.service';
import { useAuthStore } from '../../store/auth.store';
import { RechargeConfirmModal } from '../../components/modals/RechargeConfirmModal';
import Toast from 'react-native-toast-message';

const categories = [
  { id: 'prepaid', title: 'Mobile Prepaid', icon: '📱', color: '#007AFF' },
  { id: 'postpaid', title: 'Mobile Postpaid', icon: '📞', color: '#5AC8FA' },
  { id: 'dth', title: 'DTH Recharge', icon: '📡', color: '#FF9500' },
  { id: 'electricity', title: 'Electricity Bill', icon: '⚡', color: '#FFCC00' },
  { id: 'water', title: 'Water Bill', icon: '💧', color: '#5856D6' },
  { id: 'gas', title: 'Piped Gas', icon: '🔥', color: '#FF2D55' },
  { id: 'broadband', title: 'Broadband', icon: '🌐', color: '#4CD964' },
  { id: 'fastag', title: 'FASTag', icon: '🚗', color: '#8E8E93' },
  { id: 'rent', title: 'Rent Pay', icon: '🏠', color: '#AF52DE' },
];

export const RechargeScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  // Form Fields
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [operator, setOperator] = useState<any>(null);
  const [circle, setCircle] = useState('National');
  
  // Custom utility fields
  const [consumerId, setConsumerId] = useState('');
  const [billerName, setBillerName] = useState('');
  const [landlordName, setLandlordName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifscCode, setIfscCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Auto detect operator for mobile prepaid/postpaid
  useEffect(() => {
    if ((selectedCat === 'prepaid' || selectedCat === 'postpaid') && phone.length === 10) {
      detectOperatorInfo();
    } else {
      setOperator(null);
    }
  }, [phone, selectedCat]);

  const detectOperatorInfo = async () => {
    setDetecting(true);
    try {
      const res = await rechargeService.detectOperator(phone);
      const { operator: op, circle: cir } = res.data.data;
      setOperator(op);
      setCircle(cir || 'National');
    } catch (err) {
      setOperator({ name: 'Jio', code: 'JIO' }); // Development fallback carrier
      setCircle('National');
    } finally {
      setDetecting(false);
    }
  };

  const handleCheckoutInit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      Toast.show({ type: 'error', text1: 'Invalid Amount', text2: 'Please enter a valid amount' });
      return;
    }
    
    // Form validation based on category
    if (selectedCat === 'prepaid' || selectedCat === 'postpaid') {
      if (phone.length !== 10) {
        Toast.show({ type: 'error', text1: 'Invalid Phone', text2: 'Mobile number must be 10 digits' });
        return;
      }
    } else if (selectedCat === 'rent') {
      if (!landlordName || !bankAccount || !ifscCode) {
        Toast.show({ type: 'error', text1: 'Missing Details', text2: 'Please complete all bank details' });
        return;
      }
    } else {
      if (!consumerId) {
        Toast.show({ type: 'error', text1: 'Required Field', text2: 'Please fill in account/consumer ID' });
        return;
      }
    }

    setModalVisible(true);
  };

  const handlePaymentConfirm = async () => {
    setModalVisible(false);
    setLoading(true);
    
    try {
      let typeParam = selectedCat === 'prepaid' || selectedCat === 'postpaid' || selectedCat === 'dth' ? selectedCat : 'bbps';
      
      const payload = {
        type: typeParam,
        operatorCode: operator?.code || selectedCat?.toUpperCase() || 'BILLER',
        accountNo: selectedCat === 'prepaid' || selectedCat === 'postpaid' ? phone : (selectedCat === 'rent' ? bankAccount : consumerId),
        circle,
        amount: parseFloat(amount),
        billerName: billerName || undefined
      };

      const res = await rechargeService.initiateRecharge(payload);
      const txn = res.data.data;
      
      if (txn.status === 'success') {
        Alert.alert('Payment Successful 🎉', `Successfully processed payment of ₹${amount}.`);
        resetForm();
        if (user) {
          setUser({ walletBalance: parseFloat(txn.closing_balance) });
        }
      } else {
        Alert.alert('Payment Processing ◴', 'Your billing provider is currently settling the transaction.');
      }
    } catch (err: any) {
      Alert.alert('Transaction Failed ❌', err.response?.data?.message || 'Insufficient wallet balance or aggregator offline.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPhone('');
    setAmount('');
    setOperator(null);
    setConsumerId('');
    setBillerName('');
    setLandlordName('');
    setBankAccount('');
    setIfscCode('');
    setSelectedCat(null);
  };

  const renderCategoryForm = () => {
    const categoryTitle = categories.find(c => c.id === selectedCat)?.title || 'Service Form';
    
    return (
      <GlassCard style={styles.card}>
        <View style={styles.formHeader}>
          <TouchableOpacity onPress={() => setSelectedCat(null)} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.formTitle}>{categoryTitle}</Text>
        </View>

        {(selectedCat === 'prepaid' || selectedCat === 'postpaid') && (
          <>
            <GlassInput
              label="Mobile Number"
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              icon="📱"
            />
            {detecting && <Text style={styles.loadingText}>Checking active network...</Text>}
            {operator && (
              <View style={styles.operatorBox}>
                <Text style={styles.operatorText}>Operator: <Text style={{fontWeight: '700'}}>{operator.name}</Text></Text>
                <Text style={styles.operatorText}>Circle: <Text style={{fontWeight: '700'}}>{circle}</Text></Text>
              </View>
            )}
          </>
        )}

        {selectedCat === 'dth' && (
          <>
            <GlassInput
              label="Subscriber ID / Card Number"
              value={consumerId}
              onChangeText={setConsumerId}
              placeholder="Enter DTH customer ID"
              keyboardType="numeric"
              icon="📡"
            />
            <GlassInput
              label="DTH Operator"
              value={billerName}
              onChangeText={setBillerName}
              placeholder="e.g. Tata Sky, Dish TV, Airtel DTH"
              icon="🏢"
            />
          </>
        )}

        {(selectedCat === 'electricity' || selectedCat === 'water' || selectedCat === 'gas' || selectedCat === 'broadband' || selectedCat === 'fastag') && (
          <>
            <GlassInput
              label="Consumer / Account Number"
              value={consumerId}
              onChangeText={setConsumerId}
              placeholder="Enter consumer or account ID"
              icon="🔑"
            />
            <GlassInput
              label="Biller / Board Provider"
              value={billerName}
              onChangeText={setBillerName}
              placeholder="e.g. BSES, Delhi Jal Board, Indrapraastha Gas"
              icon="🏛️"
            />
          </>
        )}

        {selectedCat === 'rent' && (
          <>
            <GlassInput
              label="Landlord Full Name"
              value={landlordName}
              onChangeText={landlordName}
              placeholder="Enter landlord name"
              icon="👤"
            />
            <GlassInput
              label="Bank Account Number"
              value={bankAccount}
              onChangeText={setBankAccount}
              placeholder="0123 4567 8901"
              keyboardType="numeric"
              icon="💳"
            />
            <GlassInput
              label="IFSC Code"
              value={ifscCode}
              onChangeText={(t) => setIfscCode(t.toUpperCase())}
              placeholder="SBIN0001234"
              autoCapitalize="characters"
              icon="🏦"
            />
          </>
        )}

        <GlassInput
          label="Amount (INR)"
          value={amount}
          onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
          placeholder="Enter denomination (₹)"
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
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.header}>
        <Text style={styles.title}>Payments Hub</Text>
        <Text style={styles.subtitle}>Pay any mobile recharge, broadband, or home bills instantly.</Text>
      </View>

      {selectedCat ? renderCategoryForm() : (
        <View style={styles.gridContainer}>
          <Text style={styles.sectionTitle}>Recharges & Utilities</Text>
          <View style={styles.grid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.gridItem}
                onPress={() => setSelectedCat(cat.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: cat.color + '15' }]}>
                  <Text style={styles.icon}>{cat.icon}</Text>
                </View>
                <Text style={styles.itemTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <RechargeConfirmModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handlePaymentConfirm}
        operator={selectedCat?.toUpperCase() || 'Prepaid'}
        accountNo={selectedCat === 'prepaid' || selectedCat === 'postpaid' ? phone : (selectedCat === 'rent' ? bankAccount : consumerId)}
        amount={parseFloat(amount) || 0}
      />
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
  gridContainer: {
    marginTop: 8
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    letterSpacing: -0.2
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12
  },
  gridItem: {
    width: (Dimensions.get('window').width - 56) / 3,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)'
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10
  },
  icon: {
    fontSize: 22
  },
  itemTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center'
  },
  card: {
    padding: 24,
    gap: 16
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
  },
  footerSpacing: {
    height: 100
  }
});

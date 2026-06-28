import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme';
import { RechargeConfirmModal } from '../../components/modals/RechargeConfirmModal';
import Toast from 'react-native-toast-message';
import { rechargeService } from '../../services/recharge.service';
import { useAuthStore } from '../../store/auth.store';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 56) / 4;

// ─── Full BBPS + Recharge Categories ─────────────────────────────────────────
const QUICK_ACTIONS = [
  { id: 'prepaid',    label: 'Mobile\nPrepaid',   icon: '📱', grad: ['#007AFF', '#5AC8FA'] },
  { id: 'postpaid',   label: 'Mobile\nPostpaid',  icon: '📞', grad: ['#5856D6', '#AF52DE'] },
  { id: 'dth',        label: 'DTH\nRecharge',     icon: '📡', grad: ['#FF9500', '#FFCC00'] },
  { id: 'electricity',label: 'Electricity\nBill',  icon: '⚡', grad: ['#FF6B35', '#FF9500'] },
];

const BILL_PAYMENTS = [
  { id: 'electricity', label: 'Electricity',   icon: '⚡',  color: '#FF6B35', bg: '#FFF0EA' },
  { id: 'water',       label: 'Water',          icon: '💧',  color: '#007AFF', bg: '#EAF3FF' },
  { id: 'gas_piped',   label: 'Piped Gas',      icon: '🔥',  color: '#FF3B30', bg: '#FFEAEA' },
  { id: 'broadband',   label: 'Broadband',      icon: '🌐',  color: '#34C759', bg: '#EAFFF0' },
  { id: 'landline',    label: 'Landline',        icon: '☎️',  color: '#5856D6', bg: '#F0EAFF' },
  { id: 'cable_tv',    label: 'Cable TV',        icon: '📺',  color: '#FF9500', bg: '#FFF6EA' },
  { id: 'gas_cylinder',label: 'LPG Cylinder',   icon: '🛢️',  color: '#FF6B35', bg: '#FFF0EA' },
  { id: 'municipal',   label: 'Municipal Tax',   icon: '🏛️',  color: '#5856D6', bg: '#F0EAFF' },
];

const FINANCIAL_SERVICES = [
  { id: 'credit_card', label: 'Credit Card\nBill',    icon: '💳', color: '#1C1C1E', bg: '#F5F5F5' },
  { id: 'loan_emi',    label: 'Loan\nEMI',            icon: '🏦', color: '#007AFF', bg: '#EAF3FF' },
  { id: 'insurance',   label: 'Insurance\nPremium',   icon: '🛡️', color: '#34C759', bg: '#EAFFF0' },
  { id: 'invest',      label: 'Mutual Fund\nSIP',     icon: '📈', color: '#FF9500', bg: '#FFF6EA' },
];

const TRANSPORT_OTHERS = [
  { id: 'fastag',        label: 'FASTag',          icon: '🛣️',  color: '#FF9500', bg: '#FFF6EA' },
  { id: 'metro',         label: 'Metro Card',      icon: '🚇',  color: '#007AFF', bg: '#EAF3FF' },
  { id: 'rent',          label: 'Rent Pay',        icon: '🏠',  color: '#5856D6', bg: '#F0EAFF' },
  { id: 'education',     label: 'Education\nFees', icon: '🎓',  color: '#34C759', bg: '#EAFFF0' },
  { id: 'housing',       label: 'Housing\nSociety',icon: '🏘️',  color: '#FF6B35', bg: '#FFF0EA' },
  { id: 'subscription',  label: 'OTT / Streaming', icon: '🎬',  color: '#1C1C1E', bg: '#F5F5F5' },
  { id: 'healthcare',    label: 'Healthcare',      icon: '🏥',  color: '#FF3B30', bg: '#FFEAEA' },
  { id: 'donation',      label: 'Donation',        icon: '🤝',  color: '#34C759', bg: '#EAFFF0' },
];

// ─── Form Config per Category ─────────────────────────────────────────────────
const FORM_CONFIG: Record<string, { title: string; fields: any[]; providers?: string[] }> = {
  prepaid: {
    title: 'Mobile Prepaid Recharge',
    fields: [
      { key: 'mobile', label: 'Mobile Number', placeholder: 'Enter 10-digit mobile number', keyboard: 'phone-pad', maxLen: 10 },
      { key: 'amount', label: 'Amount (₹)', placeholder: 'Enter recharge amount', keyboard: 'numeric' },
    ],
    providers: ['Jio', 'Airtel', 'Vi (Vodafone Idea)', 'BSNL', 'MTNL'],
  },
  postpaid: {
    title: 'Mobile Postpaid Bill Pay',
    fields: [
      { key: 'mobile', label: 'Mobile Number', placeholder: 'Enter 10-digit postpaid number', keyboard: 'phone-pad', maxLen: 10 },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['Jio Postpaid', 'Airtel Postpaid', 'Vi Postpaid', 'BSNL Postpaid'],
  },
  dth: {
    title: 'DTH Recharge',
    fields: [
      { key: 'subscriber_id', label: 'Subscriber / Customer ID', placeholder: 'Enter your DTH subscriber ID', keyboard: 'numeric' },
      { key: 'amount', label: 'Amount (₹)', placeholder: 'Enter recharge amount', keyboard: 'numeric' },
    ],
    providers: ['Tata Play (Tata Sky)', 'Dish TV', 'D2H (Videocon)', 'Sun Direct', 'Airtel DTH'],
  },
  electricity: {
    title: 'Electricity Bill Payment',
    fields: [
      { key: 'consumer_no', label: 'Consumer / Account Number', placeholder: 'Enter consumer number', keyboard: 'numeric' },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: [
      'BSES Rajdhani', 'BSES Yamuna', 'Tata Power Mumbai', 'Adani Electricity',
      'MSEDCL', 'UPPCL', 'KSEB Kerala', 'BESCOM Karnataka', 'CESC Kolkata',
      'WBSEDCL', 'Torrent Power', 'Jaipur Discom', 'PSPCL Punjab',
    ],
  },
  water: {
    title: 'Water Bill Payment',
    fields: [
      { key: 'consumer_no', label: 'Consumer / Account Number', placeholder: 'Enter water board account number', keyboard: 'numeric' },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['Delhi Jal Board', 'MCGM Mumbai Water', 'HMWSSB Hyderabad', 'BWSSB Bangalore', 'Chennai Metro Water'],
  },
  gas_piped: {
    title: 'Piped Gas Bill Payment',
    fields: [
      { key: 'bp_no', label: 'BP Number / Customer ID', placeholder: 'Enter your BP / customer number', keyboard: 'numeric' },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['IGL (Indraprastha Gas)', 'MGL (Mahanagar Gas)', 'Adani Gas', 'GAIL Gas', 'Gujarat Gas'],
  },
  broadband: {
    title: 'Broadband / Internet Bill',
    fields: [
      { key: 'account_no', label: 'Account / Customer ID', placeholder: 'Enter your account number', keyboard: 'numeric' },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['Airtel Xstream Fiber', 'Jio Fiber', 'ACT Fibernet', 'BSNL Broadband', 'Excitel', 'Hathway'],
  },
  landline: {
    title: 'Landline Bill Payment',
    fields: [
      { key: 'phone_no', label: 'Landline Number (with STD code)', placeholder: 'e.g. 01123456789', keyboard: 'phone-pad' },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['BSNL Landline', 'MTNL Mumbai', 'MTNL Delhi', 'Airtel Landline'],
  },
  cable_tv: {
    title: 'Cable TV Bill Payment',
    fields: [
      { key: 'subscriber_id', label: 'Subscriber / Box ID', placeholder: 'Enter cable subscriber ID', keyboard: 'numeric' },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['Hathway Digital', 'Den Networks', 'Siti Networks', 'In Cable', 'NXT Digital'],
  },
  gas_cylinder: {
    title: 'LPG Cylinder Booking',
    fields: [
      { key: 'consumer_id', label: 'LPG Consumer ID', placeholder: 'Enter LPG consumer ID', keyboard: 'numeric' },
      { key: 'amount', label: 'Cylinder Cost (₹)', placeholder: 'Enter amount', keyboard: 'numeric' },
    ],
    providers: ['HP Gas', 'Bharat Gas (BPCL)', 'Indane (IOC)'],
  },
  municipal: {
    title: 'Municipal Tax / Property Tax',
    fields: [
      { key: 'property_id', label: 'Property / Assessment Number', placeholder: 'Enter property assessment number', keyboard: 'numeric' },
      { key: 'amount', label: 'Tax Amount (₹)', placeholder: 'Enter tax amount', keyboard: 'numeric' },
    ],
    providers: ['MCD Delhi', 'BBMP Bangalore', 'PMC Pune', 'MCGM Mumbai', 'KMC Kolkata'],
  },
  credit_card: {
    title: 'Credit Card Bill Payment',
    fields: [
      { key: 'card_no', label: 'Last 4 Digits of Card', placeholder: 'Enter last 4 digits', keyboard: 'numeric', maxLen: 4 },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['HDFC Bank', 'ICICI Bank', 'SBI Card', 'Axis Bank', 'Kotak Mahindra', 'IndusInd Bank', 'AmEx'],
  },
  loan_emi: {
    title: 'Loan EMI Payment',
    fields: [
      { key: 'loan_id', label: 'Loan Account Number', placeholder: 'Enter loan account number', keyboard: 'numeric' },
      { key: 'amount', label: 'EMI Amount (₹)', placeholder: 'Enter EMI amount', keyboard: 'numeric' },
    ],
    providers: ['SBI', 'HDFC Bank', 'ICICI Bank', 'Bajaj Finance', 'Axis Bank', 'L&T Finance', 'Tata Capital'],
  },
  insurance: {
    title: 'Insurance Premium Payment',
    fields: [
      { key: 'policy_no', label: 'Policy Number', placeholder: 'Enter insurance policy number', keyboard: 'default' },
      { key: 'amount', label: 'Premium Amount (₹)', placeholder: 'Enter premium amount', keyboard: 'numeric' },
    ],
    providers: ['LIC', 'SBI Life', 'HDFC Life', 'Max Life', 'ICICI Prudential', 'Star Health', 'New India Assurance'],
  },
  invest: {
    title: 'Mutual Fund SIP',
    fields: [
      { key: 'folio_no', label: 'Folio / SIP Number', placeholder: 'Enter folio number', keyboard: 'numeric' },
      { key: 'amount', label: 'SIP Amount (₹)', placeholder: 'Enter monthly SIP amount', keyboard: 'numeric' },
    ],
    providers: ['SBI MF', 'HDFC MF', 'ICICI Pru MF', 'Nippon India MF', 'Mirae Asset', 'Axis MF'],
  },
  fastag: {
    title: 'FASTag Recharge',
    fields: [
      { key: 'vehicle_no', label: 'Vehicle Registration Number', placeholder: 'e.g. DL01CA1234', keyboard: 'default', autoCapitalize: 'characters' },
      { key: 'amount', label: 'Amount (₹)', placeholder: 'Enter recharge amount', keyboard: 'numeric' },
    ],
    providers: ['NHAI FASTag', 'HDFC Bank FASTag', 'ICICI Bank FASTag', 'Paytm FASTag', 'Axis Bank FASTag'],
  },
  metro: {
    title: 'Metro Card Recharge',
    fields: [
      { key: 'card_no', label: 'Metro Card Number', placeholder: 'Enter your metro card number', keyboard: 'numeric' },
      { key: 'amount', label: 'Amount (₹)', placeholder: 'Enter recharge amount', keyboard: 'numeric' },
    ],
    providers: ['Delhi Metro (DMRC)', 'Mumbai Metro', 'Bangalore Metro (BMRC)', 'Hyderabad Metro', 'Chennai Metro', 'Kolkata Metro'],
  },
  rent: {
    title: 'Rent Pay via Bank Transfer',
    fields: [
      { key: 'landlord_name', label: "Landlord's Full Name", placeholder: 'Enter landlord name', keyboard: 'default' },
      { key: 'account_no', label: 'Bank Account Number', placeholder: 'Enter bank account number', keyboard: 'numeric' },
      { key: 'ifsc', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234', keyboard: 'default', autoCapitalize: 'characters' },
      { key: 'amount', label: 'Rent Amount (₹)', placeholder: 'Enter monthly rent', keyboard: 'numeric' },
    ],
    providers: [],
  },
  education: {
    title: 'Education Fee Payment',
    fields: [
      { key: 'application_no', label: 'Application / Student ID', placeholder: 'Enter student or application ID', keyboard: 'default' },
      { key: 'amount', label: 'Fee Amount (₹)', placeholder: 'Enter fee amount', keyboard: 'numeric' },
    ],
    providers: ['CBSE', 'ICSE / CISCE', 'University of Delhi', 'IIT / NIT Fees', 'Private School Fees'],
  },
  housing: {
    title: 'Housing Society Maintenance',
    fields: [
      { key: 'flat_no', label: 'Flat / Unit Number', placeholder: 'e.g. A-204', keyboard: 'default' },
      { key: 'amount', label: 'Maintenance Amount (₹)', placeholder: 'Enter maintenance charge', keyboard: 'numeric' },
    ],
    providers: ['MyGate', 'NoBrokerHood', 'Society maintenance portals'],
  },
  subscription: {
    title: 'OTT / Streaming Subscription',
    fields: [
      { key: 'email', label: 'Registered Email / Mobile', placeholder: 'Enter email or mobile', keyboard: 'default' },
      { key: 'amount', label: 'Plan Amount (₹)', placeholder: 'Enter subscription amount', keyboard: 'numeric' },
    ],
    providers: ['Netflix', 'Amazon Prime Video', 'Disney+ Hotstar', 'Sony LIV', 'Zee5', 'JioCinema', 'SunNXT', 'Voot Select'],
  },
  healthcare: {
    title: 'Healthcare / Hospital Bill',
    fields: [
      { key: 'patient_id', label: 'Patient ID / UHID', placeholder: 'Enter patient ID', keyboard: 'default' },
      { key: 'amount', label: 'Bill Amount (₹)', placeholder: 'Enter bill amount', keyboard: 'numeric' },
    ],
    providers: ['Apollo Hospitals', 'Fortis Healthcare', 'Max Healthcare', 'AIIMS', 'Manipal Hospital'],
  },
  donation: {
    title: 'Donation / Charity',
    fields: [
      { key: 'donor_name', label: 'Donor Full Name', placeholder: 'Enter your name', keyboard: 'default' },
      { key: 'amount', label: 'Donation Amount (₹)', placeholder: 'Enter donation amount', keyboard: 'numeric' },
    ],
    providers: ['PM CARES Fund', 'CRY India', 'Akshaya Patra', 'HelpAge India', 'Goonj', 'iDream Education'],
  },
};

// ─── Sub-Components ───────────────────────────────────────────────────────────
const QuickActionCard = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.qaWrap}>
    <LinearGradient
      colors={item.grad}
      style={styles.qaCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.qaIcon}>{item.icon}</Text>
    </LinearGradient>
    <Text style={styles.qaLabel} numberOfLines={2}>{item.label}</Text>
  </TouchableOpacity>
);

const GridItem = ({ item, onPress }: { item: any; onPress: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.gridItem}>
    <View style={[styles.gridIcon, { backgroundColor: item.bg }]}>
      <Text style={styles.gridEmoji}>{item.icon}</Text>
    </View>
    <Text style={styles.gridLabel} numberOfLines={2}>{item.label}</Text>
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────
export const RechargeScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const config = selectedCat ? FORM_CONFIG[selectedCat] : null;

  const allCategories = [...BILL_PAYMENTS, ...FINANCIAL_SERVICES, ...TRANSPORT_OTHERS];
  const filtered = searchQuery.trim()
    ? allCategories.filter(c => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  const handleSelect = (id: string) => {
    setSelectedCat(id);
    setSelectedProvider('');
    setFormValues({});
    setSearchQuery('');
  };

  const handleSubmit = () => {
    if (!config) return;
    const hasEmpty = config.fields.some(f => !formValues[f.key]?.trim());
    if (hasEmpty) {
      Toast.show({ type: 'error', text1: 'Incomplete Form', text2: 'Please fill in all required details' });
      return;
    }
    if ((selectedCat === 'prepaid' || selectedCat === 'postpaid') && (formValues.mobile?.length !== 10)) {
      Toast.show({ type: 'error', text1: 'Invalid Mobile', text2: 'Mobile number must be exactly 10 digits' });
      return;
    }
    setModalVisible(true);
  };

  const handleConfirm = async () => {
    setModalVisible(false);
    setLoading(true);
    try {
      const payload = {
        type: (selectedCat === 'prepaid' || selectedCat === 'postpaid' || selectedCat === 'dth') ? selectedCat : 'bbps',
        operatorCode: selectedProvider || selectedCat?.toUpperCase() || 'BBPS',
        accountNo: formValues.mobile || formValues.consumer_no || formValues.subscriber_id || formValues.account_no || formValues.card_no || formValues.vehicle_no || formValues.card_no || formValues.policy_no || formValues.loan_id || formValues.folio_no || formValues.flat_no || formValues.patient_id || formValues.donor_name || formValues.email || 'N/A',
        circle: 'National',
        amount: parseFloat(formValues.amount || '0'),
      };
      await rechargeService.initiateRecharge(payload);
      Alert.alert('Payment Successful 🎉', `₹${formValues.amount} payment processed successfully!`);
      setSelectedCat(null);
      setFormValues({});
      setSelectedProvider('');
    } catch (err: any) {
      Alert.alert('Payment Failed ❌', err?.response?.data?.message || 'Insufficient wallet balance or service unavailable.');
    } finally {
      setLoading(false);
    }
  };

  // ── Bill Payment Form ────────────────────────────────────────────────────────
  if (selectedCat && config) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
        <StatusBar barStyle="dark-content" />

        {/* Top header */}
        <LinearGradient colors={['#FFFFFF', '#F2F2F7']} style={styles.formTopBar}>
          <TouchableOpacity onPress={() => setSelectedCat(null)} style={styles.backCircle}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.formTopTitle}>{config.title}</Text>
          <View style={{ width: 36 }} />
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">

          {/* Provider Chips */}
          {config.providers && config.providers.length > 0 && (
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>Select Provider / Biller</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {config.providers.map(p => (
                  <TouchableOpacity
                    key={p}
                    onPress={() => setSelectedProvider(p)}
                    style={[styles.chip, selectedProvider === p && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, selectedProvider === p && styles.chipTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Dynamic Fields */}
          <View style={styles.formSection}>
            {config.fields.map(field => (
              <View key={field.key} style={styles.fieldWrap}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <TextInput
                  style={styles.fieldInput}
                  placeholder={field.placeholder}
                  placeholderTextColor="#8E8E93"
                  keyboardType={field.keyboard || 'default'}
                  maxLength={field.maxLen}
                  autoCapitalize={field.autoCapitalize || 'none'}
                  value={formValues[field.key] || ''}
                  onChangeText={t => setFormValues(prev => ({ ...prev, [field.key]: t }))}
                />
              </View>
            ))}
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={0.9}
            style={styles.payBtnWrap}
            disabled={loading}
          >
            <LinearGradient colors={['#007AFF', '#5AC8FA']} style={styles.payBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={styles.payBtnText}>
                {loading ? 'Processing…' : `Pay ₹${formValues.amount || '0'}`}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>

        <RechargeConfirmModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={handleConfirm}
          operator={selectedProvider || config.title}
          accountNo={formValues.mobile || formValues.consumer_no || formValues.subscriber_id || formValues.account_no || formValues.vehicle_no || ''}
          amount={parseFloat(formValues.amount || '0')}
        />
      </View>
    );
  }

  // ── Category Hub ─────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView stickyHeaderIndices={[0]} contentContainerStyle={{ paddingBottom: 110 }}>

        {/* Sticky Top Bar + Search */}
        <View style={styles.topBar}>
          <Text style={styles.hubTitle}>Recharge & Pay</Text>
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search for services…"
              placeholderTextColor="#8E8E93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Search Results */}
        {filtered && (
          <View style={styles.gridWrap}>
            {filtered.length === 0
              ? <Text style={styles.noResult}>No service found</Text>
              : filtered.map(item => (
                  <GridItem key={item.id} item={item} onPress={() => handleSelect(item.id)} />
                ))
            }
          </View>
        )}

        {!filtered && (
          <>
            {/* Quick Actions Row */}
            <SectionHeader title="Quick Recharge" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.qaRow}>
              {QUICK_ACTIONS.map(item => (
                <QuickActionCard key={item.id} item={item} onPress={() => handleSelect(item.id)} />
              ))}
            </ScrollView>

            {/* Bill Payments */}
            <SectionHeader title="Utility Bill Payments" />
            <View style={styles.gridWrap}>
              {BILL_PAYMENTS.map(item => (
                <GridItem key={item.id} item={item} onPress={() => handleSelect(item.id)} />
              ))}
            </View>

            {/* Financial */}
            <SectionHeader title="Financial Services" />
            <View style={styles.gridWrap}>
              {FINANCIAL_SERVICES.map(item => (
                <GridItem key={item.id} item={item} onPress={() => handleSelect(item.id)} />
              ))}
            </View>

            {/* Transport & Others */}
            <SectionHeader title="Travel, Rent & More" />
            <View style={styles.gridWrap}>
              {TRANSPORT_OTHERS.map(item => (
                <GridItem key={item.id} item={item} onPress={() => handleSelect(item.id)} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Hub
  topBar: {
    backgroundColor: '#F2F2F7',
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    zIndex: 10,
  },
  hubTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.8,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#1C1C1E' },
  noResult: { textAlign: 'center', color: '#8E8E93', marginTop: 40, fontSize: 14 },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.4,
  },

  // Quick Actions
  qaRow: { paddingLeft: 20, paddingRight: 4, marginBottom: 4 },
  qaWrap: { alignItems: 'center', marginRight: 16, width: 80 },
  qaCard: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  qaIcon: { fontSize: 26 },
  qaLabel: { fontSize: 11, fontWeight: '700', color: '#3C3C43', textAlign: 'center', lineHeight: 14 },

  // Grid
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  gridItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  gridEmoji: { fontSize: 22 },
  gridLabel: { fontSize: 11, fontWeight: '700', color: '#3C3C43', textAlign: 'center', lineHeight: 14 },

  // Form
  formTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(60,60,67,0.1)',
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: { fontSize: 16, color: '#1C1C1E', fontWeight: '600' },
  formTopTitle: { fontSize: 16, fontWeight: '800', color: '#1C1C1E', flex: 1, textAlign: 'center', letterSpacing: -0.3, marginHorizontal: 8 },
  formScroll: { padding: 20, gap: 16, paddingBottom: 80 },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Provider Chips
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: { backgroundColor: 'rgba(0, 122, 255, 0.08)', borderColor: '#007AFF' },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3C3C43' },
  chipTextActive: { color: '#007AFF', fontWeight: '700' },

  // Fields
  fieldWrap: { gap: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#8E8E93', letterSpacing: 0.3 },
  fieldInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1C1C1E',
    fontWeight: '600',
  },

  // Pay Button
  payBtnWrap: { marginTop: 8 },
  payBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  payBtnText: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.3 },
});

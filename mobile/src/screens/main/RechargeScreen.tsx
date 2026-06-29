import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Platform, ActivityIndicator,
  FlatList, Alert, KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Category =
  | 'mobile_prepaid' | 'mobile_postpaid' | 'dth'
  | 'electricity' | 'water' | 'gas' | 'broadband'
  | 'rent' | 'fasttag' | 'insurance' | 'loan' | 'credit_card';

interface Plan {
  id: string;
  amount: number;
  validity: string;
  data: string;
  calls: string;
  sms: string;
  tag?: 'POPULAR' | 'BEST VALUE' | 'OTT';
  description?: string;
  category: 'popular' | 'data' | 'talktime' | 'validity' | 'ott' | 'roaming';
}

interface BillInfo {
  consumerName: string;
  billAmount: number;
  dueDate: string;
  billPeriod: string;
  consumerNo: string;
  extraInfo?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIES: { id: Category; emoji: string; label: string; color: string }[] = [
  { id: 'mobile_prepaid',  emoji: '📱', label: 'Mobile\nPrepaid',  color: '#1D6FEB' },
  { id: 'mobile_postpaid', emoji: '📲', label: 'Postpaid\nBill',   color: '#7C3AED' },
  { id: 'dth',             emoji: '📺', label: 'DTH',              color: '#D97B00' },
  { id: 'electricity',     emoji: '⚡', label: 'Electricity',      color: '#F59E0B' },
  { id: 'water',           emoji: '💧', label: 'Water',            color: '#3B82F6' },
  { id: 'gas',             emoji: '🔥', label: 'Piped Gas',        color: '#EF4444' },
  { id: 'broadband',       emoji: '📡', label: 'Broadband',        color: '#8B5CF6' },
  { id: 'rent',            emoji: '🏠', label: 'Rent Pay',         color: '#059669' },
  { id: 'fasttag',         emoji: '🛣️', label: 'FASTag',          color: '#64748B' },
  { id: 'insurance',       emoji: '🛡️', label: 'Insurance',       color: '#EC4899' },
  { id: 'loan',            emoji: '🏦', label: 'Loan EMI',         color: '#14B8A6' },
  { id: 'credit_card',     emoji: '💳', label: 'Credit Card',      color: '#F97316' },
];

const OPERATORS_MOBILE = ['Jio', 'Airtel', 'Vi', 'BSNL'];
const OPERATORS_DTH = ['Tata Play', 'Dish TV', 'Airtel DTH', 'Sun Direct', 'D2H', 'Videocon D2H'];
const FASTTAG_BANKS = ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'Paytm Payments Bank', 'IDFC FIRST', 'Kotak Mahindra'];

const CIRCLES = [
  'Delhi', 'Mumbai', 'Maharashtra', 'Karnataka', 'Tamil Nadu',
  'Andhra Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'Uttar Pradesh (East)',
  'Uttar Pradesh (West)', 'Punjab', 'Haryana', 'West Bengal', 'Kerala',
  'Madhya Pradesh', 'Odisha', 'Bihar', 'Jharkhand', 'Assam',
];

const ELECTRICITY_BILLERS: { name: string; state: string }[] = [
  { name: 'BSES Rajdhani Power', state: 'Delhi' },
  { name: 'BSES Yamuna Power', state: 'Delhi' },
  { name: 'Tata Power Delhi', state: 'Delhi' },
  { name: 'MSEDCL', state: 'Maharashtra' },
  { name: 'BESCOM', state: 'Karnataka' },
  { name: 'TNEB', state: 'Tamil Nadu' },
  { name: 'APSPDCL', state: 'Andhra Pradesh' },
  { name: 'TSSPDCL', state: 'Telangana' },
  { name: 'DGVCL', state: 'Gujarat' },
  { name: 'JVVNL', state: 'Rajasthan' },
  { name: 'UPPCL', state: 'Uttar Pradesh' },
  { name: 'PSPCL', state: 'Punjab' },
  { name: 'DHBVN', state: 'Haryana' },
  { name: 'CESC', state: 'West Bengal' },
  { name: 'KSEB', state: 'Kerala' },
];

const GAS_PROVIDERS = ['Mahanagar Gas (MGL)', 'Indraprastha Gas (IGL)', 'Gujarat Gas', 'Adani Gas', 'Torrent Gas', 'Sabarmati Gas'];
const WATER_BOARDS = ['Delhi Jal Board', 'BWSSB (Bengaluru)', 'MCGM (Mumbai)', 'Chennai Metro Water', 'Hyderabad Metro Water'];
const ISP_PROVIDERS = ['Jio Fiber', 'Airtel Xstream', 'BSNL Broadband', 'ACT Fibernet', 'Hathway', 'Den Networks', 'You Broadband'];

// ─────────────────────────────────────────────────────────────────────────────
// Operator Detection from Mobile Number Prefix
// ─────────────────────────────────────────────────────────────────────────────

const detectOperator = (num: string): string => {
  if (num.length < 4) return '';
  const p2 = num.slice(0, 2);
  const p4 = num.slice(0, 4);
  const jio2    = ['60','61','62','63','64','65','66','68','69','70','73','74','79'];
  const airtel2 = ['72','78','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','98','99'];
  const vi2     = ['75','76','77','96','97'];
  const bsnl2   = ['71','94'];
  if (jio2.includes(p2))    return 'Jio';
  if (airtel2.includes(p2)) return 'Airtel';
  if (vi2.includes(p2))     return 'Vi';
  if (bsnl2.includes(p2))   return 'BSNL';
  return 'Jio'; // default
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Plan Data
// ─────────────────────────────────────────────────────────────────────────────

const PLANS_BY_OPERATOR: Record<string, Plan[]> = {
  Jio: [
    { id: 'j1', amount: 149,  validity: '24 days',  data: '1GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'j2', amount: 199,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'j3', amount: 299,  validity: '28 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'popular' },
    { id: 'j4', amount: 479,  validity: '56 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',                     category: 'validity' },
    { id: 'j5', amount: 533,  validity: '84 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',                     category: 'validity' },
    { id: 'j6', amount: 666,  validity: '84 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'validity' },
    { id: 'j7', amount: 999,  validity: '84 days',  data: '3GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'OTT',        category: 'ott', description: 'Disney+ Hotstar included' },
    { id: 'j8', amount: 2999, validity: '365 days', data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'validity' },
    { id: 'j9', amount: 19,   validity: '1 day',    data: '1GB',        calls: 'Unlimited', sms: '100',                         category: 'talktime' },
    { id: 'j10',amount: 75,   validity: 'No Limit', data: 'No Data',   calls: '₹75 Balance',sms: '—',                           category: 'talktime' },
    { id: 'j11',amount: 601,  validity: '84 days',  data: '10GB Total',calls: 'Unlimited', sms: '100/day',                     category: 'data' },
    { id: 'j12',amount: 151,  validity: '30 days',  data: '12GB Total',calls: 'Unlimited', sms: '100/day',                     category: 'data' },
  ],
  Airtel: [
    { id: 'a1', amount: 179,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'a2', amount: 239,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'a3', amount: 299,  validity: '28 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'popular' },
    { id: 'a4', amount: 359,  validity: '28 days',  data: '2.5GB/day', calls: 'Unlimited', sms: '100/day',  tag: 'OTT',        category: 'ott', description: 'Disney+ Hotstar + Amazon Prime' },
    { id: 'a5', amount: 509,  validity: '56 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',                     category: 'validity' },
    { id: 'a6', amount: 699,  validity: '84 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'validity' },
    { id: 'a7', amount: 3599, validity: '365 days', data: '2.5GB/day', calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'validity' },
    { id: 'a8', amount: 49,   validity: '28 days',  data: 'No Data',   calls: '₹49 Balance',sms: '—',                           category: 'talktime' },
  ],
  Vi: [
    { id: 'v1', amount: 179,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'v2', amount: 269,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'v3', amount: 299,  validity: '28 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'popular' },
    { id: 'v4', amount: 479,  validity: '56 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day',                     category: 'validity' },
    { id: 'v5', amount: 601,  validity: '84 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'validity' },
    { id: 'v6', amount: 1799, validity: '365 days', data: '2GB/day',   calls: 'Unlimited', sms: '100/day',                     category: 'validity' },
  ],
  BSNL: [
    { id: 'b1', amount: 107,  validity: '30 days',  data: '1GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'b2', amount: 187,  validity: '30 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'POPULAR',    category: 'popular' },
    { id: 'b3', amount: 247,  validity: '30 days',  data: '3GB/day',   calls: 'Unlimited', sms: '100/day',                     category: 'data' },
    { id: 'b4', amount: 397,  validity: '60 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day',                     category: 'validity' },
    { id: 'b5', amount: 1999, validity: '365 days', data: '2GB/day',   calls: 'Unlimited', sms: '100/day',  tag: 'BEST VALUE', category: 'validity' },
  ],
};

const PLAN_TABS = [
  { key: 'popular',   label: 'Popular' },
  { key: 'data',      label: 'Data' },
  { key: 'validity',  label: 'Validity' },
  { key: 'talktime',  label: 'Talktime' },
  { key: 'ott',       label: 'OTT' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper components
// ─────────────────────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <View style={s.sectionHeader}>
    <Text style={s.sectionTitle}>{title}</Text>
    {subtitle ? <Text style={s.sectionSubtitle}>{subtitle}</Text> : null}
  </View>
);

const OperatorChip: React.FC<{
  name: string; selected: boolean; onPress: () => void; color?: string;
}> = ({ name, selected, onPress, color = '#1D6FEB' }) => (
  <TouchableOpacity
    style={[s.chip, selected && { backgroundColor: color, borderColor: color }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[s.chipText, selected && s.chipTextSelected]}>{name}</Text>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// Plan Card
// ─────────────────────────────────────────────────────────────────────────────

const PlanCard: React.FC<{
  plan: Plan;
  operatorColor: string;
  onPress: () => void;
}> = ({ plan, operatorColor, onPress }) => (
  <TouchableOpacity style={s.planCard} onPress={onPress} activeOpacity={0.75}>
    {plan.tag && (
      <View style={[s.planTag, { backgroundColor: plan.tag === 'POPULAR' ? operatorColor : plan.tag === 'OTT' ? '#7C3AED' : '#059669' }]}>
        <Text style={s.planTagText}>{plan.tag}</Text>
      </View>
    )}
    <View style={s.planRow}>
      {/* Amount */}
      <View style={s.planAmtWrap}>
        <Text style={[s.planAmt, { color: operatorColor }]}>₹{plan.amount}</Text>
        <Text style={s.planValidity}>{plan.validity}</Text>
      </View>
      {/* Details */}
      <View style={s.planDetails}>
        <View style={s.planDetail}>
          <Text style={s.planDetailIcon}>📶</Text>
          <Text style={s.planDetailText}>{plan.data}</Text>
        </View>
        <View style={s.planDetail}>
          <Text style={s.planDetailIcon}>📞</Text>
          <Text style={s.planDetailText}>{plan.calls}</Text>
        </View>
        <View style={s.planDetail}>
          <Text style={s.planDetailIcon}>💬</Text>
          <Text style={s.planDetailText}>{plan.sms}</Text>
        </View>
        {plan.description ? (
          <View style={s.planDetail}>
            <Text style={s.planDetailIcon}>🎬</Text>
            <Text style={[s.planDetailText, { color: '#7C3AED' }]}>{plan.description}</Text>
          </View>
        ) : null}
      </View>
      {/* CTA */}
      <TouchableOpacity
        style={[s.planRechargeBtn, { backgroundColor: operatorColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={s.planRechargeBtnText}>Pay</Text>
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

// ─────────────────────────────────────────────────────────────────────────────
// Bill Fetched Card
// ─────────────────────────────────────────────────────────────────────────────

const BillCard: React.FC<{ bill: BillInfo; color: string; onPay: () => void }> = ({ bill, color, onPay }) => (
  <View style={s.billCard}>
    <LinearGradient colors={[color, color + 'CC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.billCardGrad}>
      <View style={[s.deco, { width: 160, height: 160, top: -50, right: -40 }]} />
      <View style={[s.deco, { width: 90, height: 90, bottom: -20, left: -20 }]} />
      <Text style={s.billCardLabel}>Bill Fetched Successfully</Text>
      <Text style={s.billCardName}>{bill.consumerName}</Text>
      <Text style={s.billCardConsumer}>{bill.consumerNo}</Text>
      <View style={s.billCardRow}>
        <View>
          <Text style={s.billCardFieldLabel}>Amount Due</Text>
          <Text style={s.billCardAmt}>₹{bill.billAmount.toFixed(2)}</Text>
        </View>
        <View style={s.billCardDivider} />
        <View>
          <Text style={s.billCardFieldLabel}>Due Date</Text>
          <Text style={s.billCardDueDate}>{bill.dueDate}</Text>
        </View>
        <View style={s.billCardDivider} />
        <View>
          <Text style={s.billCardFieldLabel}>Period</Text>
          <Text style={s.billCardPeriod}>{bill.billPeriod}</Text>
        </View>
      </View>
    </LinearGradient>
    {bill.extraInfo ? (
      <View style={s.billExtraInfo}>
        <Text style={s.billExtraText}>ℹ  {bill.extraInfo}</Text>
      </View>
    ) : null}
    <TouchableOpacity style={[s.payNowBtn, { backgroundColor: color }]} onPress={onPay} activeOpacity={0.85}>
      <Text style={s.payNowText}>Pay ₹{bill.billAmount.toFixed(2)} Now</Text>
    </TouchableOpacity>
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────────────────────────

export const RechargeScreen: React.FC = () => {
  const [category, setCategory] = useState<Category>('mobile_prepaid');

  // Mobile state
  const [mobileNum, setMobileNum]         = useState('');
  const [detectedOp, setDetectedOp]       = useState('');
  const [selectedOp, setSelectedOp]       = useState('');
  const [selectedCircle, setSelectedCircle] = useState('Delhi');
  const [planTab, setPlanTab]             = useState('popular');
  const [loadingPlans, setLoadingPlans]   = useState(false);
  const [plans, setPlans]                 = useState<Plan[]>([]);
  const [customAmount, setCustomAmount]   = useState('');

  // Bill payment state
  const [billProvider, setBillProvider]   = useState('');
  const [accountNo, setAccountNo]         = useState('');
  const [loadingBill, setLoadingBill]     = useState(false);
  const [fetchedBill, setFetchedBill]     = useState<BillInfo | null>(null);

  // DTH state
  const [dthOperator, setDthOperator]     = useState('');
  const [subscriberId, setSubscriberId]   = useState('');
  const [dthPlans, setDthPlans]           = useState<Plan[]>([]);
  const [loadingDth, setLoadingDth]       = useState(false);

  // Rent state
  const [rentAmount, setRentAmount]       = useState('');
  const [landlordUpi, setLandlordUpi]     = useState('');
  const [landlordName, setLandlordName]   = useState('');

  // FASTag state
  const [fastagBank, setFastagBank]       = useState('');
  const [vehicleNo, setVehicleNo]         = useState('');
  const [fastagAmt, setFastagAmt]         = useState('');

  const cat = CATEGORIES.find((c) => c.id === category) ?? CATEGORIES[0];

  // ── Mobile number change → auto detect operator ──────────────────────────
  useEffect(() => {
    if (mobileNum.length >= 4) {
      const op = detectOperator(mobileNum);
      setDetectedOp(op);
      setSelectedOp(op);
    } else {
      setDetectedOp('');
      setSelectedOp('');
    }
    // Clear plans when number changes
    if (mobileNum.length < 10) setPlans([]);
  }, [mobileNum]);

  // Auto-fetch plans when number is complete
  useEffect(() => {
    if (mobileNum.length === 10 && selectedOp && category === 'mobile_prepaid') {
      fetchPlans();
    }
  }, [mobileNum, selectedOp]);

  // ── Fetch plans ───────────────────────────────────────────────────────────
  const fetchPlans = useCallback(() => {
    if (!selectedOp) return;
    setLoadingPlans(true);
    setTimeout(() => {
      const data = PLANS_BY_OPERATOR[selectedOp] ?? [];
      setPlans(data);
      setLoadingPlans(false);
    }, 900);
  }, [selectedOp]);

  // ── Fetch bill ────────────────────────────────────────────────────────────
  const fetchBill = useCallback(() => {
    if (!accountNo.trim()) {
      Toast.show({ type: 'error', text1: 'Enter account/consumer number' });
      return;
    }
    if (!billProvider && category !== 'rent') {
      Toast.show({ type: 'error', text1: 'Select a service provider' });
      return;
    }
    setLoadingBill(true);
    setFetchedBill(null);
    setTimeout(() => {
      // Mock bill data
      const mockBills: Record<Category, BillInfo> = {
        mobile_postpaid: {
          consumerName: 'Rahul Sharma',
          billAmount: 649,
          dueDate: '10 Jul 2026',
          billPeriod: 'Jun 2026',
          consumerNo: mobileNum || accountNo,
          extraInfo: 'Autopay not active. Enable to avoid late fees.',
        },
        electricity: {
          consumerName: 'Rahul Sharma',
          billAmount: 1240,
          dueDate: '5 Jul 2026',
          billPeriod: 'Apr–May 2026',
          consumerNo: accountNo,
          extraInfo: 'Units consumed: 210 kWh',
        },
        water: {
          consumerName: 'Sharma Residence',
          billAmount: 480,
          dueDate: '15 Jul 2026',
          billPeriod: 'Q1 2026',
          consumerNo: accountNo,
        },
        gas: {
          consumerName: 'Rahul Sharma',
          billAmount: 920,
          dueDate: '20 Jul 2026',
          billPeriod: 'Jun 2026',
          consumerNo: accountNo,
          extraInfo: 'Current gas rate: ₹52.50/SCM',
        },
        broadband: {
          consumerName: 'Rahul Sharma',
          billAmount: 999,
          dueDate: '1 Jul 2026',
          billPeriod: 'Jul 2026',
          consumerNo: accountNo,
          extraInfo: 'Plan: 300 Mbps Unlimited',
        },
        insurance: {
          consumerName: 'Rahul Sharma',
          billAmount: 4820,
          dueDate: '15 Jul 2026',
          billPeriod: 'Annual Premium',
          consumerNo: accountNo,
          extraInfo: 'Policy: Term Life Insurance',
        },
        loan: {
          consumerName: 'Rahul Sharma',
          billAmount: 12500,
          dueDate: '5 Jul 2026',
          billPeriod: 'Jul 2026 EMI',
          consumerNo: accountNo,
          extraInfo: 'Outstanding balance: ₹3,42,800',
        },
        credit_card: {
          consumerName: 'RAHUL SHARMA',
          billAmount: 8750,
          dueDate: '18 Jul 2026',
          billPeriod: 'Jun 2026 Statement',
          consumerNo: accountNo,
          extraInfo: 'Minimum due: ₹875. Pay full to avoid interest.',
        },
        mobile_prepaid: { consumerName: '', billAmount: 0, dueDate: '', billPeriod: '', consumerNo: '' },
        dth:            { consumerName: '', billAmount: 0, dueDate: '', billPeriod: '', consumerNo: '' },
        rent:           { consumerName: '', billAmount: 0, dueDate: '', billPeriod: '', consumerNo: '' },
        fasttag:        { consumerName: '', billAmount: 0, dueDate: '', billPeriod: '', consumerNo: '' },
      };
      setFetchedBill(mockBills[category] ?? null);
      setLoadingBill(false);
    }, 1100);
  }, [accountNo, billProvider, category, mobileNum]);

  // ── Fetch DTH plans ───────────────────────────────────────────────────────
  const fetchDthPlans = useCallback(() => {
    if (!subscriberId.trim() || !dthOperator) {
      Toast.show({ type: 'error', text1: 'Enter subscriber ID and select operator' });
      return;
    }
    setLoadingDth(true);
    setTimeout(() => {
      setDthPlans([
        { id: 'd1', amount: 149, validity: '1 Month',  data: 'Basic Pack',   calls: '130 SD Channels', sms: '', tag: 'POPULAR', category: 'popular' },
        { id: 'd2', amount: 299, validity: '1 Month',  data: 'Platinum HD',  calls: '250 HD Channels', sms: '', tag: 'BEST VALUE', category: 'popular' },
        { id: 'd3', amount: 499, validity: '1 Month',  data: 'Sports Pack',  calls: '300 Channels + Sports', sms: '', tag: 'OTT', category: 'ott', description: 'Disney+ Hotstar included' },
        { id: 'd4', amount: 799, validity: '2 Months', data: 'Premium Pack', calls: 'All Channels',    sms: '', tag: 'BEST VALUE', category: 'validity' },
      ]);
      setLoadingDth(false);
    }, 1000);
  }, [subscriberId, dthOperator]);

  // ── Handle pay ────────────────────────────────────────────────────────────
  const handlePay = (amount: number, description: string) => {
    Alert.alert(
      'Confirm Payment',
      `Pay ₹${amount.toFixed(2)} for ${description}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Pay ₹${amount.toFixed(2)}`,
          style: 'default',
          onPress: () => {
            Toast.show({ type: 'success', text1: '✅ Recharge Initiated!', text2: `₹${amount} payment processing…` });
            // Reset
            setFetchedBill(null);
            setAccountNo('');
          },
        },
      ],
    );
  };

  // ── Reset on category change ──────────────────────────────────────────────
  const switchCategory = (cat: Category) => {
    setCategory(cat);
    setMobileNum('');
    setDetectedOp('');
    setSelectedOp('');
    setPlans([]);
    setAccountNo('');
    setBillProvider('');
    setFetchedBill(null);
    setDthOperator('');
    setSubscriberId('');
    setDthPlans([]);
    setCustomAmount('');
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Filtered plans
  // ─────────────────────────────────────────────────────────────────────────
  const filteredPlans = plans.filter((p) => p.category === planTab);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      {/* ══ HEADER ══ */}
      <LinearGradient
        colors={[cat.color + 'F2', cat.color + 'CC', cat.color + '99']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        <Text style={s.headerTitle}>Recharge & Pay</Text>
        <Text style={s.headerSub}>Bills · Recharge · Utilities</Text>
      </LinearGradient>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ══ CATEGORY GRID ══ */}
        <View style={s.categoryGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                style={[s.categoryItem, active && { backgroundColor: c.color + '18', borderColor: c.color }]}
                onPress={() => switchCategory(c.id)}
                activeOpacity={0.7}
              >
                <Text style={s.categoryEmoji}>{c.emoji}</Text>
                <Text style={[s.categoryLabel, active && { color: c.color, fontWeight: '700' }]}>
                  {c.label}
                </Text>
                {active && <View style={[s.categoryActiveDot, { backgroundColor: c.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ══ MOBILE PREPAID ══ */}
        {category === 'mobile_prepaid' && (
          <View style={s.section}>
            <SectionHeader title="Mobile Prepaid" subtitle="Auto-detects operator & fetches plans" />

            {/* Number input */}
            <View style={s.phoneInputWrap}>
              <View style={s.phonePrefix}><Text style={s.phonePrefixText}>+91</Text></View>
              <TextInput
                style={s.phoneInput}
                value={mobileNum}
                onChangeText={(t) => setMobileNum(t.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                placeholderTextColor="#AEAEB2"
                keyboardType="phone-pad"
                maxLength={10}
              />
              {mobileNum.length === 10 && (
                <View style={s.phoneTick}><Text>✓</Text></View>
              )}
            </View>

            {/* Auto-detected operator */}
            {detectedOp !== '' && (
              <View style={s.detectedRow}>
                <Text style={s.detectedLabel}>Detected Operator:</Text>
                <View style={[s.detectedBadge, { backgroundColor: cat.color + '18' }]}>
                  <Text style={[s.detectedBadgeText, { color: cat.color }]}>{detectedOp}</Text>
                </View>
                <Text style={s.detectedChangeHint}>  ·  Change below</Text>
              </View>
            )}

            {/* Operator override chips */}
            {mobileNum.length >= 4 && (
              <>
                <Text style={s.fieldLabel}>Operator</Text>
                <View style={s.chipRow}>
                  {OPERATORS_MOBILE.map((op) => (
                    <OperatorChip
                      key={op}
                      name={op}
                      selected={selectedOp === op}
                      onPress={() => { setSelectedOp(op); setPlans([]); }}
                      color={cat.color}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Circle picker */}
            {mobileNum.length >= 4 && (
              <>
                <Text style={s.fieldLabel}>Circle</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.circleScroll}>
                  {CIRCLES.map((c) => (
                    <OperatorChip
                      key={c}
                      name={c}
                      selected={selectedCircle === c}
                      onPress={() => setSelectedCircle(c)}
                      color={cat.color}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {/* Loading plans */}
            {loadingPlans && (
              <View style={s.loadingWrap}>
                <ActivityIndicator color={cat.color} size="small" />
                <Text style={[s.loadingText, { color: cat.color }]}>Fetching latest plans…</Text>
              </View>
            )}

            {/* Plans */}
            {plans.length > 0 && !loadingPlans && (
              <>
                {/* Plan tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.planTabsScroll}>
                  {PLAN_TABS.map((t) => (
                    <TouchableOpacity
                      key={t.key}
                      style={[s.planTab, planTab === t.key && { backgroundColor: cat.color, borderColor: cat.color }]}
                      onPress={() => setPlanTab(t.key)}
                      activeOpacity={0.7}
                    >
                      <Text style={[s.planTabText, planTab === t.key && s.planTabTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {filteredPlans.length === 0 ? (
                  <Text style={s.noPlansText}>No plans in this category</Text>
                ) : (
                  filteredPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      operatorColor={cat.color}
                      onPress={() => handlePay(plan.amount, `${selectedOp} ${plan.validity} Prepaid`)}
                    />
                  ))
                )}

                {/* Custom recharge */}
                <View style={s.customRechargeWrap}>
                  <Text style={s.fieldLabel}>Or enter custom amount</Text>
                  <View style={s.customRow}>
                    <View style={s.customInputWrap}>
                      <Text style={s.customRupee}>₹</Text>
                      <TextInput
                        style={s.customInput}
                        value={customAmount}
                        onChangeText={setCustomAmount}
                        placeholder="Enter amount"
                        placeholderTextColor="#AEAEB2"
                        keyboardType="number-pad"
                      />
                    </View>
                    <TouchableOpacity
                      style={[s.customPayBtn, { backgroundColor: cat.color }]}
                      onPress={() => {
                        const amt = parseFloat(customAmount);
                        if (!amt || amt < 10) { Toast.show({ type: 'error', text1: 'Minimum recharge is ₹10' }); return; }
                        handlePay(amt, `${selectedOp} Custom Recharge`);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={s.customPayBtnText}>Recharge</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {/* ══ MOBILE POSTPAID ══ */}
        {category === 'mobile_postpaid' && (
          <View style={s.section}>
            <SectionHeader title="Postpaid Bill" subtitle="Enter your number to fetch outstanding bill" />
            <View style={s.phoneInputWrap}>
              <View style={s.phonePrefix}><Text style={s.phonePrefixText}>+91</Text></View>
              <TextInput
                style={s.phoneInput}
                value={accountNo}
                onChangeText={(t) => { setAccountNo(t.replace(/\D/g, '').slice(0, 10)); setFetchedBill(null); }}
                placeholder="10-digit postpaid number"
                placeholderTextColor="#AEAEB2"
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>
            <Text style={s.fieldLabel}>Operator</Text>
            <View style={s.chipRow}>
              {OPERATORS_MOBILE.map((op) => (
                <OperatorChip key={op} name={op} selected={billProvider === op} onPress={() => { setBillProvider(op); setFetchedBill(null); }} color="#7C3AED" />
              ))}
            </View>
            {!fetchedBill && (
              <TouchableOpacity
                style={[s.fetchBtn, { backgroundColor: '#7C3AED', opacity: accountNo.length === 10 && billProvider ? 1 : 0.45 }]}
                onPress={fetchBill}
                disabled={accountNo.length < 10 || !billProvider || loadingBill}
                activeOpacity={0.85}
              >
                {loadingBill
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.fetchBtnText}>Fetch Bill</Text>
                }
              </TouchableOpacity>
            )}
            {fetchedBill && (
              <BillCard bill={fetchedBill} color="#7C3AED" onPay={() => handlePay(fetchedBill.billAmount, `${billProvider} Postpaid`)} />
            )}
          </View>
        )}

        {/* ══ DTH ══ */}
        {category === 'dth' && (
          <View style={s.section}>
            <SectionHeader title="DTH Recharge" subtitle="Enter your subscriber ID to see recharge packs" />
            <Text style={s.fieldLabel}>Select DTH Operator</Text>
            <View style={s.chipRow}>
              {OPERATORS_DTH.map((op) => (
                <OperatorChip key={op} name={op} selected={dthOperator === op} onPress={() => { setDthOperator(op); setDthPlans([]); }} color="#D97B00" />
              ))}
            </View>
            <Text style={s.fieldLabel}>Subscriber / Customer ID</Text>
            <TextInput
              style={s.inputField}
              value={subscriberId}
              onChangeText={(t) => { setSubscriberId(t); setDthPlans([]); }}
              placeholder="Enter your DTH subscriber ID"
              placeholderTextColor="#AEAEB2"
              keyboardType="number-pad"
            />
            {dthPlans.length === 0 && (
              <TouchableOpacity
                style={[s.fetchBtn, { backgroundColor: '#D97B00', opacity: subscriberId.length >= 6 && dthOperator ? 1 : 0.45 }]}
                onPress={fetchDthPlans}
                disabled={subscriberId.length < 6 || !dthOperator || loadingDth}
                activeOpacity={0.85}
              >
                {loadingDth
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.fetchBtnText}>Show Recharge Packs</Text>
                }
              </TouchableOpacity>
            )}
            {dthPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                operatorColor="#D97B00"
                onPress={() => handlePay(plan.amount, `${dthOperator} DTH Recharge`)}
              />
            ))}
          </View>
        )}

        {/* ══ ELECTRICITY / WATER / GAS / BROADBAND / INSURANCE / LOAN / CREDIT CARD ══ */}
        {(['electricity', 'water', 'gas', 'broadband', 'insurance', 'loan', 'credit_card'] as Category[]).includes(category) && (
          <View style={s.section}>
            <SectionHeader
              title={cat.label.replace('\n', ' ')}
              subtitle="Select provider, enter account number to fetch bill"
            />

            {/* Provider chips */}
            <Text style={s.fieldLabel}>
              {category === 'electricity' ? 'Select Electricity Board' :
               category === 'water' ? 'Select Water Board' :
               category === 'gas' ? 'Select Gas Provider' :
               category === 'broadband' ? 'Select ISP' :
               category === 'insurance' ? 'Select Insurance Company' :
               category === 'loan' ? 'Select Lender' :
               'Select Bank / Card Issuer'}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.providerScroll}>
              {(category === 'electricity' ? ELECTRICITY_BILLERS.map((b) => b.name) :
                category === 'water' ? WATER_BOARDS :
                category === 'gas' ? GAS_PROVIDERS :
                category === 'broadband' ? ISP_PROVIDERS :
                category === 'insurance' ? ['LIC', 'HDFC Life', 'ICICI Prudential', 'SBI Life', 'Max Life', 'Bajaj Allianz'] :
                category === 'loan' ? ['HDFC Bank', 'SBI', 'ICICI Bank', 'Axis Bank', 'Bajaj Finance', 'Home Credit', 'L&T Finance'] :
                ['HDFC Credit Card', 'ICICI Credit Card', 'SBI Card', 'Axis Credit Card', 'Kotak Credit Card', 'American Express']
              ).map((p) => (
                <OperatorChip
                  key={p}
                  name={p}
                  selected={billProvider === p}
                  onPress={() => { setBillProvider(p); setFetchedBill(null); }}
                  color={cat.color}
                />
              ))}
            </ScrollView>

            {/* Account / Consumer number */}
            <Text style={s.fieldLabel}>
              {category === 'electricity' ? 'Consumer / Account Number' :
               category === 'water' ? 'Consumer / Account Number' :
               category === 'gas' ? 'BP (Business Partner) Number' :
               category === 'broadband' ? 'Account / Customer ID' :
               category === 'insurance' ? 'Policy Number' :
               category === 'loan' ? 'Loan Account Number' :
               'Credit Card Number (last 4 digits or full)'}
            </Text>
            <TextInput
              style={s.inputField}
              value={accountNo}
              onChangeText={(t) => { setAccountNo(t.trim()); setFetchedBill(null); }}
              placeholder={
                category === 'electricity' ? 'e.g. 1004859302' :
                category === 'water' ? 'e.g. DJB-9485903' :
                category === 'gas' ? 'e.g. 700012345' :
                'Enter your account number'
              }
              placeholderTextColor="#AEAEB2"
              keyboardType={['insurance', 'broadband'].includes(category) ? 'default' : 'number-pad'}
            />

            {!fetchedBill && (
              <TouchableOpacity
                style={[s.fetchBtn, { backgroundColor: cat.color, opacity: accountNo.length >= 4 && billProvider ? 1 : 0.45 }]}
                onPress={fetchBill}
                disabled={accountNo.length < 4 || !billProvider || loadingBill}
                activeOpacity={0.85}
              >
                {loadingBill
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.fetchBtnText}>Fetch Bill Details</Text>
                }
              </TouchableOpacity>
            )}

            {fetchedBill && (
              <BillCard
                bill={fetchedBill}
                color={cat.color}
                onPay={() => handlePay(fetchedBill.billAmount, `${billProvider}`)}
              />
            )}
          </View>
        )}

        {/* ══ RENT ══ */}
        {category === 'rent' && (
          <View style={s.section}>
            <SectionHeader title="Rent Payment" subtitle="Pay rent directly to your landlord via UPI" />
            <Text style={s.fieldLabel}>Landlord / Owner Name</Text>
            <TextInput style={s.inputField} value={landlordName} onChangeText={setLandlordName} placeholder="e.g. Ramesh Gupta" placeholderTextColor="#AEAEB2" />
            <Text style={s.fieldLabel}>Landlord UPI ID</Text>
            <TextInput style={s.inputField} value={landlordUpi} onChangeText={setLandlordUpi} placeholder="e.g. landlord@upi" placeholderTextColor="#AEAEB2" autoCapitalize="none" keyboardType="email-address" />
            <Text style={s.fieldLabel}>Rent Amount</Text>
            <View style={s.customRow}>
              <View style={[s.customInputWrap, { flex: 1 }]}>
                <Text style={s.customRupee}>₹</Text>
                <TextInput style={s.customInput} value={rentAmount} onChangeText={setRentAmount} placeholder="Monthly rent amount" placeholderTextColor="#AEAEB2" keyboardType="number-pad" />
              </View>
            </View>
            <TouchableOpacity
              style={[s.fetchBtn, { backgroundColor: '#059669', opacity: rentAmount && landlordUpi && landlordName ? 1 : 0.45 }]}
              onPress={() => {
                const amt = parseFloat(rentAmount);
                if (!amt) { Toast.show({ type: 'error', text1: 'Enter rent amount' }); return; }
                handlePay(amt, `Rent to ${landlordName}`);
              }}
              activeOpacity={0.85}
            >
              <Text style={s.fetchBtnText}>Pay Rent ₹{rentAmount || '0'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ══ FASTTAG ══ */}
        {category === 'fasttag' && (
          <View style={s.section}>
            <SectionHeader title="FASTag Recharge" subtitle="Select your FASTag bank and enter vehicle number" />
            <Text style={s.fieldLabel}>FASTag Issuer Bank</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.providerScroll}>
              {FASTTAG_BANKS.map((b) => (
                <OperatorChip key={b} name={b} selected={fastagBank === b} onPress={() => setFastagBank(b)} color="#64748B" />
              ))}
            </ScrollView>
            <Text style={s.fieldLabel}>Vehicle Registration Number</Text>
            <TextInput
              style={s.inputField}
              value={vehicleNo}
              onChangeText={(t) => setVehicleNo(t.toUpperCase())}
              placeholder="e.g. DL5CAB1234"
              placeholderTextColor="#AEAEB2"
              autoCapitalize="characters"
            />
            <Text style={s.fieldLabel}>Recharge Amount</Text>
            <View style={s.customRow}>
              <View style={[s.customInputWrap, { flex: 1 }]}>
                <Text style={s.customRupee}>₹</Text>
                <TextInput style={s.customInput} value={fastagAmt} onChangeText={setFastagAmt} placeholder="Min ₹100" placeholderTextColor="#AEAEB2" keyboardType="number-pad" />
              </View>
            </View>
            {/* Quick amount chips */}
            <View style={s.chipRow}>
              {[100, 200, 500, 1000].map((a) => (
                <OperatorChip key={a} name={`₹${a}`} selected={fastagAmt === String(a)} onPress={() => setFastagAmt(String(a))} color="#64748B" />
              ))}
            </View>
            <TouchableOpacity
              style={[s.fetchBtn, { backgroundColor: '#64748B', opacity: fastagAmt && vehicleNo && fastagBank ? 1 : 0.45 }]}
              onPress={() => {
                const amt = parseFloat(fastagAmt);
                if (!amt || amt < 100) { Toast.show({ type: 'error', text1: 'Minimum FASTag recharge is ₹100' }); return; }
                handlePay(amt, `FASTag ${vehicleNo}`);
              }}
              activeOpacity={0.85}
            >
              <Text style={s.fetchBtnText}>Recharge FASTag</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: '#F2F2F7' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 42,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.6 },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 3 },

  // Category grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 8,
  },
  categoryItem: {
    width: '22%',
    aspectRatio: 0.9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  categoryEmoji: { fontSize: 24, marginBottom: 4 },
  categoryLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#6E6E73',
    textAlign: 'center',
    lineHeight: 13,
  },
  categoryActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeader: { marginBottom: 16 },
  sectionTitle:  { fontSize: 18, fontWeight: '800', color: '#1C1C1E', letterSpacing: -0.4 },
  sectionSubtitle: { fontSize: 12, color: '#8E8E93', marginTop: 3 },

  // Phone input
  phoneInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(60,60,67,0.12)',
    borderRadius: 14,
    backgroundColor: '#F8F8FA',
    marginBottom: 14,
    overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 14,
    paddingVertical: 15,
    backgroundColor: '#EFEFEF',
    borderRightWidth: 1,
    borderRightColor: 'rgba(60,60,67,0.1)',
  },
  phonePrefixText: { fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 15,
    letterSpacing: 1,
  },
  phoneTick: { paddingRight: 14 },

  // Detected operator
  detectedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 },
  detectedLabel: { fontSize: 13, color: '#6E6E73', fontWeight: '500' },
  detectedBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  detectedBadgeText: { fontSize: 12, fontWeight: '700' },
  detectedChangeHint: { fontSize: 11, color: '#AEAEB2' },

  // Field label
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E6E73',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 8,
  },

  // Chips
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(60,60,67,0.15)',
    backgroundColor: '#F8F8FA',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: '#3C3C43' },
  chipTextSelected: { color: '#FFFFFF', fontWeight: '700' },

  // Circle scroll
  circleScroll: { marginBottom: 8 },

  // Provider scroll
  providerScroll: { marginBottom: 8 },

  // Generic input field
  inputField: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8F8FA',
    borderWidth: 1.5,
    borderColor: 'rgba(60,60,67,0.12)',
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 14,
  },

  // Fetch / action button
  fetchBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  fetchBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },

  // Loading
  loadingWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  loadingText: { fontSize: 14, fontWeight: '600' },

  // Plan tabs
  planTabsScroll: { marginBottom: 14, marginTop: 4 },
  planTab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(60,60,67,0.12)',
    backgroundColor: '#F8F8FA',
    marginRight: 8,
  },
  planTabText: { fontSize: 13, fontWeight: '600', color: '#6E6E73' },
  planTabTextActive: { color: '#FFFFFF', fontWeight: '700' },
  noPlansText: { fontSize: 14, color: '#AEAEB2', textAlign: 'center', paddingVertical: 20 },

  // Plan card
  planCard: {
    backgroundColor: '#F8F8FA',
    borderRadius: 16,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(60,60,67,0.08)',
    position: 'relative',
  },
  planTag: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 10,
  },
  planTagText: { fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  planAmtWrap: { minWidth: 64, alignItems: 'flex-start' },
  planAmt: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  planValidity: { fontSize: 11, color: '#8E8E93', fontWeight: '500', marginTop: 2 },
  planDetails: { flex: 1, gap: 4 },
  planDetail: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  planDetailIcon: { fontSize: 11, width: 16 },
  planDetailText: { fontSize: 12, color: '#3C3C43', fontWeight: '500', flex: 1 },
  planRechargeBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  planRechargeBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },

  // Custom recharge
  customRechargeWrap: { marginTop: 16, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(60,60,67,0.1)' },
  customRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  customInputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F8F8FA',
    borderWidth: 1.5,
    borderColor: 'rgba(60,60,67,0.12)',
    paddingHorizontal: 14,
  },
  customRupee: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginRight: 4 },
  customInput: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  customPayBtn: { height: 52, paddingHorizontal: 22, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  customPayBtnText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },

  // Bill card
  billCard: { marginTop: 16, borderRadius: 20, overflow: 'hidden' },
  billCardGrad: { padding: 22, position: 'relative', overflow: 'hidden' },
  deco: { position: 'absolute', borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.12)' },
  billCardLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 0.5, marginBottom: 6 },
  billCardName: { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginBottom: 2 },
  billCardConsumer: { fontSize: 13, color: 'rgba(255,255,255,0.65)', marginBottom: 18 },
  billCardRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  billCardFieldLabel: { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginBottom: 3 },
  billCardAmt: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  billCardDueDate: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  billCardPeriod: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.85)' },
  billCardDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.25)' },
  billExtraInfo: { backgroundColor: '#FFF9C4', padding: 12, marginTop: 1 },
  billExtraText: { fontSize: 12, color: '#7A6200', fontWeight: '500' },
  payNowBtn: { height: 56, justifyContent: 'center', alignItems: 'center' },
  payNowText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});

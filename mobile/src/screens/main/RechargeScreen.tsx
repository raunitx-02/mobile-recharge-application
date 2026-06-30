/**
 * RechargeScreen — Complete Paytm/Amazon Pay-style flow
 * - Category selection grid
 * - Auto operator+circle detection from 4-digit TRAI prefix
 * - Live plans from backend (grouped by category, searchable)
 * - Manual override for operator+circle
 * - Navigates to CheckoutScreen
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Platform, ActivityIndicator,
  FlatList, Modal, KeyboardAvoidingView, Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../theme';
import { rechargeService } from '../../services/recharge.service';
import { RootStackParamList, MainTabParamList } from '../../navigation/types';

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ServiceType =
  | 'mobile_prepaid' | 'mobile_postpaid' | 'dth'
  | 'electricity' | 'water' | 'gas' | 'broadband'
  | 'rent' | 'fasttag' | 'insurance' | 'loan' | 'credit_card';

interface Plan {
  id: string | number;
  amount: number;
  validity: string;
  data?: string;
  calls?: string;
  sms?: string;
  description?: string;
  category: string;
  kwikApiPlanId?: string | number;
  tag?: string;
}

type RechargePlanCategory = 'popular' | 'data' | 'talktime' | 'validity' | 'ott' | 'all';

// ─── CATEGORIES CONFIG ────────────────────────────────────────────────────────

const CATEGORIES: { id: ServiceType; emoji: string; label: string; color: string; bg: string }[] = [
  { id: 'mobile_prepaid',  emoji: '📱', label: 'Mobile\nPrepaid',  color: '#5B3CF5', bg: '#EEE9FF' },
  { id: 'mobile_postpaid', emoji: '📲', label: 'Postpaid\nBill',   color: '#1D6FEB', bg: '#E8F0FF' },
  { id: 'dth',             emoji: '📺', label: 'DTH',              color: '#D97B00', bg: '#FFF7E6' },
  { id: 'electricity',     emoji: '⚡', label: 'Electricity',      color: '#F06B2A', bg: '#FFF0E8' },
  { id: 'water',           emoji: '💧', label: 'Water',            color: '#2196F3', bg: '#E8F5FF' },
  { id: 'gas',             emoji: '🔥', label: 'Piped Gas',        color: '#E53935', bg: '#FDEAEA' },
  { id: 'broadband',       emoji: '📡', label: 'Broadband',        color: '#7B1FA2', bg: '#F0E8FF' },
  { id: 'rent',            emoji: '🏠', label: 'Rent Pay',         color: '#059669', bg: '#E8F8EF' },
  { id: 'fasttag',         emoji: '🛣️', label: 'FASTag',          color: '#64748B', bg: '#F3F4F6' },
  { id: 'insurance',       emoji: '🛡️', label: 'Insurance',       color: '#EC4899', bg: '#FDE8F5' },
  { id: 'loan',            emoji: '🏦', label: 'Loan EMI',         color: '#14B8A6', bg: '#E8F8F7' },
  { id: 'credit_card',     emoji: '💳', label: 'Credit Card',      color: '#F97316', bg: '#FEF0E8' },
];

// ─── OPERATOR LOOKUP ─────────────────────────────────────────────────────────

const OPERATORS = ['Jio', 'Airtel', 'Vi', 'BSNL'];
const DTH_OPERATORS = ['Tata Play', 'Dish TV', 'Airtel DTH', 'Sun Direct', 'D2H'];
const CIRCLES = [
  'Delhi NCR', 'Mumbai', 'Maharashtra & Goa', 'Karnataka', 'Tamil Nadu',
  'Andhra Pradesh', 'Telangana', 'Gujarat', 'Rajasthan', 'UP East',
  'UP West', 'Punjab', 'Haryana', 'West Bengal', 'Kerala',
  'Madhya Pradesh', 'Odisha', 'Bihar & Jharkhand', 'Assam',
  'Himachal Pradesh', 'J&K', 'Kolkata', 'NE',
];

const OPERATOR_COLOR: Record<string, [string, string]> = {
  Jio:    ['#0C56C5', '#1E80FF'],
  Airtel: ['#E3022A', '#FF4060'],
  Vi:     ['#5C2883', '#8040CC'],
  BSNL:   ['#1B6B3A', '#2EA055'],
};

const OPERATOR_KWIK_ID: Record<string, number> = {
  Jio: 8, Airtel: 1, Vi: 3, BSNL: 4,
};

// 4-digit TRAI prefix map (compact — covers major series)
const TRAI_4: Record<string, { op: string; circle: string }> = {
  '6000':{ op:'JIO', circle:'Andhra Pradesh' },'6001':{ op:'JIO', circle:'Andhra Pradesh' },'6002':{ op:'JIO', circle:'Andhra Pradesh' },'6003':{ op:'JIO', circle:'Andhra Pradesh' },
  '6004':{ op:'JIO', circle:'Gujarat' },'6005':{ op:'JIO', circle:'Karnataka' },'6006':{ op:'JIO', circle:'Kerala' },'6007':{ op:'JIO', circle:'Kolkata' },
  '6008':{ op:'JIO', circle:'Madhya Pradesh' },'6009':{ op:'JIO', circle:'Maharashtra & Goa' },
  '6200':{ op:'JIO', circle:'Bihar & Jharkhand' },'6201':{ op:'JIO', circle:'Bihar & Jharkhand' },'6202':{ op:'JIO', circle:'Bihar & Jharkhand' },'6203':{ op:'JIO', circle:'Bihar & Jharkhand' },'6204':{ op:'JIO', circle:'Bihar & Jharkhand' },'6205':{ op:'JIO', circle:'Bihar & Jharkhand' },'6206':{ op:'JIO', circle:'Bihar & Jharkhand' },'6207':{ op:'JIO', circle:'Bihar & Jharkhand' },'6208':{ op:'JIO', circle:'Bihar & Jharkhand' },'6209':{ op:'JIO', circle:'Bihar & Jharkhand' },
  '6210':{ op:'JIO', circle:'Bihar & Jharkhand' },'6211':{ op:'JIO', circle:'Bihar & Jharkhand' },'6212':{ op:'JIO', circle:'Bihar & Jharkhand' },'6213':{ op:'JIO', circle:'Bihar & Jharkhand' },'6214':{ op:'JIO', circle:'Bihar & Jharkhand' },'6215':{ op:'JIO', circle:'Bihar & Jharkhand' },
  '6216':{ op:'JIO', circle:'Rajasthan' },'6217':{ op:'JIO', circle:'Rajasthan' },'6218':{ op:'JIO', circle:'Rajasthan' },'6219':{ op:'JIO', circle:'Rajasthan' },
  '6220':{ op:'JIO', circle:'UP East' },'6221':{ op:'JIO', circle:'UP East' },'6222':{ op:'JIO', circle:'UP East' },'6223':{ op:'JIO', circle:'UP East' },
  '6224':{ op:'JIO', circle:'UP West' },'6225':{ op:'JIO', circle:'UP West' },'6226':{ op:'JIO', circle:'UP West' },'6227':{ op:'JIO', circle:'UP West' },
  '6228':{ op:'JIO', circle:'West Bengal' },'6229':{ op:'JIO', circle:'West Bengal' },'6230':{ op:'JIO', circle:'West Bengal' },'6231':{ op:'JIO', circle:'West Bengal' },
  '6232':{ op:'JIO', circle:'Madhya Pradesh' },'6233':{ op:'JIO', circle:'Madhya Pradesh' },'6234':{ op:'JIO', circle:'Madhya Pradesh' },'6235':{ op:'JIO', circle:'Madhya Pradesh' },
  '6260':{ op:'JIO', circle:'Madhya Pradesh' },'6261':{ op:'JIO', circle:'Madhya Pradesh' },'6262':{ op:'JIO', circle:'Madhya Pradesh' },'6263':{ op:'JIO', circle:'Madhya Pradesh' },'6264':{ op:'JIO', circle:'Madhya Pradesh' },'6265':{ op:'JIO', circle:'Madhya Pradesh' },'6266':{ op:'JIO', circle:'Madhya Pradesh' },'6267':{ op:'JIO', circle:'Madhya Pradesh' },'6268':{ op:'JIO', circle:'Madhya Pradesh' },'6269':{ op:'JIO', circle:'Madhya Pradesh' },
  '6300':{ op:'JIO', circle:'Andhra Pradesh' },'6301':{ op:'JIO', circle:'Andhra Pradesh' },'6302':{ op:'JIO', circle:'Andhra Pradesh' },'6303':{ op:'JIO', circle:'Andhra Pradesh' },'6304':{ op:'JIO', circle:'Andhra Pradesh' },'6305':{ op:'JIO', circle:'Andhra Pradesh' },'6306':{ op:'JIO', circle:'Andhra Pradesh' },'6307':{ op:'JIO', circle:'Andhra Pradesh' },'6308':{ op:'JIO', circle:'Andhra Pradesh' },'6309':{ op:'JIO', circle:'Andhra Pradesh' },
  '6360':{ op:'JIO', circle:'Tamil Nadu' },'6361':{ op:'JIO', circle:'Tamil Nadu' },'6362':{ op:'JIO', circle:'Tamil Nadu' },'6363':{ op:'JIO', circle:'Tamil Nadu' },'6364':{ op:'JIO', circle:'Tamil Nadu' },'6365':{ op:'JIO', circle:'Tamil Nadu' },'6366':{ op:'JIO', circle:'Tamil Nadu' },'6367':{ op:'JIO', circle:'Tamil Nadu' },'6368':{ op:'JIO', circle:'Tamil Nadu' },'6369':{ op:'JIO', circle:'Tamil Nadu' },
  '6370':{ op:'JIO', circle:'Assam' },'6371':{ op:'JIO', circle:'Assam' },'6372':{ op:'JIO', circle:'Assam' },'6373':{ op:'JIO', circle:'Assam' },
  '6374':{ op:'JIO', circle:'NE' },'6375':{ op:'JIO', circle:'NE' },
  '6376':{ op:'JIO', circle:'Himachal Pradesh' },'6377':{ op:'JIO', circle:'Himachal Pradesh' },'6378':{ op:'JIO', circle:'Himachal Pradesh' },'6379':{ op:'JIO', circle:'Himachal Pradesh' },
  '6380':{ op:'JIO', circle:'Karnataka' },'6381':{ op:'JIO', circle:'Tamil Nadu' },'6382':{ op:'JIO', circle:'Tamil Nadu' },'6383':{ op:'JIO', circle:'Tamil Nadu' },'6384':{ op:'JIO', circle:'Tamil Nadu' },'6385':{ op:'JIO', circle:'Tamil Nadu' },'6386':{ op:'JIO', circle:'Tamil Nadu' },'6387':{ op:'JIO', circle:'Tamil Nadu' },'6388':{ op:'JIO', circle:'Tamil Nadu' },'6389':{ op:'JIO', circle:'Tamil Nadu' },
  '6390':{ op:'JIO', circle:'Assam' },'6391':{ op:'JIO', circle:'Assam' },'6392':{ op:'JIO', circle:'Assam' },'6393':{ op:'JIO', circle:'Assam' },'6394':{ op:'JIO', circle:'Assam' },'6395':{ op:'JIO', circle:'Assam' },'6396':{ op:'JIO', circle:'Assam' },
  '6397':{ op:'JIO', circle:'NE' },'6398':{ op:'JIO', circle:'NE' },'6399':{ op:'JIO', circle:'NE' },
  '7000':{ op:'JIO', circle:'UP East' },'7001':{ op:'JIO', circle:'UP East' },'7002':{ op:'JIO', circle:'UP East' },'7003':{ op:'JIO', circle:'UP East' },
  '7004':{ op:'JIO', circle:'Delhi NCR' },'7005':{ op:'JIO', circle:'UP East' },'7006':{ op:'JIO', circle:'J&K' },'7007':{ op:'JIO', circle:'UP East' },
  '7011':{ op:'AIRTEL', circle:'Delhi NCR' },'7012':{ op:'JIO', circle:'Kerala' },'7013':{ op:'JIO', circle:'Kerala' },
  '7014':{ op:'JIO', circle:'Rajasthan' },'7015':{ op:'JIO', circle:'Rajasthan' },'7016':{ op:'JIO', circle:'Rajasthan' },
  '7017':{ op:'JIO', circle:'UP West' },'7018':{ op:'JIO', circle:'UP West' },'7019':{ op:'JIO', circle:'UP West' },
  '7020':{ op:'JIO', circle:'Maharashtra & Goa' },'7021':{ op:'JIO', circle:'Maharashtra & Goa' },
  '7022':{ op:'JIO', circle:'Karnataka' },'7023':{ op:'JIO', circle:'Karnataka' },
  '7024':{ op:'JIO', circle:'Gujarat' },'7025':{ op:'JIO', circle:'Gujarat' },
  '7026':{ op:'JIO', circle:'Kerala' },'7027':{ op:'JIO', circle:'Kerala' },
  '7028':{ op:'JIO', circle:'Bihar & Jharkhand' },'7029':{ op:'JIO', circle:'Bihar & Jharkhand' },'7030':{ op:'JIO', circle:'Maharashtra & Goa' },'7031':{ op:'JIO', circle:'Bihar & Jharkhand' },'7032':{ op:'JIO', circle:'Bihar & Jharkhand' },'7033':{ op:'JIO', circle:'Bihar & Jharkhand' },'7034':{ op:'JIO', circle:'Bihar & Jharkhand' },'7035':{ op:'JIO', circle:'Bihar & Jharkhand' },
  '7036':{ op:'JIO', circle:'Andhra Pradesh' },'7037':{ op:'JIO', circle:'Andhra Pradesh' },'7038':{ op:'JIO', circle:'Andhra Pradesh' },'7039':{ op:'JIO', circle:'Andhra Pradesh' },'7040':{ op:'JIO', circle:'Andhra Pradesh' },'7041':{ op:'JIO', circle:'Andhra Pradesh' },
  '7042':{ op:'AIRTEL', circle:'Delhi NCR' },
  '7043':{ op:'JIO', circle:'Madhya Pradesh' },'7044':{ op:'JIO', circle:'Madhya Pradesh' },'7045':{ op:'JIO', circle:'Madhya Pradesh' },
  '7046':{ op:'JIO', circle:'Kolkata' },'7047':{ op:'JIO', circle:'Kolkata' },'7048':{ op:'JIO', circle:'West Bengal' },'7049':{ op:'JIO', circle:'West Bengal' },
  '7050':{ op:'JIO', circle:'West Bengal' },'7051':{ op:'JIO', circle:'West Bengal' },'7052':{ op:'JIO', circle:'West Bengal' },'7053':{ op:'JIO', circle:'West Bengal' },'7054':{ op:'JIO', circle:'West Bengal' },'7055':{ op:'JIO', circle:'West Bengal' },'7056':{ op:'JIO', circle:'West Bengal' },'7057':{ op:'JIO', circle:'West Bengal' },'7058':{ op:'JIO', circle:'West Bengal' },'7059':{ op:'JIO', circle:'West Bengal' },
  '7060':{ op:'JIO', circle:'UP East' },'7061':{ op:'JIO', circle:'UP East' },'7062':{ op:'JIO', circle:'UP East' },'7063':{ op:'JIO', circle:'UP East' },
  '7064':{ op:'JIO', circle:'Andhra Pradesh' },'7065':{ op:'AIRTEL', circle:'Delhi NCR' },'7066':{ op:'JIO', circle:'Maharashtra & Goa' },
  '7067':{ op:'JIO', circle:'Rajasthan' },'7068':{ op:'JIO', circle:'Gujarat' },'7069':{ op:'JIO', circle:'Gujarat' },
  '7070':{ op:'JIO', circle:'Andhra Pradesh' },'7071':{ op:'JIO', circle:'Andhra Pradesh' },'7072':{ op:'JIO', circle:'Tamil Nadu' },'7073':{ op:'JIO', circle:'Tamil Nadu' },
  '7074':{ op:'JIO', circle:'Odisha' },'7075':{ op:'JIO', circle:'Odisha' },
  '7076':{ op:'JIO', circle:'Karnataka' },'7077':{ op:'JIO', circle:'Karnataka' },'7078':{ op:'JIO', circle:'Karnataka' },'7079':{ op:'JIO', circle:'Karnataka' },
  '7080':{ op:'JIO', circle:'UP East' },'7081':{ op:'JIO', circle:'UP East' },'7082':{ op:'JIO', circle:'UP East' },'7083':{ op:'JIO', circle:'UP East' },
  '7084':{ op:'JIO', circle:'Rajasthan' },'7085':{ op:'JIO', circle:'Rajasthan' },
  '7086':{ op:'JIO', circle:'Assam' },'7087':{ op:'JIO', circle:'Assam' },
  '7088':{ op:'JIO', circle:'Haryana' },'7089':{ op:'JIO', circle:'Haryana' },
  '7090':{ op:'JIO', circle:'UP West' },'7091':{ op:'JIO', circle:'UP West' },'7092':{ op:'JIO', circle:'UP West' },
  '7093':{ op:'JIO', circle:'Madhya Pradesh' },'7094':{ op:'JIO', circle:'Madhya Pradesh' },
  '7095':{ op:'JIO', circle:'Haryana' },'7096':{ op:'JIO', circle:'Haryana' },'7097':{ op:'JIO', circle:'Haryana' },'7098':{ op:'JIO', circle:'Haryana' },'7099':{ op:'JIO', circle:'Haryana' },
  '7289':{ op:'AIRTEL', circle:'Delhi NCR' },'7428':{ op:'AIRTEL', circle:'Delhi NCR' },'7503':{ op:'AIRTEL', circle:'Delhi NCR' },'7678':{ op:'AIRTEL', circle:'Delhi NCR' },'7703':{ op:'AIRTEL', circle:'Delhi NCR' },'7827':{ op:'AIRTEL', circle:'Delhi NCR' },'7840':{ op:'AIRTEL', circle:'Mumbai' },
  '8087':{ op:'VI', circle:'Maharashtra & Goa' },'8130':{ op:'AIRTEL', circle:'Delhi NCR' },'8291':{ op:'VI', circle:'Maharashtra & Goa' },'8447':{ op:'AIRTEL', circle:'Delhi NCR' },'8448':{ op:'AIRTEL', circle:'Delhi NCR' },'8527':{ op:'AIRTEL', circle:'Delhi NCR' },'8729':{ op:'BSNL', circle:'Assam' },'8800':{ op:'AIRTEL', circle:'Delhi NCR' },'8810':{ op:'AIRTEL', circle:'Delhi NCR' },'8826':{ op:'AIRTEL', circle:'Delhi NCR' },'8860':{ op:'AIRTEL', circle:'Delhi NCR' },'8882':{ op:'AIRTEL', circle:'Delhi NCR' },'8929':{ op:'AIRTEL', circle:'Delhi NCR' },
  '9004':{ op:'VI', circle:'Mumbai' },'9175':{ op:'VI', circle:'Maharashtra & Goa' },'9312':{ op:'AIRTEL', circle:'Delhi NCR' },'9313':{ op:'AIRTEL', circle:'Delhi NCR' },'9314':{ op:'AIRTEL', circle:'Delhi NCR' },'9315':{ op:'AIRTEL', circle:'Delhi NCR' },'9316':{ op:'AIRTEL', circle:'Delhi NCR' },'9321':{ op:'VI', circle:'Maharashtra & Goa' },'9322':{ op:'VI', circle:'Maharashtra & Goa' },'9323':{ op:'VI', circle:'Maharashtra & Goa' },'9324':{ op:'VI', circle:'Maharashtra & Goa' },'9325':{ op:'VI', circle:'Maharashtra & Goa' },'9326':{ op:'VI', circle:'Maharashtra & Goa' },'9350':{ op:'AIRTEL', circle:'Delhi NCR' },'9372':{ op:'VI', circle:'Maharashtra & Goa' },'9373':{ op:'VI', circle:'Maharashtra & Goa' },
  '9418':{ op:'BSNL', circle:'Himachal Pradesh' },'9435':{ op:'BSNL', circle:'Assam' },'9436':{ op:'BSNL', circle:'NE' },'9459':{ op:'BSNL', circle:'Himachal Pradesh' },'9560':{ op:'AIRTEL', circle:'Delhi NCR' },'9643':{ op:'AIRTEL', circle:'Delhi NCR' },'9702':{ op:'VI', circle:'Maharashtra & Goa' },'9711':{ op:'AIRTEL', circle:'Delhi NCR' },'9717':{ op:'AIRTEL', circle:'Delhi NCR' },'9769':{ op:'VI', circle:'Mumbai' },'9810':{ op:'AIRTEL', circle:'Delhi NCR' },'9811':{ op:'AIRTEL', circle:'Delhi NCR' },'9816':{ op:'BSNL', circle:'Himachal Pradesh' },'9817':{ op:'BSNL', circle:'Himachal Pradesh' },'9818':{ op:'AIRTEL', circle:'Delhi NCR' },'9819':{ op:'VI', circle:'Mumbai' },'9820':{ op:'VI', circle:'Mumbai' },'9821':{ op:'VI', circle:'Mumbai' },'9833':{ op:'VI', circle:'Mumbai' },'9856':{ op:'BSNL', circle:'Assam' },'9862':{ op:'BSNL', circle:'Assam' },'9867':{ op:'VI', circle:'Mumbai' },'9868':{ op:'AIRTEL', circle:'Delhi NCR' },'9871':{ op:'AIRTEL', circle:'Delhi NCR' },'9873':{ op:'AIRTEL', circle:'Delhi NCR' },'9882':{ op:'BSNL', circle:'Himachal Pradesh' },'9891':{ op:'AIRTEL', circle:'Delhi NCR' },'9892':{ op:'VI', circle:'Mumbai' },'9899':{ op:'AIRTEL', circle:'Delhi NCR' },'9910':{ op:'AIRTEL', circle:'Delhi NCR' },'9911':{ op:'AIRTEL', circle:'Delhi NCR' },'9920':{ op:'VI', circle:'Mumbai' },'9930':{ op:'VI', circle:'Maharashtra & Goa' },'9953':{ op:'AIRTEL', circle:'Delhi NCR' },'9958':{ op:'AIRTEL', circle:'Delhi NCR' },'9967':{ op:'VI', circle:'Mumbai' },'9971':{ op:'AIRTEL', circle:'Delhi NCR' },'9987':{ op:'VI', circle:'Mumbai' },'9990':{ op:'AIRTEL', circle:'Delhi NCR' },'9999':{ op:'AIRTEL', circle:'Delhi NCR' },
  '7506':{ op:'VI', circle:'Maharashtra & Goa' },'7533':{ op:'VI', circle:'Maharashtra & Goa' },'7588':{ op:'VI', circle:'Maharashtra & Goa' },'7720':{ op:'VI', circle:'Maharashtra & Goa' },'7798':{ op:'VI', circle:'Maharashtra & Goa' },'8870':{ op:'VI', circle:'Delhi NCR' },'9870':{ op:'VI', circle:'Delhi NCR' },
};

const TRAI_2: Record<string, { op: string; circle: string }> = {
  '60':{ op:'JIO', circle:'Maharashtra & Goa' },'61':{ op:'JIO', circle:'Maharashtra & Goa' },'62':{ op:'JIO', circle:'Maharashtra & Goa' },'63':{ op:'JIO', circle:'Maharashtra & Goa' },'64':{ op:'JIO', circle:'Maharashtra & Goa' },'65':{ op:'JIO', circle:'Maharashtra & Goa' },'66':{ op:'JIO', circle:'Maharashtra & Goa' },'67':{ op:'JIO', circle:'Maharashtra & Goa' },'68':{ op:'JIO', circle:'Maharashtra & Goa' },'69':{ op:'JIO', circle:'Maharashtra & Goa' },
  '70':{ op:'JIO', circle:'Maharashtra & Goa' },'73':{ op:'JIO', circle:'Maharashtra & Goa' },'74':{ op:'JIO', circle:'Maharashtra & Goa' },'79':{ op:'JIO', circle:'Gujarat' },
  '71':{ op:'BSNL', circle:'Delhi NCR' },'72':{ op:'AIRTEL', circle:'Maharashtra & Goa' },'75':{ op:'VI', circle:'Maharashtra & Goa' },'76':{ op:'VI', circle:'UP East' },'77':{ op:'VI', circle:'UP East' },'78':{ op:'AIRTEL', circle:'Karnataka' },
  '80':{ op:'AIRTEL', circle:'Karnataka' },'81':{ op:'AIRTEL', circle:'Karnataka' },'82':{ op:'AIRTEL', circle:'Karnataka' },'83':{ op:'AIRTEL', circle:'Karnataka' },'84':{ op:'AIRTEL', circle:'Karnataka' },'85':{ op:'AIRTEL', circle:'Karnataka' },'86':{ op:'AIRTEL', circle:'Karnataka' },'87':{ op:'AIRTEL', circle:'Karnataka' },'88':{ op:'AIRTEL', circle:'Karnataka' },'89':{ op:'AIRTEL', circle:'Karnataka' },
  '90':{ op:'AIRTEL', circle:'Delhi NCR' },'91':{ op:'AIRTEL', circle:'Delhi NCR' },'92':{ op:'AIRTEL', circle:'Delhi NCR' },'93':{ op:'AIRTEL', circle:'Delhi NCR' },'94':{ op:'AIRTEL', circle:'Maharashtra & Goa' },'95':{ op:'AIRTEL', circle:'Maharashtra & Goa' },'96':{ op:'VI', circle:'Maharashtra & Goa' },'97':{ op:'VI', circle:'Maharashtra & Goa' },'98':{ op:'AIRTEL', circle:'Delhi NCR' },'99':{ op:'AIRTEL', circle:'Delhi NCR' },
};

function detectLocalOperator(num: string): { operator: string; circle: string } | null {
  if (num.length < 4) return null;
  const p4 = num.slice(0, 4);
  const p2 = num.slice(0, 2);
  const fromMap = TRAI_4[p4] || TRAI_2[p2];
  if (!fromMap) return null;
  // Normalize op name
  const opMap: Record<string, string> = { JIO: 'Jio', AIRTEL: 'Airtel', VI: 'Vi', BSNL: 'BSNL' };
  return { operator: opMap[fromMap.op] || fromMap.op, circle: fromMap.circle };
}

// ─── PLAN TABS ────────────────────────────────────────────────────────────────

const PLAN_TABS: { key: RechargePlanCategory; label: string }[] = [
  { key: 'popular', label: 'Popular' },
  { key: 'data',    label: 'Data' },
  { key: 'talktime',label: 'Talktime' },
  { key: 'validity',label: 'Long Validity' },
  { key: 'ott',     label: 'OTT' },
  { key: 'all',     label: 'All' },
];

// ─── FALLBACK PLANS (when API is unavailable) ─────────────────────────────────

const FALLBACK_PLANS: Record<string, Plan[]> = {
  Jio: [
    { id: 'j1', amount: 149,  validity: '24 days',  data: '1GB/day',   calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'j2', amount: 199,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'j3', amount: 299,  validity: '28 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'BEST VALUE' },
    { id: 'j4', amount: 479,  validity: '56 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'validity' },
    { id: 'j5', amount: 533,  validity: '84 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'validity' },
    { id: 'j6', amount: 666,  validity: '84 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'validity', tag: 'BEST VALUE' },
    { id: 'j7', amount: 999,  validity: '84 days',  data: '3GB/day',   calls: 'Unlimited', sms: '100/day', category: 'ott', description: 'Disney+ Hotstar included', tag: 'OTT' },
    { id: 'j8', amount: 2999, validity: '365 days', data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'validity', tag: 'BEST VALUE' },
    { id: 'j9', amount: 19,   validity: '1 day',    data: '1GB',       calls: 'Unlimited', sms: '100',     category: 'talktime' },
    { id: 'j10',amount: 75,   validity: 'No Limit', data: 'No Data',   calls: '₹75 Balance', category: 'talktime' },
    { id: 'j11',amount: 601,  validity: '84 days',  data: '10GB Total',calls: 'Unlimited', sms: '100/day', category: 'data' },
    { id: 'j12',amount: 151,  validity: '30 days',  data: '12GB Total',calls: 'Unlimited', sms: '100/day', category: 'data' },
  ],
  Airtel: [
    { id: 'a1', amount: 179,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'a2', amount: 239,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'a3', amount: 299,  validity: '28 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'BEST VALUE' },
    { id: 'a4', amount: 359,  validity: '28 days',  data: '2.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'ott', description: 'Disney+ Hotstar + Amazon Prime included', tag: 'OTT' },
    { id: 'a5', amount: 509,  validity: '56 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'validity' },
    { id: 'a6', amount: 699,  validity: '84 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'validity', tag: 'BEST VALUE' },
    { id: 'a7', amount: 3599, validity: '365 days', data: '2.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'validity', tag: 'BEST VALUE' },
    { id: 'a8', amount: 49,   validity: '28 days',  data: 'No Data',   calls: '₹49 Balance', category: 'talktime' },
    { id: 'a9', amount: 601,  validity: '84 days',  data: '50GB Total',calls: 'Unlimited', sms: '100/day', category: 'data' },
  ],
  Vi: [
    { id: 'v1', amount: 179,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'v2', amount: 269,  validity: '28 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'v3', amount: 299,  validity: '28 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'BEST VALUE' },
    { id: 'v4', amount: 479,  validity: '56 days',  data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'validity' },
    { id: 'v5', amount: 601,  validity: '84 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'validity', tag: 'BEST VALUE' },
    { id: 'v6', amount: 1799, validity: '365 days', data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'validity' },
  ],
  BSNL: [
    { id: 'b1', amount: 107,  validity: '28 days',  data: '1GB/day',   calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'b2', amount: 187,  validity: '28 days',  data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'popular' },
    { id: 'b3', amount: 397,  validity: '60 days',  data: '1GB/day',   calls: 'Unlimited', sms: '100/day', category: 'validity' },
    { id: 'b4', amount: 52,   validity: '28 days',  data: 'No Data',   calls: '₹52 Balance', category: 'talktime' },
  ],
  Default: [
    { id: 'd1', amount: 199, validity: '28 days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'POPULAR' },
    { id: 'd2', amount: 299, validity: '28 days', data: '2GB/day',   calls: 'Unlimited', sms: '100/day', category: 'popular', tag: 'BEST VALUE' },
    { id: 'd3', amount: 499, validity: '56 days', data: '1.5GB/day', calls: 'Unlimited', sms: '100/day', category: 'validity' },
  ],
};

// ─── COMPONENT ───────────────────────────────────────────────────────────────

type RouteProps = RouteProp<MainTabParamList, 'RechargeTab'>;

export default function RechargeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProps>();

  const initialService = (route.params?.serviceType as ServiceType) || null;

  const [selectedCategory, setSelectedCategory] = useState<ServiceType | null>(initialService);
  const [phone, setPhone]             = useState('');
  const [operator, setOperator]       = useState('');
  const [circle, setCircle]           = useState('');
  const [detecting, setDetecting]     = useState(false);
  const [manualMode, setManualMode]   = useState(false);
  const [operatorModal, setOpModal]   = useState(false);
  const [circleModal, setCircleModal] = useState(false);
  const [plans, setPlans]             = useState<Plan[]>([]);
  const [planTab, setPlanTab]         = useState<RechargePlanCategory>('popular');
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [planSearch, setPlanSearch]   = useState('');
  const [consumerNo, setConsumerNo]   = useState('');
  const [selectedBiller, setSelectedBiller] = useState('');

  const phoneRef = useRef<TextInput>(null);

  const isMobile = selectedCategory === 'mobile_prepaid' || selectedCategory === 'mobile_postpaid';
  const isDth = selectedCategory === 'dth';

  // Auto-detect from typed number
  const handlePhoneChange = useCallback((val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    setOperator('');
    setCircle('');
    setPlans([]);
    setManualMode(false);

    if (digits.length >= 4) {
      const detected = detectLocalOperator(digits);
      if (detected) {
        setOperator(detected.operator);
        setCircle(detected.circle);
      }
    }
  }, []);

  // Fetch live plans from backend when operator+circle are set and 10 digits
  useEffect(() => {
    if (!isMobile || !operator || phone.length !== 10) return;

    const fetchPlans = async () => {
      setLoadingPlans(true);
      try {
        const res = await rechargeService.getPlans({
          operator,
          circle,
          operatorCode: operator.toUpperCase(),
        });
        const apiPlans: Plan[] = res?.data?.plans || res?.plans || [];
        if (apiPlans.length > 0) {
          setPlans(apiPlans);
        } else {
          // Use fallback plans
          setPlans(FALLBACK_PLANS[operator] || FALLBACK_PLANS.Default);
        }
      } catch {
        setPlans(FALLBACK_PLANS[operator] || FALLBACK_PLANS.Default);
      } finally {
        setLoadingPlans(false);
      }
    };

    const t = setTimeout(fetchPlans, 600); // debounce
    return () => clearTimeout(t);
  }, [operator, circle, phone, isMobile]);

  const handleOperatorSelect = useCallback((op: string) => {
    setOperator(op);
    setOpModal(false);
    setPlans([]);
    setManualMode(true);
  }, []);

  const handleCircleSelect = useCallback((c: string) => {
    setCircle(c);
    setCircleModal(false);
    setManualMode(true);
  }, []);

  const handlePlanSelect = useCallback((plan: Plan) => {
    if (!phone || phone.length !== 10) {
      Toast.show({ type: 'error', text1: 'Enter mobile number first' });
      return;
    }
    if (!operator) {
      Toast.show({ type: 'error', text1: 'Select operator first' });
      return;
    }
    navigation.navigate('Checkout', {
      plan,
      phone,
      operator,
      circle,
      operatorKwikId: OPERATOR_KWIK_ID[operator],
      type: selectedCategory === 'mobile_postpaid' ? 'postpaid' : selectedCategory === 'dth' ? 'dth' : 'prepaid',
    });
  }, [phone, operator, circle, navigation, selectedCategory]);

  // Filter plans by tab + search
  const filteredPlans = plans.filter(p => {
    const tabMatch = planTab === 'all' ? true : p.category === planTab || (planTab === 'popular' && p.tag === 'POPULAR');
    const searchMatch = !planSearch || [p.amount, p.validity, p.data, p.description, p.calls].some(
      v => String(v || '').toLowerCase().includes(planSearch.toLowerCase())
    );
    return tabMatch && searchMatch;
  });

  const opColors = operator ? (OPERATOR_COLOR[operator] || OPERATOR_COLOR.Jio) : [colors.primary, colors.primaryLight] as [string, string];

  // ── RENDER: Category Grid ─────────────────────────────────────────────────

  if (!selectedCategory) {
    return (
      <View style={s.root}>
        <StatusBar barStyle="dark-content" />
        <View style={s.topBar}>
          <Text style={s.topBarTitle}>Pay & Recharge</Text>
        </View>
        <ScrollView contentContainerStyle={s.catScroll} showsVerticalScrollIndicator={false}>
          <Text style={s.catHint}>Select a service to continue</Text>
          <View style={s.catGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={s.catItem}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.75}
              >
                <View style={[s.catIconWrap, { backgroundColor: cat.bg }]}>
                  <Text style={s.catIcon}>{cat.emoji}</Text>
                </View>
                <Text style={s.catLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── RENDER: Recharge Flow ─────────────────────────────────────────────────

  const catConfig = CATEGORIES.find(c => c.id === selectedCategory)!;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={[catConfig.color, catConfig.color + 'CC']} style={s.header}>
        <TouchableOpacity onPress={() => { setSelectedCategory(null); setPhone(''); setOperator(''); setCircle(''); setPlans([]); }} style={s.backBtn}>
          <Text style={s.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>{catConfig.emoji} {catConfig.label.replace('\n', ' ')}</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Number Input */}
          <View style={s.inputSection}>
            {isMobile && (
              <>
                <Text style={s.inputLabel}>Mobile Number</Text>
                <View style={s.inputWrap}>
                  <Text style={s.inputFlag}>🇮🇳 +91</Text>
                  <TextInput
                    ref={phoneRef}
                    style={s.input}
                    value={phone}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholder="Enter 10-digit number"
                    placeholderTextColor={colors.textMuted}
                    autoFocus
                  />
                  {detecting && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 12 }} />}
                  {phone.length > 0 && !detecting && (
                    <TouchableOpacity onPress={() => { setPhone(''); setOperator(''); setCircle(''); setPlans([]); }}>
                      <Text style={s.clearBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Auto-detected operator+circle */}
                {phone.length >= 4 && operator ? (
                  <View style={s.detectedRow}>
                    <LinearGradient
                      colors={opColors as [string,string]}
                      style={s.detectedBadge}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      <Text style={s.detectedText}>📡 {operator} • {circle}</Text>
                    </LinearGradient>
                    <TouchableOpacity onPress={() => setManualMode(true)} style={s.changeBtn}>
                      <Text style={s.changeBtnText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                ) : phone.length >= 4 ? (
                  <Text style={s.detectHint}>Could not auto-detect. Please select manually.</Text>
                ) : null}

                {/* Manual Override */}
                {(manualMode || (phone.length >= 4 && !operator)) && (
                  <View style={s.manualRow}>
                    <TouchableOpacity style={s.manualPick} onPress={() => setOpModal(true)}>
                      <Text style={s.manualPickLabel}>Operator</Text>
                      <Text style={s.manualPickValue}>{operator || 'Select ▾'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.manualPick} onPress={() => setCircleModal(true)}>
                      <Text style={s.manualPickLabel}>Circle</Text>
                      <Text style={s.manualPickValue} numberOfLines={1}>{circle || 'Select ▾'}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            {!isMobile && !isDth && (
              <>
                <Text style={s.inputLabel}>Consumer / Account Number</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={[s.input, { paddingLeft: 16 }]}
                    value={consumerNo}
                    onChangeText={setConsumerNo}
                    keyboardType="default"
                    placeholder="Enter consumer number"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <Text style={[s.inputLabel, { marginTop: 16 }]}>Select Biller</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={[s.input, { paddingLeft: 16 }]}
                    value={selectedBiller}
                    onChangeText={setSelectedBiller}
                    placeholder="Enter or search biller name"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                {consumerNo.length > 5 && selectedBiller.length > 2 && (
                  <TouchableOpacity
                    style={s.proceedBtn}
                    onPress={() => Toast.show({ type: 'info', text1: 'Fetching bill...', text2: 'Connect your provider API for live bills' })}
                  >
                    <Text style={s.proceedBtnText}>Fetch Bill →</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            {isDth && (
              <>
                <Text style={s.inputLabel}>Subscriber ID / RMN</Text>
                <View style={s.inputWrap}>
                  <TextInput
                    style={[s.input, { paddingLeft: 16 }]}
                    value={consumerNo}
                    onChangeText={setConsumerNo}
                    keyboardType="number-pad"
                    placeholder="Enter subscriber ID"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>
                <Text style={[s.inputLabel, { marginTop: 16 }]}>DTH Provider</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8, marginBottom: 16 }}>
                  {DTH_OPERATORS.map(op => (
                    <TouchableOpacity
                      key={op}
                      style={[s.operatorChip, selectedBiller === op && s.operatorChipActive]}
                      onPress={() => setSelectedBiller(op)}
                    >
                      <Text style={[s.operatorChipText, selectedBiller === op && s.operatorChipTextActive]}>{op}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
          </View>

          {/* Plans Section */}
          {isMobile && operator && phone.length === 10 && (
            <View style={s.plansSection}>
              {/* Plan Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabsScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {PLAN_TABS.map(tab => (
                  <TouchableOpacity
                    key={tab.key}
                    style={[s.tab, planTab === tab.key && s.tabActive]}
                    onPress={() => setPlanTab(tab.key)}
                  >
                    <Text style={[s.tabText, planTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Search */}
              <View style={s.searchWrap}>
                <Text style={s.searchIcon}>🔍</Text>
                <TextInput
                  style={s.searchInput}
                  value={planSearch}
                  onChangeText={setPlanSearch}
                  placeholder="Search by amount, data, validity..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              {/* Plans List */}
              {loadingPlans ? (
                <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 40 }} />
              ) : filteredPlans.length === 0 ? (
                <View style={s.emptyPlans}>
                  <Text style={s.emptyIcon}>📭</Text>
                  <Text style={s.emptyText}>No plans found</Text>
                  <TouchableOpacity onPress={() => { setPlanTab('all'); setPlanSearch(''); }}>
                    <Text style={s.emptyLink}>Show all plans</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredPlans.map(plan => (
                  <TouchableOpacity
                    key={plan.id}
                    style={s.planCard}
                    onPress={() => handlePlanSelect(plan)}
                    activeOpacity={0.8}
                  >
                    <View style={s.planLeft}>
                      <Text style={s.planAmt}>₹{plan.amount}</Text>
                      <Text style={s.planValidity}>📅 {plan.validity}</Text>
                    </View>
                    <View style={s.planMid}>
                      {!!plan.data && <Text style={s.planInfo}>📶 {plan.data}</Text>}
                      {!!plan.calls && <Text style={s.planInfo}>📞 {plan.calls}</Text>}
                      {!!plan.sms && <Text style={s.planInfo}>💬 {plan.sms}</Text>}
                      {!!plan.description && (
                        <Text style={s.planDesc} numberOfLines={2}>✨ {plan.description}</Text>
                      )}
                    </View>
                    <View style={s.planRight}>
                      {!!plan.tag && (
                        <View style={[s.planTag, plan.tag === 'POPULAR' ? s.planTagPopular : plan.tag === 'BEST VALUE' ? s.planTagBest : s.planTagOtt]}>
                          <Text style={s.planTagText}>{plan.tag}</Text>
                        </View>
                      )}
                      <Text style={s.planArrow}>→</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Operator Picker Modal */}
      <Modal visible={operatorModal} transparent animationType="slide" onRequestClose={() => setOpModal(false)}>
        <TouchableOpacity style={s.modalOverlay} onPress={() => setOpModal(false)} activeOpacity={1}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>Select Operator</Text>
            {OPERATORS.map(op => (
              <TouchableOpacity key={op} style={s.modalItem} onPress={() => handleOperatorSelect(op)}>
                <Text style={[s.modalItemText, op === operator && { color: colors.primary, fontWeight: '800' }]}>{op}</Text>
                {op === operator && <Text style={{ color: colors.primary }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Circle Picker Modal */}
      <Modal visible={circleModal} transparent animationType="slide" onRequestClose={() => setCircleModal(false)}>
        <TouchableOpacity style={s.modalOverlay} onPress={() => setCircleModal(false)} activeOpacity={1}>
          <View style={s.modalSheet}>
            <Text style={s.modalTitle}>Select Circle</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CIRCLES.map(c => (
                <TouchableOpacity key={c} style={s.modalItem} onPress={() => handleCircleSelect(c)}>
                  <Text style={[s.modalItemText, c === circle && { color: colors.primary, fontWeight: '800' }]}>{c}</Text>
                  {c === circle && <Text style={{ color: colors.primary }}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  topBar: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topBarTitle: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },

  catScroll: { padding: 20, paddingTop: 12 },
  catHint: { fontSize: 14, color: colors.textMuted, marginBottom: 20 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  catItem: { width: '20%', minWidth: 72, alignItems: 'center', gap: 8 },
  catIconWrap: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  catIcon: { fontSize: 26 },
  catLabel: { fontSize: 10, color: colors.textSecondary, textAlign: 'center', fontWeight: '600', lineHeight: 13 },

  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 44,
    paddingBottom: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backArrow: { fontSize: 22, color: '#fff', fontWeight: '600' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },

  inputSection: {
    backgroundColor: colors.backgroundCard,
    margin: 16,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 10 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  inputFlag: { fontSize: 14, color: colors.textSecondary, paddingHorizontal: 14, fontWeight: '600' },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    paddingVertical: 14,
    paddingRight: 14,
    letterSpacing: 0.5,
  },
  clearBtn: { fontSize: 16, color: colors.textMuted, paddingHorizontal: 14 },

  detectedRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 10 },
  detectedBadge: { borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8, flex: 1 },
  detectedText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  changeBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: colors.border },
  changeBtnText: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  detectHint: { fontSize: 13, color: colors.warning, marginTop: 10, fontWeight: '500' },

  manualRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  manualPick: {
    flex: 1, borderWidth: 1.5, borderColor: colors.primary,
    borderRadius: 12, padding: 14, backgroundColor: colors.primarySubtle,
  },
  manualPickLabel: { fontSize: 11, color: colors.primary, fontWeight: '700', marginBottom: 4 },
  manualPickValue: { fontSize: 14, color: colors.primary, fontWeight: '800' },

  proceedBtn: {
    marginTop: 16, backgroundColor: colors.primary,
    borderRadius: 12, padding: 16, alignItems: 'center',
  },
  proceedBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },

  operatorChip: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 100, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.backgroundCard, marginRight: 8,
  },
  operatorChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  operatorChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  operatorChipTextActive: { color: colors.primary, fontWeight: '800' },

  plansSection: { marginBottom: 16 },
  tabsScroll: { marginBottom: 12 },
  tab: {
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 100,
    borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.backgroundCard,
  },
  tabActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  tabText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  tabTextActive: { color: colors.primary, fontWeight: '800' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard, marginHorizontal: 16, marginBottom: 12,
    borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 12 },

  planCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard, marginHorizontal: 16, marginBottom: 8,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: colors.border,
    gap: 12,
  },
  planLeft: { width: 80, alignItems: 'flex-start', gap: 4 },
  planAmt: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 },
  planValidity: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  planMid: { flex: 1, gap: 3 },
  planInfo: { fontSize: 12.5, color: colors.textSecondary, fontWeight: '500' },
  planDesc: { fontSize: 11.5, color: colors.primary, marginTop: 2, fontWeight: '600' },
  planRight: { alignItems: 'flex-end', gap: 8 },
  planTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  planTagPopular: { backgroundColor: '#EEE9FF' },
  planTagBest: { backgroundColor: colors.successBg },
  planTagOtt: { backgroundColor: '#FDE8F5' },
  planTagText: { fontSize: 9, fontWeight: '800', color: colors.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  planArrow: { fontSize: 18, color: colors.primary, fontWeight: '700' },

  emptyPlans: { alignItems: 'center', paddingVertical: 50 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, marginBottom: 10 },
  emptyLink: { fontSize: 14, color: colors.primary, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: colors.backgroundCard, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '60%',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 16, letterSpacing: -0.3 },
  modalItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  modalItemText: { fontSize: 16, color: colors.text, fontWeight: '600' },
});

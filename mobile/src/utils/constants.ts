export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || '';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'vyntra_access_token',
  REFRESH_TOKEN: 'vyntra_refresh_token',
  USER_ID: 'vyntra_user_id',
};

export const OPERATORS = [
  { id: 'jio', name: 'Jio', color: '#0066FF' },
  { id: 'airtel', name: 'Airtel', color: '#E40000' },
  { id: 'vi', name: 'Vi', color: '#FF1493' },
  { id: 'bsnl', name: 'BSNL', color: '#009900' },
];

export const CIRCLES = [
  'Delhi', 'Mumbai', 'Karnataka', 'Tamil Nadu', 'Andhra Pradesh',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'West Bengal',
  'Kerala', 'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar',
  'Odisha', 'Assam', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand',
];

export const QUICK_AMOUNTS_PREPAID = [19, 49, 79, 99, 149, 199, 299, 399, 599];
export const QUICK_AMOUNTS_WALLET = [100, 200, 500, 1000, 2000, 5000];

export const BBPS_CATEGORIES = [
  { id: 'electricity', name: 'Electricity', icon: '⚡', color: '#FFD60A' },
  { id: 'water', name: 'Water', icon: '💧', color: '#5AC8FA' },
  { id: 'gas', name: 'Gas', icon: '🔥', color: '#FF9F0A' },
  { id: 'broadband', name: 'Broadband', icon: '📡', color: '#007AFF' },
  { id: 'cable', name: 'Cable TV', icon: '📺', color: '#AF52DE' },
  { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#34C759' },
  { id: 'loan', name: 'Loan EMI', icon: '💰', color: '#FF3B30' },
  { id: 'fastag', name: 'FASTag', icon: '🚗', color: '#5856D6' },
  { id: 'municipal', name: 'Municipal Tax', icon: '🏛️', color: '#FF6B35' },
  { id: 'landline', name: 'Landline', icon: '☎️', color: '#636366' },
  { id: 'lpg', name: 'LPG Gas', icon: '🫙', color: '#FF9F0A' },
  { id: 'creditcard', name: 'Credit Card', icon: '💳', color: '#1C1C1E' },
];

export const PLAN_FILTERS = ['Popular', 'Unlimited', 'Data', 'Talktime', 'Special'];

export const OTP_LENGTH = 6;
export const OTP_EXPIRY_SECONDS = 60;
export const POLL_INTERVAL_MS = 5000;
export const DEBOUNCE_DELAY = 500;
export const CAROUSEL_AUTO_SCROLL_INTERVAL = 3000;

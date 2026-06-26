// User types
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  transactionCount: number;
  kycStatus: 'verified' | 'pending' | 'rejected';
  status: 'active' | 'blocked';
  referralCode: string;
  createdAt: string;
  avatar?: string;
  apiOverride?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  remark: string;
  createdAt: string;
}

export interface FundRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  amount: number;
  mode: 'bank_transfer' | 'upi' | 'cash';
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  upiId?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  approvedDate?: string;
  approvedBy?: string;
  remark?: string;
}

// Transaction/Recharge types
export interface RechargeTransaction {
  id: string;
  txnId: string;
  userId: string;
  userOutlet: string;
  accountNumber: string;
  operator: string;
  operatorCode: string;
  dateTime: string;
  openingBalance: number;
  rechargeAmount: number;
  debitAmount: number;
  commission: number;
  closingBalance: number;
  apiName: string;
  status: 'success' | 'pending' | 'failed' | 'refunded' | 'processing';
  refundStatus?: 'pending' | 'processed' | 'none';
  liveId?: string;
  apiRequestId?: string;
  requestMode: string;
  switchingName?: string;
  circle?: string;
  rOfferAmount?: number;
  apiCommission?: number;
}

// Operator types
export interface Operator {
  id: string;
  name: string;
  type: 'prepaid' | 'postpaid' | 'dth' | 'bbps' | 'electricity' | 'gas' | 'broadband';
  apiCode: string;
  status: 'active' | 'inactive';
  logo?: string;
}

export interface Plan {
  id: string;
  operatorId: string;
  circle: string;
  amount: number;
  validity: string;
  description: string;
  dataLimit?: string;
  type: 'prepaid' | 'data' | 'sms' | 'voice' | 'combo';
  status: 'active' | 'inactive';
}

// API Config types
export interface ApiConfig {
  id: string;
  name: string;
  type: 'recharge' | 'bbps';
  routeType: 'internal' | 'external';
  apiUrl: string;
  statusUrl: string;
  balanceUrl: string;
  disputeUrl: string;
  inSwitch: boolean;
  status: 'active' | 'inactive';
  commissionType: 'flat' | 'percentage';
  commissionValue: number;
  credentials: Record<string, string>;
  balance?: number;
}

// Commission types
export interface CommissionRule {
  id: string;
  operatorId: string;
  operatorName: string;
  commissionType: 'flat' | 'percentage';
  value: number;
  apiId?: string;
  circle?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Communication types
export interface SmsConfig {
  id: string;
  providerName: string;
  apiKey: string;
  authKey: string;
  senderId: string;
  templateId: string;
  dltEntityId: string;
  active: boolean;
}

export interface WhatsAppConfig {
  id: string;
  provider: 'interakt' | 'wati' | 'meta';
  apiKey: string;
  fromNumber: string;
  active: boolean;
}

export interface EmailConfig {
  id: string;
  provider: 'sendgrid' | 'smtp';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  fromEmail: string;
  fromName: string;
  active: boolean;
}

export interface PaymentGatewayConfig {
  razorpayKeyId: string;
  razorpayKeySecret: string;
  webhookSecret: string;
}

export interface PaymentTransaction {
  id: string;
  paymentId: string;
  orderId: string;
  userId: string;
  userName: string;
  amount: number;
  status: 'success' | 'failed' | 'refunded';
  createdAt: string;
}

// RBAC types
export interface Permission {
  category: string;
  action: string;
  key: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  usersCount: number;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  lastLogin?: string;
  status: 'active' | 'blocked';
  createdAt: string;
}

// Content types
export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl?: string;
  position: number;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
}

export interface Offer {
  id: string;
  title: string;
  type: 'cashback' | 'discount' | 'bonus';
  value: number;
  operatorId?: string;
  operatorName?: string;
  validFrom: string;
  validTo: string;
  status: 'active' | 'inactive';
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'flat' | 'percentage';
  value: number;
  minAmount: number;
  usedCount: number;
  usageLimit: number;
  validFrom: string;
  validTo: string;
  status: 'active' | 'inactive';
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  todayRecharges: number;
  todayRevenue: number;
  activeApis: number;
  failedToday: number;
  walletCredits: number;
  usersTrend: number;
  rechargeTrend: number;
  revenueTrend: number;
  apisTrend: number;
  failedTrend: number;
  walletTrend: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  transactions: number;
}

export interface DailyTransactionStat {
  day: string;
  success: number;
  failed: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopOperator {
  name: string;
  count: number;
  revenue: number;
}

export interface RecentTransaction {
  id: string;
  txnId: string;
  user: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  time: string;
}

// Auth types
export interface AdminLoginPayload {
  email: string;
  password: string;
}

export interface AuthState {
  token: string | null;
  admin: AdminUser | null;
  isAuthenticated: boolean;
}

// Pagination
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// API Log
export interface ApiLog {
  id: string;
  apiName: string;
  txnId: string;
  status: 'success' | 'failed' | 'pending';
  responseTime: number;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
  createdAt: string;
}

// Fund Order Report
export interface FundOrderReport {
  id: string;
  outlet: string;
  txnId: string;
  bankAccountHolder: string;
  transferMode: string;
  upiId?: string;
  mobileNo: string;
  cardNumber?: string;
  requestDate: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  remark?: string;
  approveDate?: string;
  approvedBy?: string;
}

// API Switching
export interface ApiSwitchRule {
  operatorId: string;
  operatorName: string;
  defaultApiId: string;
  circleOverrides: Record<string, string>;
}

export interface CircleSwitchRule {
  circle: string;
  operatorId: string;
  apiId: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

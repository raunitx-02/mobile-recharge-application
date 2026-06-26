export const CIRCLES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chennai', 'Delhi', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Karnataka', 'Kerala',
  'Kolkata', 'Madhya Pradesh', 'Maharashtra', 'Mumbai', 'North East',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'UP East', 'UP West',
  'West Bengal',
];

export const OPERATOR_TYPES = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'postpaid', label: 'Postpaid' },
  { value: 'dth', label: 'DTH' },
  { value: 'bbps', label: 'BBPS' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'gas', label: 'Gas' },
  { value: 'broadband', label: 'Broadband' },
];

export const TRANSACTION_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'processing', label: 'Processing' },
];

export const USER_STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'blocked', label: 'Blocked' },
];

export const FUND_REQUEST_STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export const COMMISSION_TYPES = [
  { value: 'flat', label: 'Flat (₹)' },
  { value: 'percentage', label: 'Percentage (%)' },
];

export const API_TYPES = [
  { value: 'recharge', label: 'Recharge' },
  { value: 'bbps', label: 'BBPS' },
];

export const ROUTE_TYPES = [
  { value: 'internal', label: 'Internal' },
  { value: 'external', label: 'External' },
];

export const SMS_PROVIDERS = [
  { value: 'textlocal', label: 'Text Local' },
  { value: 'msg91', label: 'MSG91' },
  { value: 'twilio', label: 'Twilio' },
  { value: 'aws_sns', label: 'AWS SNS' },
];

export const WHATSAPP_PROVIDERS = [
  { value: 'interakt', label: 'Interakt' },
  { value: 'wati', label: 'Wati' },
  { value: 'meta', label: 'Meta (WhatsApp Business)' },
];

export const EMAIL_PROVIDERS = [
  { value: 'sendgrid', label: 'SendGrid' },
  { value: 'smtp', label: 'SMTP' },
  { value: 'mailgun', label: 'Mailgun' },
];

export const PERMISSIONS_MATRIX = [
  { category: 'Dashboard', actions: ['read'] },
  { category: 'Users', actions: ['read', 'write', 'block'] },
  { category: 'Wallet', actions: ['credit', 'debit'] },
  { category: 'Operators', actions: ['read', 'write'] },
  { category: 'Plans', actions: ['read', 'write'] },
  { category: 'API', actions: ['read', 'write', 'switch'] },
  { category: 'Reports', actions: ['read', 'export'] },
  { category: 'Commission', actions: ['read', 'write'] },
  { category: 'Content', actions: ['read', 'write'] },
  { category: 'RBAC', actions: ['read', 'write'] },
];

export const PLAN_TYPES = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'data', label: 'Data' },
  { value: 'sms', label: 'SMS' },
  { value: 'voice', label: 'Voice' },
  { value: 'combo', label: 'Combo' },
];

export const PAGE_SIZES = [10, 25, 50, 100];

export const COLORS = {
  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF3B30',
  primary: '#007AFF',
  purple: '#AF52DE',
  orange: '#FF6B00',
};

/**
 * KwikAPI v3.0.1 — BBPS Bill Payment + Recharge Service
 *
 * Developed by: YOFLIC India Private Limited
 * Documentation: https://docs.kwikapi.com
 * GitHub: https://github.com/yoflic/KwikAPI-India
 *
 * UAT:        https://uat.kwikapi.com
 * Production: https://www.kwikapi.com
 *
 * Authentication: `api_key` in POST body or GET query param
 *
 * Your API Key: Get from kwikapi.com → Settings → API Credentials
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.KWIKAPI_BASE_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://www.kwikapi.com'
    : 'https://uat.kwikapi.com');

const API_KEY = process.env.KWIKAPI_API_KEY || '';

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────────────────────────

const kwikPost = async (endpoint, data = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await axios.post(url, { api_key: API_KEY, ...data }, {
    timeout: 20000,
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  });
  return response.data;
};

const kwikGet = async (endpoint, params = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await axios.get(url, {
    params: { api_key: API_KEY, ...params },
    timeout: 15000,
    headers: { 'Accept': 'application/json' },
  });
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Service Category List (BBPS categories)
// Endpoint: POST /api/v2/Service-Category-List.php
// Rate Limit: 10/day — call once at startup, cache locally
// ─────────────────────────────────────────────────────────────────────────────

async function getServiceCategories() {
  try {
    const data = await kwikPost('/api/v2/Service-Category-List.php');
    return {
      success: data.success || data.status === 'SUCCESS',
      categories: data.categories || [],
      total: data.total || 0,
    };
  } catch (err) {
    logger.error('KwikAPI getServiceCategories error', err.message);
    return { success: false, categories: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Biller List — all operators for a service
// Endpoint: GET /api/v2/operator_codes.php
// Rate Limit: 20/day — cache and refresh weekly
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} service - e.g. 'Prepaid', 'DTH', 'Electricity', 'Water', 'Gas', 'Broadband'
 */
async function getBillerList(service = '') {
  try {
    const data = await kwikGet('/api/v2/operator_codes.php', {
      ...(service ? { service } : {}),
    });
    return {
      success: data.status === 'SUCCESS',
      billers: data.response || [],
    };
  } catch (err) {
    logger.error('KwikAPI getBillerList error', { err: err.message, service });
    return { success: false, billers: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Biller Details — get required fields for a specific biller
// Endpoint: POST /api/v2/operatorFetch.php
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string|number} opid - Operator ID (or multiple separated by #)
 */
async function getBillerDetails(opid) {
  try {
    const data = await kwikPost('/api/v2/operatorFetch.php', { opid: String(opid) });
    return {
      success: data.success || data.STATUS === 'SUCCESS',
      operator_name: data.operator_name,
      operator_id: data.operator_id,
      service_type: data.service_type,
      bill_fetch: data.bill_fetch === 'YES',
      bbps_enabled: data.bbps_enabled === 'YES',
      amount_min: data.amount_minimum,
      amount_max: data.amount_maximum,
      parameters: data.parameters || [],
      raw: data,
    };
  } catch (err) {
    logger.error('KwikAPI getBillerDetails error', { err: err.message, opid });
    return { success: false };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Circle Codes (for mobile operator detection)
// Endpoint: GET /api/v2/circle_codes.php
// Rate Limit: 2/day — cache indefinitely
// ─────────────────────────────────────────────────────────────────────────────

async function getCircleCodes() {
  try {
    const data = await kwikGet('/api/v2/circle_codes.php');
    return { success: true, circles: data.response || [] };
  } catch (err) {
    logger.error('KwikAPI getCircleCodes error', err.message);
    return { success: false, circles: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Bill Fetch — get outstanding bill from biller
// Endpoint: GET /api/v2/bills/validation.php
// Use ONLY when biller's bill_fetch = 'YES'
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string} params.number      - Consumer/account/mobile number
 * @param {number} params.opid        - Operator ID from getBillerList
 * @param {string} params.mobile      - Customer mobile for SMS
 * @param {string} [params.opt1]      - Optional operator-specific field 1
 * @param {string} [params.opt2]      - Optional operator-specific field 2
 */
async function fetchBill({ number, opid, mobile, opt1, opt2, opt3 }) {
  const order_id = uuidv4().replace(/-/g, '').slice(0, 20);
  try {
    const data = await kwikGet('/api/v2/bills/validation.php', {
      number,
      opid,
      order_id,
      mobile,
      ...(opt1 ? { opt1 } : {}),
      ...(opt2 ? { opt2 } : {}),
      ...(opt3 ? { opt3 } : {}),
    });

    if (data.status !== 'SUCCESS') {
      return { success: false, message: data.message || 'Bill fetch failed' };
    }

    return {
      success:       true,
      orderId:       order_id,
      provider:      data.provider,
      customerName:  data.customer_name,
      dueAmount:     parseFloat(data.due_amount || '0'),
      dueDate:       data.due_date || '',
      billPeriod:    data.bill_period || '',
      consumerNo:    number,
      extraInfo:     data.additional_info || '',
      raw:           data,
    };
  } catch (err) {
    logger.error('KwikAPI fetchBill error', { err: err.message, number, opid });
    return { success: false, message: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Wallet Balance
// Endpoint: GET /api/v2/balance.php (or similar)
// ─────────────────────────────────────────────────────────────────────────────

async function getWalletBalance() {
  try {
    const data = await kwikGet('/api/v2/balance.php');
    return {
      success: true,
      balance: parseFloat(data.balance || data.wallet_balance || '0'),
      raw:     data,
    };
  } catch (err) {
    logger.error('KwikAPI getWalletBalance error', err.message);
    return { success: false, balance: 0 };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Transaction Status
// Endpoint: POST /api/v2/status.php (standard pattern)
// ─────────────────────────────────────────────────────────────────────────────

async function checkTransactionStatus(orderId) {
  try {
    const data = await kwikPost('/api/v2/status.php', { order_id: orderId });
    return {
      status:      normalizeStatus(data),
      operatorRef: data.operator_id || data.live_id || data.txn_id || null,
      message:     data.message || '',
      raw:         data,
    };
  } catch (err) {
    logger.error('KwikAPI checkTransactionStatus error', { err: err.message, orderId });
    return { status: 'unknown', message: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Operator & Circle Detect from Mobile Number
// Endpoint: GET /api/v2/detect_operator.php (or detect.php)
// ─────────────────────────────────────────────────────────────────────────────

async function detectOperatorAndCircle(mobile) {
  try {
    const data = await kwikGet('/api/v2/detect_operator.php', {
      mobile,
      number: mobile, // some versions use 'number'
    });
    if (data.status !== 'SUCCESS' && !data.operator_name) {
      return { success: false, operator: '', circle: '' };
    }
    return {
      success:     true,
      operator:    data.operator_name || data.operator || '',
      operatorId:  data.operator_id   || '',
      circle:      data.circle_name   || data.circle || '',
      circleCode:  data.circle_code   || '',
      raw:         data,
    };
  } catch (err) {
    logger.error('KwikAPI detectOperator error', { err: err.message, mobile });
    return { success: false, operator: '', circle: '' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. Mobile Recharge Plans
// Endpoint: GET /api/v2/plans.php
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {number|string} opid    - Operator ID
 * @param {string}        circle  - Circle code (from getCircleCodes)
 */
async function getMobileRechargePlans(opid, circle_code) {
  try {
    const data = await kwikGet('/api/v2/recharge_plans.php', {
      opid,
      circle_code,
      mobile: '9999999999', // required dummy mobile param
    });
    const plans = data.plans || data.response || data.data || [];
    return { success: plans.length > 0, plans };
  } catch (err) {
    logger.error('KwikAPI getMobileRechargePlans error', { err: err.message, opid, circle_code });
    return { success: false, plans: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. DTH Recharge Plans
// Endpoint: GET /api/v2/dth_plans.php
// ─────────────────────────────────────────────────────────────────────────────

async function getDthPlans(opid) {
  try {
    const data = await kwikGet('/api/v2/dth_plans.php', { opid });
    return { success: true, plans: data.plans || data.response || [] };
  } catch (err) {
    logger.error('KwikAPI getDthPlans error', { err: err.message, opid });
    return { success: false, plans: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 13. Prepaid / DTH Recharge — THE MAIN PAYMENT API
// Endpoint: POST /api/v2/recharge.php
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string} params.number   - 10-digit mobile or subscriber ID
 * @param {number} params.opid     - Operator ID
 * @param {number} params.amount   - Amount in INR
 * @param {string} params.mobile   - Customer mobile (for notifications)
 * @param {string} [params.circle] - Circle code (for prepaid)
 */
async function doPrepaidRecharge({ number, opid, amount, mobile, circle }) {
  const order_id = uuidv4().replace(/-/g, '').slice(0, 20);
  try {
    const data = await kwikPost('/api/v2/recharge.php', {
      number,
      opid,
      amount,
      mobile,
      order_id,
      ...(circle ? { circle } : {}),
    });

    const status = normalizeStatus(data);
    logger.info('KwikAPI doPrepaidRecharge', { order_id, number, opid, amount, status });

    return {
      success:     status === 'success',
      pending:     status === 'pending',
      failed:      status === 'failed',
      status,
      orderId:     order_id,
      operatorRef: data.operator_id || data.live_id || data.txn_id || null,
      message:     data.message || '',
      balance:     parseFloat(data.balance || '0'),
      raw:         data,
    };
  } catch (err) {
    logger.error('KwikAPI doPrepaidRecharge error', { err: err.message, number, opid, amount });
    return {
      success: false, pending: false, failed: true,
      status: 'failed', message: err.message, orderId: order_id,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14. Utility Payments (BBPS) — electricity, water, gas, etc.
// Endpoint: POST /api/v2/bbps/pay.php
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string} params.number     - Consumer/account number
 * @param {number} params.opid       - Operator ID from getBillerList
 * @param {number} params.amount     - Amount in INR
 * @param {string} params.mobile     - Customer mobile (for notifications)
 * @param {string} [params.opt1]     - Additional field 1 (if required by biller)
 * @param {string} [params.opt2]     - Additional field 2
 * @param {string} [params.fetchRef] - Bill fetch order_id (if bill was pre-fetched)
 */
async function payBbps({ number, opid, amount, mobile, opt1, opt2, opt3, fetchRef }) {
  const order_id = uuidv4().replace(/-/g, '').slice(0, 20);
  try {
    const data = await kwikPost('/api/v2/bbps/pay.php', {
      number,
      opid,
      amount,
      mobile,
      order_id,
      ...(opt1     ? { opt1 }     : {}),
      ...(opt2     ? { opt2 }     : {}),
      ...(opt3     ? { opt3 }     : {}),
      ...(fetchRef ? { fetch_ref: fetchRef } : {}),
    });

    const status = normalizeStatus(data);
    logger.info('KwikAPI payBbps', { order_id, number, opid, amount, status });

    return {
      success:     status === 'success',
      pending:     status === 'pending',
      failed:      status === 'failed',
      status,
      orderId:     order_id,
      operatorRef: data.operator_id || data.live_id || data.txn_id || null,
      message:     data.message || '',
      balance:     parseFloat(data.balance || '0'),
      raw:         data,
    };
  } catch (err) {
    logger.error('KwikAPI payBbps error', { err: err.message, number, opid, amount });
    return {
      success: false, pending: false, failed: true,
      status: 'failed', message: err.message, orderId: order_id,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalize status strings → 'success' | 'pending' | 'failed'
// ─────────────────────────────────────────────────────────────────────────────

function normalizeStatus(data) {
  const raw = (
    data?.status  ||
    data?.STATUS  ||
    data?.txn_status ||
    ''
  ).toString().toUpperCase().trim();

  if (['SUCCESS', 'SUCCESSFUL', 'DONE', '1'].includes(raw)) return 'success';
  if (['PENDING', 'PROCESSING', 'INPROCESS', 'QUEUED', '2'].includes(raw)) return 'pending';
  if (['FAILED', 'FAILURE', 'FAIL', 'ERROR', '0'].includes(raw)) return 'failed';
  return 'pending';
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  // Fetching APIs
  getServiceCategories,
  getBillerList,
  getBillerDetails,
  getCircleCodes,
  fetchBill,
  getWalletBalance,
  checkTransactionStatus,
  detectOperatorAndCircle,
  getMobileRechargePlans,
  getDthPlans,

  // Payment APIs
  doPrepaidRecharge,
  payBbps,

  // Helpers
  normalizeStatus,
};

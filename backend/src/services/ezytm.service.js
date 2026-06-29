/**
 * Ezytm / Robotic Exchange — LAPU-based Recharge Service
 *
 * Platform:  https://roboticexchange.in
 * Member ID: 4726 (Akash Tyagi — Bluz Marketing Service India Pvt Ltd)
 *
 * HOW IT WORKS:
 * Robotic Exchange is a LAPU (Local Area Processing Unit) aggregator.
 * Your Lapu numbers (physical SIMs in their servers) are used to process
 * recharges. You must have wallet balance > 0 on the platform.
 *
 * API Format: GET requests with query parameters
 * Authentication: member_id + api_password per request
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL     = process.env.EZYTM_BASE_URL     || 'https://roboticexchange.in';
const MEMBER_ID    = process.env.EZYTM_MEMBER_ID    || '4726';
const API_PASSWORD = process.env.EZYTM_API_PASSWORD || '';
const MOBILE_NO    = process.env.EZYTM_MOBILE_NO    || '';  // Your registered mobile on platform

// Operator codes as used by Ezytm/Robotic Exchange
const OPERATOR_CODE_MAP = {
  // Mobile operators
  JIO:            'Jio',
  AIRTEL:         'Airtel',
  VI:             'Vi',
  BSNL:           'Bsnl',
  // DTH operators
  TATA_PLAY:      'TataPlay',
  DISH_TV:        'DishTv',
  AIRTEL_DTH:     'AirtelDth',
  SUN_DIRECT:     'SunDirect',
  D2H:            'D2H',
  VIDEOCON_D2H:   'VideoconD2H',
};

// ─────────────────────────────────────────────────────────────────────────────
// HTTP helper
// ─────────────────────────────────────────────────────────────────────────────

const ezytmGet = async (endpoint, params = {}) => {
  const url = `${BASE_URL}${endpoint}`;
  const response = await axios.get(url, {
    params: {
      member_id:    MEMBER_ID,
      api_password: API_PASSWORD,
      ...params,
    },
    timeout: 15000,
    headers: { 'Accept': 'application/json' },
  });
  return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Check account balance on Ezytm platform
// ─────────────────────────────────────────────────────────────────────────────

async function checkPlatformBalance() {
  try {
    const data = await ezytmGet('/api/CheckBalance', {
      mobile_no: MOBILE_NO,
    });
    return {
      success: true,
      balance: data?.balance ?? data?.Balance ?? 0,
      raw: data,
    };
  } catch (err) {
    logger.error('Ezytm checkBalance error', err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Do Recharge — Mobile Prepaid / Postpaid / DTH
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string} params.mobile       - 10-digit customer mobile / account number
 * @param {string} params.operatorCode - e.g. 'JIO', 'AIRTEL', 'TATA_PLAY'
 * @param {number} params.amount       - recharge amount in INR
 * @param {string} params.type         - 'prepaid' | 'postpaid' | 'dth'
 * @param {string} params.refId        - unique reference ID from your system
 */
async function doRecharge({ mobile, operatorCode, amount, type, refId }) {
  const lapuOperator = OPERATOR_CODE_MAP[operatorCode?.toUpperCase()] || operatorCode;
  const transactionRef = refId || uuidv4().replace(/-/g, '').slice(0, 16);

  try {
    const data = await ezytmGet('/api/DoRecharge', {
      mobile_no:   MOBILE_NO,
      number:      mobile,
      amount:      amount,
      operator:    lapuOperator,
      type:        type === 'dth' ? 'DTH' : type === 'postpaid' ? 'Postpaid' : 'Prepaid',
      reference_id: transactionRef,
    });

    logger.info('Ezytm doRecharge response', { data, mobile, amount, operatorCode });

    // Normalize response
    const status = normalizeStatus(data);
    return {
      success: status === 'success',
      pending: status === 'pending',
      failed:  status === 'failed',
      status,
      operatorRef:    data?.operator_txn_id || data?.OperatorRef || data?.live_id || null,
      message:        data?.message || data?.Message || data?.msg || '',
      raw:            data,
      internalRef:    transactionRef,
    };
  } catch (err) {
    logger.error('Ezytm doRecharge error', { err: err.message, mobile, amount, operatorCode });
    return {
      success: false,
      pending: false,
      failed:  true,
      status:  'failed',
      message: err.message,
      internalRef: transactionRef,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Check Recharge Status
// ─────────────────────────────────────────────────────────────────────────────

async function checkStatus(referenceId) {
  try {
    const data = await ezytmGet('/api/CheckStatus', {
      mobile_no:    MOBILE_NO,
      reference_id: referenceId,
    });

    return {
      status:      normalizeStatus(data),
      operatorRef: data?.operator_txn_id || data?.live_id || null,
      message:     data?.message || data?.msg || '',
      raw:         data,
    };
  } catch (err) {
    logger.error('Ezytm checkStatus error', { err: err.message, referenceId });
    return { status: 'unknown', message: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Get Operator Plan List (for plan browser)
// ─────────────────────────────────────────────────────────────────────────────

async function getPlans(operatorCode, circle) {
  const lapuOperator = OPERATOR_CODE_MAP[operatorCode?.toUpperCase()] || operatorCode;
  try {
    const data = await ezytmGet('/api/GetPlans', {
      mobile_no: MOBILE_NO,
      operator:  lapuOperator,
      circle:    circle || 'Delhi',
    });

    const plans = Array.isArray(data?.plans) ? data.plans :
                  Array.isArray(data?.Plans) ? data.Plans :
                  Array.isArray(data)         ? data       : [];

    return { success: true, plans };
  } catch (err) {
    logger.error('Ezytm getPlans error', { err: err.message, operatorCode, circle });
    return { success: false, plans: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Detect Operator from Mobile Number
// ─────────────────────────────────────────────────────────────────────────────

async function detectOperator(mobile) {
  try {
    const data = await ezytmGet('/api/DetectOperator', {
      mobile_no: MOBILE_NO,
      number:    mobile,
    });

    return {
      success:  true,
      operator: data?.operator || data?.Operator || '',
      circle:   data?.circle   || data?.Circle   || '',
      raw:      data,
    };
  } catch (err) {
    logger.error('Ezytm detectOperator error', { err: err.message, mobile });
    // Fallback: prefix-based detection
    return { success: false, operator: localDetectOperator(mobile), circle: 'Delhi' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Local prefix-based operator detection (offline fallback)
// ─────────────────────────────────────────────────────────────────────────────

function localDetectOperator(mobile) {
  if (!mobile || mobile.length < 4) return 'JIO';
  const p2 = mobile.slice(0, 2);
  const jio    = ['60','61','62','63','64','65','66','68','69','70','73','74','79'];
  const airtel = ['72','78','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','98','99'];
  const vi     = ['75','76','77','96','97'];
  if (jio.includes(p2))    return 'JIO';
  if (airtel.includes(p2)) return 'AIRTEL';
  if (vi.includes(p2))     return 'VI';
  return 'JIO';
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalize various status strings from Ezytm into our system status
// ─────────────────────────────────────────────────────────────────────────────

function normalizeStatus(data) {
  const raw = (
    data?.status  ||
    data?.Status  ||
    data?.txn_status ||
    data?.TxnStatus ||
    ''
  ).toString().toLowerCase().trim();

  if (['success', 'successful', '1', 'true', 'done'].includes(raw))     return 'success';
  if (['pending', 'processing', 'inprocess', '2', 'queued'].includes(raw)) return 'pending';
  if (['failed', 'failure', 'fail', '0', 'false', 'error'].includes(raw)) return 'failed';
  return 'pending'; // default to pending (will be resolved by status check)
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  checkPlatformBalance,
  doRecharge,
  checkStatus,
  getPlans,
  detectOperator,
  localDetectOperator,
  normalizeStatus,
  OPERATOR_CODE_MAP,
};

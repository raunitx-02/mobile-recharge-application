/**
 * PayU Payment Gateway Service
 *
 * Merchant: Bluz Marketing Service India Pvt Ltd
 * MID: 12906764  |  Mode: LIVE
 * Dashboard: https://payu.in → Developer → API Keys
 *
 * Key:        TXvPg7
 * Salt 32bit: 6MX0j4DIdGq0GusIalftzPlFZAwDICtE
 *
 * Payment Hash Formula (SHA-512):
 *   key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
 *
 * Reverse Hash (for verify, SHA-512):
 *   salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */

const crypto = require('crypto');
const axios  = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const KEY           = process.env.PAYU_MERCHANT_KEY   || 'TXvPg7';
const SALT          = process.env.PAYU_SALT           || '6MX0j4DIdGq0GusIalftzPlFZAwDICtE';
const MID           = process.env.PAYU_MID            || '12906764';
const CLIENT_ID     = process.env.PAYU_CLIENT_ID      || '';
const CLIENT_SECRET = process.env.PAYU_CLIENT_SECRET  || '';
const BASE_URL      = process.env.PAYU_BASE_URL       || 'https://secure.payu.in';
const MODE          = process.env.PAYU_MODE           || 'LIVE';

const PAYMENT_URL    = MODE === 'LIVE' ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';
const VERIFY_API_URL = MODE === 'LIVE' ? 'https://info.payu.in/merchant/postservice.php?form=2' : 'https://test.payu.in/merchant/postservice.php?form=2';

// ─────────────────────────────────────────────────────────────────────────────
// SHA-512 hash helper
// ─────────────────────────────────────────────────────────────────────────────

function sha512(str) {
  return crypto.createHash('sha512').update(str).digest('hex');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Generate Payment Hash
//    Used by the React Native frontend to open PayU checkout
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} params
 * @param {string} params.txnid       - Unique transaction ID from your system
 * @param {number} params.amount      - Amount in INR (e.g. 299.00)
 * @param {string} params.productinfo - Short description (e.g. "Jio Prepaid Recharge")
 * @param {string} params.firstname   - Customer first name
 * @param {string} params.email       - Customer email
 * @param {string} [params.phone]     - Customer phone
 * @param {string} [params.udf1]      - Custom field 1 (e.g. user_id)
 * @param {string} [params.udf2]      - Custom field 2 (e.g. recharge_type)
 * @param {string} [params.udf3]      - Custom field 3
 * @param {string} [params.udf4]      - Custom field 4
 * @param {string} [params.udf5]      - Custom field 5
 * @param {string} params.surl        - Success redirect URL
 * @param {string} params.furl        - Failure redirect URL
 */
function generatePaymentParams({
  txnid, amount, productinfo, firstname, email, phone = '',
  udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
  surl, furl,
}) {
  const amtStr = parseFloat(amount).toFixed(2);

  // PayU hash string: key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||salt
  const hashStr = `${KEY}|${txnid}|${amtStr}|${productinfo}|${firstname}|${email}|${udf1}|${udf2}|${udf3}|${udf4}|${udf5}||||||${SALT}`;
  const hash    = sha512(hashStr);

  return {
    // These go directly into the PayU payment form / SDK
    key:         KEY,
    txnid,
    amount:      amtStr,
    productinfo,
    firstname,
    email,
    phone,
    udf1, udf2, udf3, udf4, udf5,
    surl,
    furl,
    hash,
    paymentUrl:  PAYMENT_URL,
    mid:         MID,
    mode:        MODE,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Create Payment Order
//    Backend creates the full params — frontend renders the PayU form/SDK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} user        - { id, name, email, phone }
 * @param {number} amount      - Amount in INR
 * @param {string} purpose     - What this payment is for (e.g. "Jio Prepaid ₹299")
 * @param {string} rechargeRef - Internal recharge/transaction reference
 */
function createPaymentOrder(user, amount, purpose, rechargeRef) {
  const txnid = `AP${Date.now()}${uuidv4().replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  const surl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`;
  const furl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure`;

  const params = generatePaymentParams({
    txnid,
    amount,
    productinfo: purpose.slice(0, 100),
    firstname:   (user.name || 'Customer').split(' ')[0],
    email:       user.email || `${user.phone}@optionspay.in`,
    phone:       user.phone || '',
    udf1:        user.id     || '',   // user_id — stored for reconciliation
    udf2:        rechargeRef || '',   // internal recharge ref
    udf3:        '',
    udf4:        '',
    udf5:        '',
    surl,
    furl,
  });

  logger.info('PayU payment order created', { txnid, amount, userId: user.id });

  return {
    txnid,
    params,   // Send ALL these to the mobile app — it opens PayU SDK with them
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Verify PayU Response Hash (called on payment callback / webhook)
//    Prevents tampering — always verify before crediting wallet or doing recharge
// ─────────────────────────────────────────────────────────────────────────────

/**
 * PayU reverse hash for verification:
 *   salt|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key
 */
function verifyPaymentHash(payuResponse) {
  const {
    key, txnid, amount, productinfo, firstname, email,
    udf1 = '', udf2 = '', udf3 = '', udf4 = '', udf5 = '',
    status, hash: receivedHash,
  } = payuResponse;

  const reverseHashStr = `${SALT}|${status}||||||${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
  const computedHash   = sha512(reverseHashStr);

  const isValid = computedHash === receivedHash;

  if (!isValid) {
    logger.warn('PayU hash mismatch — possible tampering!', { txnid, status });
  }

  return {
    isValid,
    status:      (status || '').toLowerCase(),
    txnid,
    amount:      parseFloat(amount),
    userId:      udf1,
    rechargeRef: udf2,
    raw:         payuResponse,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Verify Transaction via PayU API (server-to-server check)
//    Use this when you need to double-confirm payment status from PayU's side
// ─────────────────────────────────────────────────────────────────────────────

async function verifyTransactionFromPayU(txnid) {
  try {
    const commandHash = sha512(`${KEY}|verify_payment|${txnid}|${SALT}`);

    const response = await axios.post(VERIFY_API_URL, {
      key,
      command:   'verify_payment',
      var1:      txnid,
      hash:      commandHash,
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    });

    const data = response.data;
    logger.info('PayU verify_payment response', { txnid, data });

    const txnDetails = data?.transaction_details?.[txnid];

    return {
      success:  txnDetails?.status === 'success',
      status:   txnDetails?.status || 'unknown',
      amount:   parseFloat(txnDetails?.amt || '0'),
      mode:     txnDetails?.mode,
      bankRef:  txnDetails?.bank_ref_num,
      raw:      data,
    };
  } catch (err) {
    logger.error('PayU verifyTransaction error', { err: err.message, txnid });
    return { success: false, status: 'unknown', message: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Initiate Refund via PayU API
// ─────────────────────────────────────────────────────────────────────────────

async function initiateRefund({ txnid, refundAmount, mihpayid }) {
  try {
    const commandHash = sha512(`${KEY}|cancel_refund_transaction|${mihpayid}|${refundAmount}|${SALT}`);

    const response = await axios.post(VERIFY_API_URL, {
      key:     KEY,
      command: 'cancel_refund_transaction',
      var1:    mihpayid,       // PayU's mihpayid (not your txnid)
      var2:    String(refundAmount),
      hash:    commandHash,
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    });

    logger.info('PayU refund initiated', { txnid, refundAmount, mihpayid, data: response.data });

    return {
      success: response.data?.status === '0' || response.data?.result?.[0]?.status === 'success',
      raw:     response.data,
    };
  } catch (err) {
    logger.error('PayU refund error', { err: err.message, txnid });
    return { success: false, message: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  generatePaymentParams,
  createPaymentOrder,
  verifyPaymentHash,
  verifyTransactionFromPayU,
  initiateRefund,
  PAYMENT_URL,
  KEY,
  MID,
  MODE,
};

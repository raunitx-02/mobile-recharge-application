const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');
const { decrypt } = require('../utils/encryption');
const { ApiLog } = require('../models');

async function callProviderAPI(apiConfig, operatorCode, accountNo, amount, transactionId) {
  // 1. Decrypt API credentials
  let credentials = {};
  try {
    const decryptedJson = decrypt(apiConfig.credentials_encrypted);
    credentials = JSON.parse(decryptedJson);
  } catch (err) {
    logger.error(`Failed to decrypt credentials for API config ${apiConfig.name}:`, err.message);
    throw new Error('API provider configuration decryption failed');
  }

  // 2. Prepare payload and config based on provider type
  const providerType = apiConfig.type;
  const baseUrl = apiConfig.base_url;

  let requestUrl = baseUrl;
  let requestMethod = 'POST';
  let requestHeaders = { 'Content-Type': 'application/json' };
  let requestData = {};

  const uniqueRefId = transactionId || crypto.randomBytes(8).toString('hex');

  if (providerType === 'recharge1') {
    // Recharge1 format: POST params in request body or url
    requestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
    requestData = new URLSearchParams({
      member_id: credentials.member_id || '',
      api_password: credentials.api_password || '',
      mobile: accountNo,
      operator_code: operatorCode,
      amount: amount.toString(),
      referenceid: uniqueRefId
    });
  } else if (providerType === 'pay2all') {
    // Pay2All format: REST with token header
    requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${credentials.api_key}`
    };
    requestData = {
      number: accountNo,
      provider_id: operatorCode,
      amount: amount,
      client_id: uniqueRefId
    };
  } else if (providerType === 'billbox' || providerType === 'generic_rest') {
    // Generic REST format
    requestHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': credentials.api_key || '',
      'Authorization': credentials.bearer_token ? `Bearer ${credentials.bearer_token}` : undefined
    };
    requestData = {
      account_number: accountNo,
      biller_id: operatorCode,
      amount: amount,
      ref_id: uniqueRefId
    };
  }

  // Filter undefined headers
  Object.keys(requestHeaders).forEach(key => requestHeaders[key] === undefined && delete requestHeaders[key]);

  // 3. Fire API HTTP call
  const startTime = Date.now();
  let statusCode = 200;
  let responseData = null;
  let apiStatus = 'success';

  try {
    logger.info(`Initiating external API call to ${apiConfig.name} (${providerType}) for transaction: ${transactionId}`);
    
    // In development mode, mock actual external calls to avoid burning actual money
    if (process.env.NODE_ENV === 'development' || credentials.mock_api === true) {
      responseData = getMockResponse(providerType, uniqueRefId, amount);
      statusCode = 200;
      logger.info(`[MOCK PROVIDER API] Bypassed actual HTTP request. Returning simulated success.`);
    } else {
      const response = await axios({
        method: requestMethod,
        url: requestUrl,
        headers: requestHeaders,
        data: requestData,
        timeout: 25000 // 25s timeout limit
      });
      responseData = response.data;
      statusCode = response.status;
    }
  } catch (err) {
    apiStatus = err.code === 'ECONNABORTED' ? 'timeout' : 'failed';
    statusCode = err.response ? err.response.status : 500;
    responseData = err.response ? err.response.data : { error: err.message };
    logger.error(`External API call failed - Provider: ${apiConfig.name}, Code: ${statusCode}, Error: ${err.message}`);
  }

  const duration = Date.now() - startTime;
  
  // 4. Record ApiLog in background
  try {
    await ApiLog.create({
      api_config_id: apiConfig.id,
      transaction_id: transactionId,
      endpoint: requestUrl,
      request_payload: typeof requestData.toString === 'function' ? requestData.toString() : JSON.stringify(requestData),
      response_payload: typeof responseData === 'object' ? JSON.stringify(responseData) : responseData,
      status_code: statusCode,
      status: apiStatus
    });
  } catch (err) {
    logger.error('Failed to save ApiLog record:', err.message);
  }

  if (apiStatus !== 'success') {
    return {
      success: false,
      status: 'failed',
      message: 'Provider billing server is unreachable. Transaction aborted.',
      error: responseData
    };
  }

  // 5. Parse and normalize provider response
  return normalizeResponse(providerType, responseData);
}

function normalizeResponse(providerType, res) {
  if (providerType === 'recharge1') {
    // Recharge1 response parsing: Status field (1 = success, 2 = pending, 3 = failed)
    const status = parseInt(res.status);
    const liveId = res.operator_ref || res.live_id || null;
    const msg = res.message || '';
    
    if (status === 1) {
      return { success: true, status: 'success', liveId, message: msg };
    } else if (status === 2) {
      return { success: true, status: 'pending', liveId, message: msg };
    } else {
      return { success: false, status: 'failed', message: msg || 'Recharge failed from operator switch' };
    }
  } else if (providerType === 'pay2all') {
    // Pay2All: status string
    const status = res.status ? res.status.toLowerCase() : 'failed';
    const liveId = res.operator_ref || res.txn_id || null;
    
    if (status === 'success') {
      return { success: true, status: 'success', liveId, message: res.message || 'Success' };
    } else if (status === 'pending') {
      return { success: true, status: 'pending', liveId, message: res.message || 'Pending' };
    } else {
      return { success: false, status: 'failed', message: res.message || 'Recharge failed' };
    }
  } else {
    // default/generic format
    const status = res.status ? res.status.toLowerCase() : 'failed';
    const liveId = res.reference_no || res.live_id || null;

    if (status === 'success' || status === '1' || res.success === true) {
      return { success: true, status: 'success', liveId, message: res.message || 'Success' };
    } else if (status === 'pending' || status === '2') {
      return { success: true, status: 'pending', liveId, message: res.message || 'Processing' };
    } else {
      return { success: false, status: 'failed', message: res.message || 'Transaction rejected' };
    }
  }
}

function getMockResponse(providerType, refId, amount) {
  if (providerType === 'recharge1') {
    return {
      status: 1,
      operator_ref: `OPREF${Math.floor(100000 + Math.random() * 900000)}`,
      message: 'Recharge Processed Successfully',
      referenceid: refId
    };
  } else if (providerType === 'pay2all') {
    return {
      status: 'success',
      operator_ref: `REF${Math.floor(100000 + Math.random() * 900000)}`,
      txn_id: `TXN${Math.floor(1000000 + Math.random() * 9000000)}`,
      message: 'Transaction Success'
    };
  } else {
    return {
      success: true,
      status: 'success',
      reference_no: `GENREF${Math.floor(100000 + Math.random() * 900000)}`,
      message: 'Transaction Settled'
    };
  }
}

async function fetchBillerDetails(apiConfig, category) {
  // Stub for BBPS billers fetching from aggregator
  logger.info(`Fetching BBPS Billers for category: ${category} from API: ${apiConfig.name}`);
  // In a real application, calls actual aggregator API endpoint
  return [
    { id: 'biller_1', name: 'Maharashtra State Electricity Distribution', category },
    { id: 'biller_2', name: 'Tata Power Delhi', category }
  ];
}

async function fetchBill(apiConfig, billerId, accountNo) {
  // Stub for fetching live customer bill details from provider
  logger.info(`Fetching live bill details for Biller: ${billerId}, Account: ${accountNo} via ${apiConfig.name}`);
  return {
    customerName: 'Raunit Jha',
    billAmount: 450.00,
    dueDate: '2026-07-15',
    billNumber: `BILL${Math.floor(100000 + Math.random() * 900000)}`
  };
}

module.exports = {
  callProviderAPI,
  fetchBillerDetails,
  fetchBill
};

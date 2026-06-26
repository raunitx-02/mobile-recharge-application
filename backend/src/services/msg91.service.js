const axios = require('axios');
const logger = require('../utils/logger');

const MSG91_API_KEY = process.env.MSG91_API_KEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID || 'AETHER';
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

async function sendOTP(phone, otp) {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    logger.info(`[SMS OTP MOCK] Sent OTP ${otp} to phone ${phone}`);
    return { success: true, message: 'OTP sent successfully (Mocked)' };
  }

  if (!MSG91_API_KEY || !MSG91_TEMPLATE_ID) {
    logger.warn('MSG91_API_KEY or MSG91_TEMPLATE_ID is missing. Mocking SMS send.');
    return { success: true, message: 'OTP sent successfully (Mocked due to missing config)' };
  }

  try {
    const url = 'https://api.msg91.com/api/v5/otp';
    const params = {
      authkey: MSG91_API_KEY,
      template_id: MSG91_TEMPLATE_ID,
      mobile: `91${phone}`,
      otp: otp
    };

    const response = await axios.post(url, null, { params });
    
    if (response.data && response.data.type === 'success') {
      logger.info(`OTP ${otp} successfully sent to +91${phone} via MSG91`);
      return { success: true, raw: response.data };
    } else {
      logger.error('MSG91 returned an error response:', response.data);
      throw new Error(response.data.message || 'SMS delivery failed');
    }
  } catch (err) {
    logger.error(`Failed to send OTP SMS to +91${phone}:`, err.message);
    // Allow fail-safe mock fallback in non-production environments to avoid blocking testing
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`[SMS OTP MOCK-FALLBACK] Sent OTP ${otp} to phone ${phone}`);
      return { success: true, message: 'OTP sent (Fallback Mocked)' };
    }
    throw err;
  }
}

module.exports = {
  sendOTP
};

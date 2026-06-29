const axios = require('axios');
const logger = require('../utils/logger');

const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
const FAST2SMS_SENDER_ID = process.env.FAST2SMS_SENDER_ID || 'BMSIPL';
const FAST2SMS_OTP_ROUTE = process.env.FAST2SMS_OTP_ROUTE || 'otp'; // 'otp', 'dlt', 'dlt_manual'
const FAST2SMS_TEMPLATE_ID = process.env.FAST2SMS_TEMPLATE_ID; // Used for dlt/dlt_manual
const FAST2SMS_ENTITY_ID = process.env.FAST2SMS_ENTITY_ID; // Used for dlt_manual

/**
 * Send OTP via Fast2SMS
 * @param {string} phone 10-digit mobile number
 * @param {string} otp 6-digit OTP
 */
async function sendOTP(phone, otp) {
  // If in development/test, mock it by default unless FORCE_LIVE_SMS is true
  if (process.env.NODE_ENV === 'development' && !process.env.FORCE_LIVE_SMS) {
    logger.info(`[SMS OTP MOCK] Sent OTP ${otp} to phone ${phone}`);
    return { success: true, message: 'OTP sent successfully (Mocked in Dev)' };
  }

  if (!FAST2SMS_API_KEY) {
    logger.warn('FAST2SMS_API_KEY is missing. Mocking SMS send.');
    return { success: true, message: 'OTP sent successfully (Mocked due to missing config)' };
  }

  try {
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    // Base payload
    const data = {
      numbers: phone,
      route: FAST2SMS_OTP_ROUTE
    };

    if (FAST2SMS_OTP_ROUTE === 'dlt') {
      if (!FAST2SMS_TEMPLATE_ID) {
        logger.warn('FAST2SMS_TEMPLATE_ID is missing for DLT route. Falling back to default OTP route.');
        data.route = 'otp';
        data.variables_values = otp;
      } else {
        data.sender_id = FAST2SMS_SENDER_ID;
        data.message = FAST2SMS_TEMPLATE_ID; // Fast2SMS uses message parameter for Template ID on DLT route
        data.variables_values = otp;
      }
    } else if (FAST2SMS_OTP_ROUTE === 'dlt_manual') {
      if (!FAST2SMS_TEMPLATE_ID || !FAST2SMS_ENTITY_ID) {
        logger.warn('FAST2SMS_TEMPLATE_ID or FAST2SMS_ENTITY_ID missing for dlt_manual route. Falling back to default OTP route.');
        data.route = 'otp';
        data.variables_values = otp;
      } else {
        data.sender_id = FAST2SMS_SENDER_ID;
        data.template_id = FAST2SMS_TEMPLATE_ID;
        data.entity_id = FAST2SMS_ENTITY_ID;
        // In dlt_manual, 'message' needs the actual text containing the OTP
        data.message = `${otp} is your OTP for OptionsPay registration/login. Valid for 10 mins. Bluz Marketing Service India Pvt Ltd`;
      }
    } else {
      // Default: 'otp' route (Fast2SMS system default OTP template, sends from custom pool)
      data.route = 'otp';
      data.variables_values = otp;
    }

    logger.info(`Sending SMS via Fast2SMS to +91${phone} using route: ${data.route}`);

    const response = await axios.post(url, data, {
      headers: {
        'authorization': FAST2SMS_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.return === true) {
      logger.info(`OTP ${otp} successfully sent to +91${phone} via Fast2SMS`);
      return { success: true, raw: response.data };
    } else {
      logger.error('Fast2SMS returned an error response:', response.data);
      throw new Error(response.data.message || 'SMS delivery failed');
    }
  } catch (err) {
    logger.error(`Failed to send OTP SMS to +91${phone}:`, err.message);
    
    // Fail-safe fallback in development/staging to avoid blocking authentication tests
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

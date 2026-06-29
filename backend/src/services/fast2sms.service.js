const axios = require('axios');
const logger = require('../utils/logger');

const API_KEY = process.env.FAST2SMS_API_KEY;
const SENDER_ID = process.env.FAST2SMS_SENDER_ID || 'BMSIPL';
const TEMPLATE_ID = process.env.FAST2SMS_TEMPLATE_ID || '219124';

/**
 * Send OTP via Fast2SMS DLT route
 * Confirmed working payload:
 * { route:'dlt', sender_id:'BMSIPL', message:'<template_id>', variables_values:'<otp>', numbers:'<phone>' }
 */
async function sendOTP(phone, otp) {
  if (!API_KEY) {
    logger.warn('FAST2SMS_API_KEY missing — cannot send OTP');
    throw new Error('SMS service not configured');
  }

  const payload = {
    route: 'dlt',
    sender_id: SENDER_ID,
    message: TEMPLATE_ID,      // Fast2SMS uses 'message' field for template ID on DLT
    variables_values: String(otp),
    numbers: String(phone)
  };

  logger.info(`Sending OTP ${otp} to ${phone} via Fast2SMS DLT (template: ${TEMPLATE_ID})`);

  const response = await axios.post('https://www.fast2sms.com/dev/bulkV2', payload, {
    headers: {
      authorization: API_KEY,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  logger.info('Fast2SMS response:', JSON.stringify(response.data));

  if (response.data && response.data.return === true) {
    return { success: true, request_id: response.data.request_id };
  } else {
    throw new Error(
      (response.data.message || []).join(', ') || 'Fast2SMS: SMS delivery failed'
    );
  }
}

module.exports = { sendOTP };

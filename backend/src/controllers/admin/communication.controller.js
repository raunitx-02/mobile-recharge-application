const response = require('../../utils/response');

const getSmsConfig = async (req, res) => {
  return response.success(
    res,
    {
      provider: 'Fast2SMS',
      authkey: '[MASKED]',
      sender_id: process.env.FAST2SMS_SENDER_ID || 'BMSIPL',
      route: process.env.FAST2SMS_OTP_ROUTE || 'otp'
    },
    'SMS configuration retrieved'
  );
};

const updateSmsConfig = async (req, res) => {
  return response.success(res, null, 'SMS API configuration saved');
};

const getEmailConfig = async (req, res) => {
  return response.success(res, { provider: 'SendGrid', key: '[MASKED]', from_email: 'noreply@optionspay.in' }, 'Email configuration retrieved');
};

const updateEmailConfig = async (req, res) => {
  return response.success(res, null, 'Email API configuration saved');
};

const getGatewayConfig = async (req, res) => {
  return response.success(res, { provider: 'Razorpay', key_id: '[MASKED]' }, 'Gateway configuration retrieved');
};

const updateGatewayConfig = async (req, res) => {
  return response.success(res, null, 'Payment gateway configuration saved');
};

module.exports = {
  getSmsConfig,
  updateSmsConfig,
  getEmailConfig,
  updateEmailConfig,
  getGatewayConfig,
  updateGatewayConfig
};

const sgMail = require('@sendgrid/mail');
const logger = require('../utils/logger');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@aetherpay.in';
const SENDGRID_FROM_NAME = process.env.SENDGRID_FROM_NAME || 'AetherPay';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const emailTemplates = {
  welcome: (data) => ({
    subject: `Welcome to AetherPay, ${data.name}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #007AFF; text-align: center;">Welcome to AetherPay</h2>
        <p>Hi ${data.name},</p>
        <p>Thank you for choosing AetherPay, India's premium liquid glass mobile recharge and utility payment platform.</p>
        <p>Get started by topping up your wallet to enjoy instant utility payments with exciting commissions.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || '#'}" style="background-color: #007AFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 20px; font-weight: bold;">Launch Application</a>
        </div>
        <p>Best regards,<br/>The AetherPay Team</p>
      </div>
    `
  }),
  recharge_success: (data) => ({
    subject: `AetherPay: Recharge Successful - ₹${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #34C759; text-align: center;">Recharge Successful</h2>
        <p>Hi ${data.name},</p>
        <p>Your recharge request has been successfully processed.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Operator</td><td style="padding: 8px 0; text-align: right;">${data.operator}</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Account/Mobile</td><td style="padding: 8px 0; text-align: right;">${data.accountNo}</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Amount</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #34C759;">₹${data.amount}</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Transaction ID</td><td style="padding: 8px 0; text-align: right; font-size: 12px; color: #555;">${data.txnId}</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Reference ID</td><td style="padding: 8px 0; text-align: right; font-size: 12px; color: #555;">${data.liveId || 'Pending'}</td></tr>
        </table>
        <p>Best regards,<br/>The AetherPay Team</p>
      </div>
    `
  }),
  recharge_failed: (data) => ({
    subject: `AetherPay: Recharge Failed - ₹${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #FF3B30; text-align: center;">Recharge Failed</h2>
        <p>Hi ${data.name},</p>
        <p>We regret to inform you that your recharge request of ₹${data.amount} for ${data.operator} (${data.accountNo}) failed.</p>
        <p>The debited amount of <strong>₹${data.amount}</strong> has been refunded back to your AetherPay wallet balance immediately.</p>
        <p>Reason: ${data.reason || 'Operator billing server error'}</p>
        <p>Best regards,<br/>The AetherPay Team</p>
      </div>
    `
  }),
  wallet_credit: (data) => ({
    subject: `AetherPay: Wallet Credited - ₹${data.amount}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #34C759; text-align: center;">Wallet Credited</h2>
        <p>Hi ${data.name},</p>
        <p>Your AetherPay wallet has been credited with ₹${data.amount}.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Credit Type</td><td style="padding: 8px 0; text-align: right;">${data.creditType}</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Amount</td><td style="padding: 8px 0; text-align: right; font-weight: bold; color: #34C759;">₹${data.amount}</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">New Balance</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">₹${data.newBalance}</td></tr>
          <tr style="border-bottom: 1px solid #eee;"><td style="padding: 8px 0; font-weight: bold;">Reference</td><td style="padding: 8px 0; text-align: right; font-size: 12px; color: #555;">${data.reference}</td></tr>
        </table>
        <p>Best regards,<br/>The AetherPay Team</p>
      </div>
    `
  })
};

async function sendTransactionEmail(to, type, data) {
  if (!SENDGRID_API_KEY) {
    logger.info(`[EMAIL SG MOCK] Sending ${type} email to ${to} with data:`, data);
    return { success: true, message: 'Email sent (Mocked due to missing key)' };
  }

  const templateBuilder = emailTemplates[type];
  if (!templateBuilder) {
    logger.error(`Unknown email template type: ${type}`);
    return;
  }

  const { subject, html } = templateBuilder(data);

  try {
    const msg = {
      to,
      from: {
        email: SENDGRID_FROM_EMAIL,
        name: SENDGRID_FROM_NAME
      },
      subject,
      html
    };

    await sgMail.send(msg);
    logger.info(`Email of type ${type} successfully sent to ${to} via SendGrid`);
    return { success: true };
  } catch (err) {
    logger.error(`Failed to send SendGrid email to ${to}:`, err.message);
    if (err.response) {
      logger.error(JSON.stringify(err.response.body));
    }
  }
}

module.exports = {
  sendTransactionEmail
};

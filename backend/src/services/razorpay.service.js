const Razorpay = require('razorpay');
const crypto = require('crypto');
const logger = require('../utils/logger');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'mocksecretkey123';

let razorpay = null;

try {
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
  });
} catch (err) {
  logger.error('Razorpay initialization failed:', err);
}

async function createOrder(amount, userId) {
  // Amount in Razorpay is in paise (1 INR = 100 Paise)
  const amountInPaise = Math.round(amount * 100);
  
  if (RAZORPAY_KEY_ID.startsWith('rzp_test_mock')) {
    logger.info(`[RAZORPAY MOCK] Creating order for user ${userId} of amount ${amount}`);
    const mockOrderId = `order_mock_${crypto.randomBytes(8).toString('hex')}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${userId.slice(0, 8)}`,
      status: 'created'
    };
  }

  try {
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${userId.slice(0, 8)}`,
      notes: {
        userId: userId
      }
    };
    
    const order = await razorpay.orders.create(options);
    logger.info(`Razorpay order created successfully: ${order.id}`);
    return order;
  } catch (err) {
    logger.error('Razorpay order creation failed:', err.message);
    throw err;
  }
}

function verifyPaymentSignature(orderId, paymentId, signature) {
  if (orderId.startsWith('order_mock_')) {
    logger.info('[RAZORPAY MOCK] Bypassing payment signature verification (Dev Mode)');
    return true;
  }

  try {
    const generated_signature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(orderId + '|' + paymentId)
      .digest('hex');

    return generated_signature === signature;
  } catch (err) {
    logger.error('Razorpay signature verification exception:', err.message);
    return false;
  }
}

async function refundPayment(paymentId, amount) {
  const amountInPaise = amount ? Math.round(amount * 100) : undefined;
  
  if (paymentId.startsWith('pay_mock_')) {
    logger.info(`[RAZORPAY MOCK] Refunding payment ${paymentId} of amount ${amount}`);
    return { id: `rfnd_mock_${crypto.randomBytes(8).toString('hex')}`, status: 'processed' };
  }

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      ...(amountInPaise && { amount: amountInPaise })
    });
    logger.info(`Razorpay refund processed successfully: ${refund.id}`);
    return refund;
  } catch (err) {
    logger.error(`Razorpay refund failed for payment ${paymentId}:`, err.message);
    throw err;
  }
}

module.exports = {
  createOrder,
  verifyPaymentSignature,
  refundPayment
};

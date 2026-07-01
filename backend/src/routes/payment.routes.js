/**
 * PayU Webhook + Callback Routes
 *
 * PayU calls these URLs after payment is processed:
 *
 * surl (success): /api/payment/success   ← redirect after successful payment
 * furl (failure): /api/payment/failure   ← redirect after failed payment
 * webhook:        /api/payment/webhook   ← server-to-server notification (most reliable)
 *
 * Set Webhook URL in PayU Dashboard:
 *   payu.in → Developer → Webhooks → Add Webhook
 *   URL: https://api.optionspay.in/api/payment/webhook
 */

const express = require('express');
const router  = express.Router();
const payuService = require('../services/payu.service');
const logger  = require('../utils/logger');

let Transaction, User, WalletTransaction;
try {
  const models = require('../models');
  Transaction      = models.Transaction;
  User             = models.User;
  WalletTransaction = models.WalletTransaction;
} catch (e) {
  Transaction = null; User = null; WalletTransaction = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/webhook — PayU server-to-server notification
// Most reliable — always verify hash here
// ─────────────────────────────────────────────────────────────────────────────

router.post('/webhook', async (req, res) => {
  const body = req.body;
  logger.info('PayU webhook received', { txnid: body.txnid, status: body.status });

  // Always respond 200 immediately
  res.status(200).send('OK');

  const result = payuService.verifyPaymentHash(body);
  if (!result.isValid) {
    logger.error('PayU webhook hash invalid — IGNORING', { txnid: body.txnid });
    return;
  }

  await handlePaymentResult(result, body);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/success — PayU success redirect (user-facing)
// Also verify hash here — don't trust status alone
// ─────────────────────────────────────────────────────────────────────────────

router.post('/success', async (req, res) => {
  const body   = req.body;
  const result = payuService.verifyPaymentHash(body);

  if (!result.isValid) {
    logger.warn('PayU success callback hash mismatch', { txnid: body.txnid });
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failure?reason=hash_mismatch`);
  }

  await handlePaymentResult(result, body);

  // Deep-link back to app
  res.redirect(`${process.env.FRONTEND_URL}/payment/success?txnid=${body.txnid}&amount=${body.amount}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/payment/failure — PayU failure redirect
// ─────────────────────────────────────────────────────────────────────────────

router.post('/failure', async (req, res) => {
  const { txnid, error_Message, status } = req.body;
  logger.warn('PayU payment failure', { txnid, error_Message, status });

  if (Transaction) {
    try {
      await Transaction.update(
        { status: 'failed', remarks: `PayU: ${error_Message || status}` },
        { where: { api_request_id: txnid } }
      );
    } catch (e) {
      logger.error('PayU failure DB update error', e.message);
    }
  }

  res.redirect(`${process.env.FRONTEND_URL}/payment/failure?txnid=${txnid}`);
});

// ─────────────────────────────────────────────────────────────────────────────
// Shared handler — update transaction + credit wallet if needed
// ─────────────────────────────────────────────────────────────────────────────

async function handlePaymentResult(result, raw) {
  if (!Transaction) return;

  try {
    const { txnid, amount, status, userId, rechargeRef } = result;
    const normalizedStatus = status === 'success' ? 'success' : 'failed';

    // Update transaction status
    await Transaction.update(
      {
        status:  normalizedStatus,
        live_id: raw.mihpayid || raw.payuMoneyId || null,
        remarks: `PayU: ${raw.bank_ref_num || status}`,
      },
      { where: { api_request_id: txnid } }
    );

    // If this was a wallet top-up (rechargeRef starts with 'WALLET_'), credit user wallet
    if (normalizedStatus === 'success' && rechargeRef?.startsWith('WALLET_') && User) {
      const user = await User.findByPk(userId);
      if (user) {
        await user.increment('wallet_balance', { by: amount });
        if (WalletTransaction) {
          await WalletTransaction.create({
            user_id:     userId,
            type:        'credit',
            amount:      amount,
            description: `Wallet top-up via PayU | Ref: ${txnid}`,
            reference:   txnid,
          });
        }
        logger.info('Wallet credited via PayU payment', { userId, amount, txnid });
      }
    }

    logger.info('PayU payment processed', { txnid, normalizedStatus, amount });
  } catch (err) {
    logger.error('handlePaymentResult error', err.message);
  }
}

const verifyJWT = require('../middleware/auth');
router.get('/initiate', verifyJWT, async (req, res) => {
  const { amount } = req.query;
  const user = req.user;

  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    return res.status(400).send('Invalid amount');
  }

  try {
    const amt = parseFloat(amount);
    const ref = `WALLET_TOPUP_${Date.now()}`;
    
    if (Transaction) {
      await Transaction.create({
        user_id: user.id,
        type: 'wallet',
        operator: 'PAYU',
        account_no: user.phone,
        opening_balance: user.wallet_balance,
        recharge_amount: amt,
        debit_amount: 0,
        closing_balance: user.wallet_balance,
        api_name: 'PAYU',
        api_request_id: ref,
        status: 'pending'
      });
    }

    const { txnid, params } = payuService.createPaymentOrder(user, amt, 'Wallet Topup', ref);

    if (Transaction) {
      await Transaction.update(
        { api_request_id: txnid },
        { where: { api_request_id: ref } }
      );
    }

    const formFields = Object.entries(params)
      .filter(([key]) => key !== 'paymentUrl')
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Redirecting to PayU...</title></head>
        <body onload="document.forms[0].submit()">
          <p>Please wait, redirecting to payment gateway...</p>
          <form method="POST" action="${params.paymentUrl}">
            ${formFields}
          </form>
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    logger.error('Payment initiate error', err.message);
    res.status(500).send('Payment initiation failed: ' + err.message);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/payment/recharge-checkout — Web-based payment initiator for recharges
// ─────────────────────────────────────────────────────────────────────────────
router.get('/recharge-checkout', async (req, res) => {
  const { token, amount, phone, operator, circle, plan_amount, plan_id, validity, cashback_used, type } = req.query;

  if (!token || !amount || !phone || !operator || !circle) {
    return res.status(400).send('Missing checkout parameters');
  }

  // 1. Verify token to resolve user context
  let decoded;
  try {
    const jwt = require('jsonwebtoken');
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).send('Unauthorized / Invalid token');
  }

  try {
    const freshUser = await User.findByPk(decoded.userId);
    if (!freshUser || freshUser.status === 'blocked') {
      return res.status(401).send('User not found or blocked');
    }

    const payableAmt = parseFloat(amount);
    const cashbackUsedVal = parseFloat(cashback_used || '0');

    // 2. Resolve internal Operator config
    const op = await Operator.findOne({ where: { code: operator.toUpperCase() } }) ||
               await Operator.findOne({ where: { name: operator } });
    if (!op) {
      return res.status(404).send('Operator configuration not found');
    }

    const ref = `RECHARGE_${Date.now()}`;

    // 3. Initiate Transaction Record in database
    if (Transaction) {
      await Transaction.create({
        user_id: freshUser.id,
        type: type || 'prepaid',
        operator: op.name,
        operator_code: op.code,
        account_no: phone,
        circle: circle,
        opening_balance: freshUser.wallet_balance,
        recharge_amount: parseFloat(plan_amount || amount),
        debit_amount: payableAmt,
        closing_balance: freshUser.wallet_balance - cashbackUsedVal,
        api_name: 'PAYU',
        api_request_id: ref,
        status: 'pending',
        r_offer_amount: cashbackUsedVal
      });
    }

    // 4. Create PayU order
    const purpose = `${op.name} ${type || 'prepaid'} recharge for ${phone}`;
    const { txnid, params } = payuService.createPaymentOrder(freshUser, payableAmt, purpose, ref);

    if (Transaction) {
      await Transaction.update(
        { api_request_id: txnid },
        { where: { api_request_id: ref } }
      );
    }

    // 5. Render automatic form redirect
    const formFields = Object.entries(params)
      .filter(([key]) => key !== 'paymentUrl')
      .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
      .join('\n');

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Redirecting to PayU...</title></head>
        <body onload="document.forms[0].submit()">
          <p>Please wait, redirecting to payment gateway...</p>
          <form method="POST" action="${params.paymentUrl}">
            ${formFields}
          </form>
        </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    logger.error('Recharge payment initiate error', err.message);
    res.status(500).send('Recharge payment initiation failed: ' + err.message);
  }
});

module.exports = router;


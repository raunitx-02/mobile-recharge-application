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

module.exports = router;

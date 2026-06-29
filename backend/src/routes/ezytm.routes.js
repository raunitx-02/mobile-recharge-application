/**
 * Ezytm / Robotic Exchange — Callback Handler
 *
 * Ezytm calls this URL after processing a recharge.
 * Set in: roboticexchange.in → Settings → Call BackUrl
 *
 * Callback URL to set:
 *   Production: https://api.optionspay.in/api/ezytm/callback
 *   Local dev (ngrok): https://xxxx.ngrok.io/api/ezytm/callback
 *
 * Ezytm sends GET params:
 *   status     = SUCCESS | FAILED | PENDING
 *   operatorid = Operator ID
 *   agentid    = Agent/Member ID (your 4726)
 *   txnid      = Ezytm's transaction ID
 *   number     = Customer mobile/account number
 *   amount     = Recharge amount
 *   message    = Status message from operator
 *
 * Mode: P2P (Purchase-to-Pay) — LAPU based
 */

const express = require('express');
const router  = express.Router();
const logger  = require('../utils/logger');

let Transaction;
try {
  const models = require('../models');
  Transaction  = models.Transaction;
} catch (e) {
  Transaction = null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/ezytm/callback
// Ezytm sends GET request with query params
// ─────────────────────────────────────────────────────────────────────────────

router.get('/callback', async (req, res) => {
  const {
    status,
    operatorid,
    agentid,
    txnid,      // Ezytm's internal txn ID
    number,     // Customer mobile/account
    amount,
    message,
  } = req.query;

  logger.info('Ezytm callback received', { status, txnid, number, amount, message });

  // Respond immediately with success (Ezytm retries if it doesn't get 200)
  res.status(200).send('OK');

  if (!txnid) {
    logger.warn('Ezytm callback missing txnid', req.query);
    return;
  }

  // Normalize status
  const normalizedStatus =
    (status || '').toUpperCase() === 'SUCCESS' ? 'success' :
    (status || '').toUpperCase() === 'FAILED'  ? 'failed'  : 'pending';

  if (!Transaction) return;

  try {
    // Find transaction by Ezytm txnid stored in our live_id, OR by account_no + amount
    let txn = await Transaction.findOne({ where: { live_id: txnid } });

    // Fallback: find by account number if txnid not yet stored
    if (!txn && number) {
      txn = await Transaction.findOne({
        where: {
          account_no:      String(number),
          recharge_amount: parseFloat(amount || '0'),
          status:          'pending',
        },
        order: [['created_at', 'DESC']],
      });
    }

    if (txn) {
      await txn.update({
        status:  normalizedStatus,
        live_id: txnid,
        remarks: `Ezytm callback: ${status} | ${message || ''}`,
      });
      logger.info('Transaction updated via Ezytm callback', {
        txnid, normalizedStatus, number, amount,
      });
    } else {
      logger.warn('No matching transaction for Ezytm callback', { txnid, number, amount });
    }
  } catch (dbErr) {
    logger.error('Ezytm callback DB error', { err: dbErr.message, txnid });
  }
});

/**
 * GET /api/ezytm/test
 * Verify endpoint is live before pasting URL into Ezytm dashboard
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Ezytm callback endpoint is live ✓',
    url:     'https://api.optionspay.in/api/ezytm/callback',
  });
});

module.exports = router;

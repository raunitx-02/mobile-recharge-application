/**
 * KwikAPI Callback Handler
 *
 * KwikAPI posts transaction results to this URL after processing.
 * Configure in: kwikapi.com → Settings → Callback URL
 *
 * Callback format:
 *   POST/GET  /api/kwikapi/callback
 *   Params: payid, client_id, operator_ref, status
 *
 * Where:
 *   payid        = KwikApi Unique Order Id
 *   client_id    = Your order_id from our system
 *   operator_ref = Operator's reference ID (for disputes)
 *   status       = SUCCESS | FAILED
 *
 * Set callback URL to:
 *   DEV  (ngrok): https://xxxx.ngrok.io/api/kwikapi/callback
 *   PROD:         https://api.optionspay.in/api/kwikapi/callback
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Safely try to load Transaction model (works even without DB in dev)
let Transaction;
try {
  const models = require('../models');
  Transaction = models.Transaction;
} catch (e) {
  Transaction = null;
}

/**
 * POST + GET /api/kwikapi/callback
 * KwikAPI sends both GET and POST depending on config.
 */
const handleCallback = async (req, res) => {
  const params = { ...req.query, ...req.body };
  const { payid, client_id, operator_ref, status } = params;

  logger.info('KwikAPI Callback received', { payid, client_id, operator_ref, status });

  // Always respond 200 quickly to acknowledge receipt
  res.status(200).send('OK');

  if (!client_id) {
    logger.warn('KwikAPI callback missing client_id', params);
    return;
  }

  const normalizedStatus =
    (status || '').toUpperCase() === 'SUCCESS' ? 'success' :
    (status || '').toUpperCase() === 'FAILED'  ? 'failed'  : 'pending';

  // Update transaction in DB
  if (Transaction) {
    try {
      const txn = await Transaction.findOne({ where: { api_request_id: client_id } });
      if (txn) {
        await txn.update({
          status:     normalizedStatus,
          live_id:    operator_ref || txn.live_id,
          remarks:    `KwikAPI callback: ${status} | payid: ${payid}`,
        });
        logger.info('Transaction updated via KwikAPI callback', { client_id, normalizedStatus });
      } else {
        logger.warn('No transaction found for KwikAPI callback client_id', { client_id });
      }
    } catch (dbErr) {
      logger.error('KwikAPI callback DB update failed', { err: dbErr.message, client_id });
    }
  }
};

router.post('/callback', handleCallback);
router.get('/callback',  handleCallback);

/**
 * GET /api/kwikapi/test
 * Simple endpoint to verify callback URL is reachable
 */
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'KwikAPI callback endpoint is live ✓' });
});

module.exports = router;

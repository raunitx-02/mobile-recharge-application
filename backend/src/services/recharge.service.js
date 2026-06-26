const { sequelize, Transaction, User, Operator, ApiConfig, CircleSwitch, Coupon } = require('../models');
const walletService = require('./wallet.service');
const bbpsService = require('./bbps.service');
const commissionService = require('./commission.service');
const fcmService = require('./fcm.service');
const sendgridService = require('./sendgrid.service');
const logger = require('../utils/logger');
const crypto = require('crypto');

async function initiateRecharge(userId, { type, operatorCode, accountNo, circle, amount, couponCode }) {
  const rechargeAmount = parseFloat(amount);
  if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
    throw new Error('Invalid recharge amount');
  }

  // 1. Core verification & API config lookup
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const operator = await Operator.findOne({ where: { code: operatorCode } });
  if (!operator) {
    throw new Error(`Operator with code ${operatorCode} not found`);
  }

  // 2. Select appropriate API config based on routing switches
  let apiConfig = null;
  let routingSource = 'default';

  // Precedence A: User-specific config override
  if (user.api_override_id) {
    apiConfig = await ApiConfig.findByPk(user.api_override_id);
    routingSource = 'user_override';
  }

  // Precedence B: CircleSwitch router override
  if (!apiConfig && circle) {
    const circleSwitch = await CircleSwitch.findOne({
      where: { operator_id: operator.id, circle: circle, status: true },
      include: [{ model: ApiConfig, as: 'apiConfig' }]
    });
    if (circleSwitch) {
      apiConfig = circleSwitch.apiConfig;
      routingSource = `circle_switch_${circle}`;
    }
  }

  // Precedence C: Default global active provider switch
  if (!apiConfig) {
    apiConfig = await ApiConfig.findOne({
      where: { in_switch: true, status: true }
    });
    routingSource = 'global_switch';
  }

  if (!apiConfig) {
    // If no provider config found, fallback to standard mock placeholder configuration
    apiConfig = await ApiConfig.findOne({ where: { name: 'AetherPay Mock API' } });
    if (!apiConfig) {
      throw new Error('No active API providers available. Recharge blocked.');
    }
  }

  // 3. Coupon checkout validation
  let discountAmount = 0.00;
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ where: { code: couponCode, status: true } });
    if (!coupon) {
      throw new Error('Invalid or expired coupon code');
    }
    const rightNow = new Date();
    if (new Date(coupon.valid_till) < rightNow) {
      throw new Error('Coupon code has expired');
    }
    if (rechargeAmount < parseFloat(coupon.min_recharge)) {
      throw new Error(`Minimum recharge required for this coupon is ₹${coupon.min_recharge}`);
    }
    if (coupon.used_count >= coupon.usage_limit) {
      throw new Error('Coupon usage limit reached');
    }

    if (coupon.discount_type === 'flat') {
      discountAmount = parseFloat(coupon.value);
    } else if (coupon.discount_type === 'percentage') {
      discountAmount = (rechargeAmount * parseFloat(coupon.value)) / 100;
      if (coupon.max_discount && discountAmount > parseFloat(coupon.max_discount)) {
        discountAmount = parseFloat(coupon.max_discount);
      }
    }
    discountAmount = parseFloat(discountAmount.toFixed(2));
  }

  const netDebitAmount = rechargeAmount - discountAmount;

  // 4. Run entire recharge execution inside Sequelize transaction context
  const dbTxn = await sequelize.transaction();
  let transaction = null;

  try {
    const openingBalance = parseFloat(user.wallet_balance);
    if (openingBalance < netDebitAmount) {
      throw new Error('Insufficient wallet balance for recharge');
    }

    const tempTxnId = `TXN_${crypto.randomBytes(8).toString('hex').toUpperCase()}`;

    // A. Debit wallet
    await walletService.debitWallet(
      userId,
      netDebitAmount,
      tempTxnId,
      'recharge',
      `Recharge: ${operator.name} for ${accountNo}`,
      dbTxn
    );

    // B. Create pending Transaction row
    transaction = await Transaction.create({
      user_id: userId,
      type: type,
      operator: operator.name,
      operator_code: operatorCode,
      account_no: accountNo,
      circle: circle,
      opening_balance: openingBalance,
      recharge_amount: rechargeAmount,
      debit_amount: netDebitAmount,
      commission: 0.00, // calculated later
      closing_balance: openingBalance - netDebitAmount,
      api_name: apiConfig.name,
      api_id: apiConfig.id,
      api_request_id: tempTxnId,
      status: 'pending',
      switching_name: routingSource,
      r_offer_amount: discountAmount
    }, { transaction: dbTxn });

    // Commit local database lock to free up socket/concurrency before firing heavy external network call
    await dbTxn.commit();
  } catch (err) {
    await dbTxn.rollback();
    logger.error('Failed to initiate local database transaction, rolled back.', err);
    throw err;
  }

  // 5. Fire external BBPS provider network call
  let providerResult = null;
  try {
    providerResult = await bbpsService.callProviderAPI(
      apiConfig,
      operatorCode,
      accountNo,
      rechargeAmount,
      transaction.api_request_id
    );
  } catch (err) {
    logger.error('Aggregator integration crash:', err.message);
    providerResult = {
      success: false,
      status: 'failed',
      message: err.message || 'External provider crash'
    };
  }

  // 6. Update Transaction status and settle refund / commissions
  const postTxn = await sequelize.transaction();
  try {
    const freshUser = await User.findByPk(userId, { transaction: postTxn, lock: true });
    
    if (providerResult.success) {
      // SUCCESS OR PENDING
      const currentTxnStatus = providerResult.status; // 'success' or 'pending'
      
      // Calculate Agent Commission
      const commEarned = await commissionService.calculateCommission(
        operator.id,
        circle,
        rechargeAmount,
        apiConfig.id,
        userId
      );

      // Apply commission directly as credit to agent wallet balance
      let currentClosingBal = parseFloat(freshUser.wallet_balance);
      if (commEarned > 0) {
        const creditRes = await walletService.creditWallet(
          userId,
          commEarned,
          transaction.api_request_id,
          'commission',
          `Commission: ${operator.name} recharge for ${accountNo}`,
          postTxn
        );
        currentClosingBal = creditRes.newBalance;
      }

      // Update transaction parameters
      await transaction.update({
        status: currentTxnStatus,
        live_id: providerResult.liveId || null,
        commission: commEarned,
        closing_balance: currentClosingBal,
        remarks: `Processed via ${apiConfig.name}`
      }, { transaction: postTxn });

      // Update coupon usage count in DB
      if (coupon) {
        await coupon.increment('used_count', { by: 1, transaction: postTxn });
      }

      await postTxn.commit();

      // Trigger alerts (push notifications + email templates)
      if (currentTxnStatus === 'success') {
        if (freshUser.fcm_token) {
          fcmService.sendToDevice(
            freshUser.fcm_token,
            'Recharge Successful ⚡',
            `Your recharge of ₹${rechargeAmount} for ${operator.name} (${accountNo}) was successful.`,
            { transactionId: transaction.id }
          );
        }
        if (freshUser.email) {
          sendgridService.sendTransactionEmail(freshUser.email, 'recharge_success', {
            name: freshUser.name,
            amount: rechargeAmount,
            operator: operator.name,
            accountNo: accountNo,
            txnId: transaction.api_request_id,
            liveId: providerResult.liveId
          });
        }
      }
    } else {
      // TRANSACTION FAILED -> TRIGGER REFUND FLOW
      const currentBal = parseFloat(freshUser.wallet_balance);
      const refundRes = await walletService.creditWallet(
        userId,
        netDebitAmount,
        transaction.api_request_id,
        'refund',
        `Refund: Failed ${operator.name} recharge for ${accountNo}`,
        postTxn
      );

      await transaction.update({
        status: 'failed',
        closing_balance: refundRes.newBalance,
        remarks: providerResult.message || 'Transaction rejected by billing gateway.'
      }, { transaction: postTxn });

      await postTxn.commit();

      // Trigger notifications for failure
      if (freshUser.fcm_token) {
        fcmService.sendToDevice(
          freshUser.fcm_token,
          'Recharge Failed ❌',
          `Your recharge of ₹${rechargeAmount} failed. Amount of ₹${netDebitAmount} refunded back to your wallet.`,
          { transactionId: transaction.id }
        );
      }
      if (freshUser.email) {
        sendgridService.sendTransactionEmail(freshUser.email, 'recharge_failed', {
          name: freshUser.name,
          amount: rechargeAmount,
          operator: operator.name,
          accountNo: accountNo,
          reason: providerResult.message
        });
      }
    }

    // Reload and return complete transaction status
    await transaction.reload();
    return transaction;
  } catch (err) {
    await postTxn.rollback();
    logger.error('Failed to post-process transaction status, rolled back.', err);
    throw err;
  }
}

module.exports = {
  initiateRecharge
};

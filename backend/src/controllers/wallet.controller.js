const { WalletTransaction, FundRequest, sequelize } = require('../models');
const razorpayService = require('../services/razorpay.service');
const walletService = require('../services/wallet.service');
const response = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');

// GET /wallet
const getWallet = async (req, res) => {
  const userId = req.user.id;

  try {
    const balance = req.user.wallet_balance;
    const recentTxns = await WalletTransaction.findAll({
      where: { user_id: userId },
      limit: 10,
      order: [['created_at', 'DESC']]
    });

    return response.success(res, {
      balance,
      recentTransactions: recentTxns
    }, 'Wallet details retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch wallet info', 500);
  }
};

// GET /history?page=&limit=&type=&dateFrom=&dateTo=
const getHistory = async (req, res) => {
  const userId = req.user.id;
  const { page, limit, type, dateFrom, dateTo } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);
    const { Op } = require('sequelize');

    const whereClause = { user_id: userId };
    if (type) {
      whereClause.type = type;
    }
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.created_at[Op.lte] = new Date(dateTo);
    }

    const txns = await WalletTransaction.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['created_at', 'DESC']]
    });

    const paginatedResult = getPagingData(txns, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Wallet history retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch wallet history', 500);
  }
};

// POST /add-money/create-order
const createOrder = async (req, res) => {
  const userId = req.user.id;
  const { amount } = req.body;

  try {
    const order = await razorpayService.createOrder(amount, userId);
    return response.success(res, {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mockkeyid123'
    }, 'Payment gateway order created');
  } catch (err) {
    return response.error(res, 'Failed to initialize payment gateway order', 500);
  }
};

// POST /add-money/verify
const verifyPayment = async (req, res) => {
  const userId = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

  const dbTxn = await sequelize.transaction();

  try {
    const isValid = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      await dbTxn.rollback();
      return response.error(res, 'Payment signature verification failed', 400);
    }

    // Verify transaction not already processed
    const existingTxn = await WalletTransaction.findOne({
      where: { reference_id: razorpay_payment_id, reference_type: 'payment_gateway' }
    });

    if (existingTxn) {
      await dbTxn.rollback();
      return response.success(res, { balance: req.user.wallet_balance }, 'Payment already verified');
    }

    // Credit wallet
    const creditResult = await walletService.creditWallet(
      userId,
      amount,
      razorpay_payment_id,
      'payment_gateway',
      `Add Money via Razorpay - Payment ID: ${razorpay_payment_id}`,
      dbTxn
    );

    await dbTxn.commit();

    return response.success(res, {
      balance: creditResult.newBalance
    }, 'Wallet credited successfully');
  } catch (err) {
    await dbTxn.rollback();
    return response.error(res, err.message || 'Payment verification failed', 500);
  }
};

// POST /fund-request
const requestFunds = async (req, res) => {
  const userId = req.user.id;
  const { amount, transfer_mode, bank_details, reference_no } = req.body;

  try {
    const request = await FundRequest.create({
      user_id: userId,
      amount,
      transfer_mode,
      bank_details,
      reference_no,
      status: 'pending'
    });

    return response.success(res, request, 'Fund request submitted successfully', 201);
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return response.error(res, 'Reference number already submitted', 400);
    }
    return response.error(res, 'Failed to submit fund request', 500);
  }
};

// GET /fund-requests
const getFundRequests = async (req, res) => {
  const userId = req.user.id;

  try {
    const requests = await FundRequest.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    return response.success(res, requests, 'Fund requests retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch fund requests', 500);
  }
};

module.exports = {
  getWallet,
  getHistory,
  createOrder,
  verifyPayment,
  requestFunds,
  getFundRequests
};

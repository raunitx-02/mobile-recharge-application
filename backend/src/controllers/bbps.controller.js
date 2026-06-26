const { ApiConfig, Operator } = require('../models');
const bbpsService = require('../services/bbps.service');
const rechargeService = require('../services/recharge.service');
const response = require('../utils/response');

// GET /categories
const getCategories = async (req, res) => {
  // Static list of standard BBPS Biller categories according to NPCI
  const categories = [
    { code: 'electricity', name: 'Electricity ⚡', icon: 'zap' },
    { code: 'water', name: 'Water 💧', icon: 'droplet' },
    { code: 'gas', name: 'Piped Gas 🔥', icon: 'flame' },
    { code: 'broadband', name: 'Broadband 📡', icon: 'wifi' },
    { code: 'lpg', name: 'LPG Cylinder 🫙', icon: 'cylinder' },
    { code: 'cable', name: 'Cable TV 📺', icon: 'tv' },
    { code: 'fastag', name: 'FASTag 🚗', icon: 'credit-card' },
    { code: 'insurance', name: 'Insurance 🛡️', icon: 'shield' }
  ];
  return response.success(res, categories, 'Categories retrieved');
};

// GET /billers?category=
const getBillers = async (req, res) => {
  const { category } = req.query;

  try {
    let apiConfig = await ApiConfig.findOne({ where: { in_switch: true, status: true } });
    if (!apiConfig) {
      apiConfig = { name: 'Mock API Config', type: 'recharge1' };
    }

    const billers = await bbpsService.fetchBillerDetails(apiConfig, category || 'electricity');
    return response.success(res, billers, 'Billers retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch biller list', 500);
  }
};

// POST /fetch-bill
const fetchBill = async (req, res) => {
  const { billerId, accountNo } = req.body;

  try {
    let apiConfig = await ApiConfig.findOne({ where: { in_switch: true, status: true } });
    if (!apiConfig) {
      apiConfig = { name: 'Mock API Config', type: 'recharge1' };
    }

    const bill = await bbpsService.fetchBill(apiConfig, billerId, accountNo);
    return response.success(res, bill, 'Bill details fetched successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch live bill details from provider', 500);
  }
};

// POST /pay
const payBill = async (req, res) => {
  const userId = req.user.id;
  const { billerCode, accountNo, amount, couponCode } = req.body;

  try {
    const transaction = await rechargeService.initiateRecharge(userId, {
      type: 'bbps',
      operatorCode: billerCode,
      accountNo: accountNo,
      circle: 'National',
      amount: amount,
      couponCode: couponCode
    });

    return response.success(res, transaction, 'Bill payment processed successfully', 201);
  } catch (err) {
    return response.error(res, err.message || 'Bill payment failed', 400);
  }
};

module.exports = {
  getCategories,
  getBillers,
  fetchBill,
  payBill
};

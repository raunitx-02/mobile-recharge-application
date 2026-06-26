const { Operator, Plan } = require('../models');
const rechargeService = require('../services/recharge.service');
const response = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');

// GET /operators?type=
const getOperators = async (req, res) => {
  const { type } = req.query;

  try {
    const whereClause = { status: true };
    if (type) {
      whereClause.type = type;
    }

    const operators = await Operator.findAll({ where: whereClause });
    return response.success(res, operators, 'Operators retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch operators', 500);
  }
};

// GET /operators/:id/plans?circle=
const getPlans = async (req, res) => {
  const { id } = req.params;
  const { circle, page, limit } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = { operator_id: id, status: true };
    if (circle) {
      whereClause.circle = circle;
    }

    const plans = await Plan.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['amount', 'ASC']]
    });

    const paginatedResult = getPagingData(plans, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Plans retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch plans', 500);
  }
};

// POST /detect-operator
const detectOperator = async (req, res) => {
  const { phone } = req.body;

  try {
    // Basic lookup table for detection by prefix in India (mock logic)
    const firstDigit = phone.charAt(0);
    let opCode = 'JIO';
    let circle = 'Maharashtra';

    if (firstDigit === '9' || firstDigit === '8') {
      opCode = 'AIRTEL';
      circle = 'Delhi';
    } else if (firstDigit === '7') {
      opCode = 'VI';
      circle = 'Mumbai';
    } else if (firstDigit === '6') {
      opCode = 'BSNL';
      circle = 'Karnataka';
    }

    const operator = await Operator.findOne({ where: { code: opCode } });
    if (!operator) {
      return response.error(res, 'Failed to auto-detect operator', 404);
    }

    return response.success(res, {
      operator,
      circle
    }, 'Operator detected successfully');
  } catch (err) {
    return response.error(res, 'Auto-detection failed', 500);
  }
};

// POST /initiate
const initiateRecharge = async (req, res) => {
  const userId = req.user.id;
  const { type, operatorCode, accountNo, circle, amount, couponCode } = req.body;

  try {
    const transaction = await rechargeService.initiateRecharge(userId, {
      type,
      operatorCode,
      accountNo,
      circle,
      amount,
      couponCode
    });

    return response.success(res, transaction, 'Transaction processed', 201);
  } catch (err) {
    return response.error(res, err.message || 'Recharge processing failed', 400);
  }
};

module.exports = {
  getOperators,
  getPlans,
  detectOperator,
  initiateRecharge
};

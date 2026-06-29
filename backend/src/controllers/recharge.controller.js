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

const kwikapiService = require('../services/kwikapi.service');
const ezytmService = require('../services/ezytm.service');

const normalizeOperatorCode = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('jio')) return 'JIO';
  if (n.includes('airtel')) return 'AIRTEL';
  if (n.includes('idea') || n.includes('vodafone') || n.includes('vi')) return 'VI';
  if (n.includes('bsnl')) return 'BSNL';
  return null;
};

// POST /detect-operator
const detectOperator = async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return response.error(res, 'Invalid 10-digit phone number', 400);
  }

  let detectedName = '';
  let detectedCircle = 'Maharashtra';
  let success = false;

  // 1. Try KwikAPI live lookup if key is configured
  if (process.env.KWIKAPI_API_KEY && process.env.KWIKAPI_API_KEY.trim() !== '') {
    try {
      const result = await kwikapiService.detectOperatorAndCircle(phone);
      if (result && result.success) {
        detectedName = result.operator;
        detectedCircle = result.circle || detectedCircle;
        success = true;
      }
    } catch (e) {
      console.error('KwikAPI live detection error:', e.message);
    }
  }

  // 2. Try Ezytm live lookup if configured
  if (!success && process.env.EZYTM_API_PASSWORD && process.env.EZYTM_API_PASSWORD.trim() !== '') {
    try {
      const result = await ezytmService.detectOperator(phone);
      if (result && result.success && result.operator) {
        detectedName = result.operator;
        detectedCircle = result.circle || detectedCircle;
        success = true;
      }
    } catch (e) {
      console.error('Ezytm live detection error:', e.message);
    }
  }

  // 3. Fallback: Prefix-based detection (local lookup table)
  if (!success) {
    const firstDigit = phone.charAt(0);
    const p2 = phone.slice(0, 2);
    const jio2    = ['60','61','62','63','64','65','66','68','69','70','73','74','79'];
    const airtel2 = ['72','78','80','81','82','83','84','85','86','87','88','89','90','91','92','93','94','95','98','99'];
    const vi2     = ['75','76','77','96','97'];

    if (jio2.includes(p2)) {
      detectedName = 'JIO';
      detectedCircle = 'Maharashtra';
    } else if (airtel2.includes(p2)) {
      detectedName = 'AIRTEL';
      detectedCircle = 'Delhi';
    } else if (vi2.includes(p2)) {
      detectedName = 'VI';
      detectedCircle = 'Mumbai';
    } else {
      // standard fallback logic
      if (firstDigit === '9' || firstDigit === '8') {
        detectedName = 'AIRTEL';
        detectedCircle = 'Delhi';
      } else if (firstDigit === '7') {
        detectedName = 'VI';
        detectedCircle = 'Mumbai';
      } else if (firstDigit === '6') {
        detectedName = 'BSNL';
        detectedCircle = 'Karnataka';
      } else {
        detectedName = 'JIO';
        detectedCircle = 'Maharashtra';
      }
    }
  }

  const resolvedCode = normalizeOperatorCode(detectedName) || 'JIO';

  try {
    const operator = await Operator.findOne({ where: { code: resolvedCode } });
    if (!operator) {
      return response.error(res, 'Failed to resolve active operator', 404);
    }

    return response.success(res, {
      operator,
      circle: detectedCircle
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

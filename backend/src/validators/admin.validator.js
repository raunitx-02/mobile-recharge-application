const Joi = require('joi');

const walletAdjustment = Joi.object({
  type: Joi.string().valid('credit', 'debit').required(),
  amount: Joi.number().positive().precision(2).required(),
  remark: Joi.string().min(3).required()
});

const apiOverride = Joi.object({
  apiConfigId: Joi.string().uuid().optional().allow(null, '')
});

const fundRequestResolve = Joi.object({
  remark: Joi.string().optional().allow('')
});

const createOperator = Joi.object({
  name: Joi.string().required(),
  code: Joi.string().required(),
  type: Joi.string().valid('prepaid', 'postpaid', 'dth', 'bbps').required(),
  logo_url: Joi.string().uri().optional().allow(null, '')
});

const createPlan = Joi.object({
  operator_id: Joi.string().uuid().required(),
  circle: Joi.string().required(),
  amount: Joi.number().positive().precision(2).required(),
  validity: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required()
});

const createApiConfig = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('recharge1', 'pay2all', 'billbox', 'generic_rest').required(),
  base_url: Joi.string().uri().required(),
  status_url: Joi.string().uri().optional().allow(null, ''),
  balance_url: Joi.string().uri().optional().allow(null, ''),
  credentials: Joi.object().required()
});

const updateApiSwitching = Joi.array().items(
  Joi.object({
    operatorId: Joi.string().uuid().required(),
    circle: Joi.string().required(),
    apiConfigId: Joi.string().uuid().required()
  })
).required();

const createCommission = Joi.object({
  operator_id: Joi.string().uuid().required(),
  circle: Joi.string().optional().allow(null, ''),
  api_config_id: Joi.string().uuid().optional().allow(null, ''),
  user_id: Joi.string().uuid().optional().allow(null, ''),
  type: Joi.string().valid('flat', 'percentage').required(),
  value:  Joi.number().min(0).precision(2).required(),
  min_amount: Joi.number().min(0).precision(2).optional().default(0.00),
  max_amount: Joi.number().positive().precision(2).optional().allow(null)
});

module.exports = {
  walletAdjustment,
  apiOverride,
  fundRequestResolve,
  createOperator,
  createPlan,
  createApiConfig,
  updateApiSwitching,
  createCommission
};

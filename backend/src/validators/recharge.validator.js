const Joi = require('joi');

const initiateRecharge = Joi.object({
  type: Joi.string().valid('prepaid', 'postpaid', 'dth', 'bbps').required(),
  operatorCode: Joi.string().required(),
  accountNo: Joi.string().required(),
  circle: Joi.string().optional().allow(null, ''),
  amount: Joi.number().positive().precision(2).required(),
  couponCode: Joi.string().optional().allow(null, '')
});

const detectOperator = Joi.object({
  phone: Joi.string().length(10).pattern(/^[0-9]+$/).required()
});

const dispute = Joi.object({
  remarks: Joi.string().min(5).required()
});

module.exports = {
  initiateRecharge,
  detectOperator,
  dispute
};

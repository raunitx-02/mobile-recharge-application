const Joi = require('joi');

const createOrder = Joi.object({
  amount: Joi.number().positive().precision(2).required()
});

const verifyPayment = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  amount: Joi.number().positive().precision(2).required()
});

const fundRequest = Joi.object({
  amount: Joi.number().positive().precision(2).required(),
  transfer_mode: Joi.string().required(),
  bank_details: Joi.string().optional().allow(''),
  reference_no: Joi.string().min(5).required()
});

module.exports = {
  createOrder,
  verifyPayment,
  fundRequest
};

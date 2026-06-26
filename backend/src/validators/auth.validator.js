const Joi = require('joi');

const sendOTP = Joi.object({
  phone: Joi.string().length(10).pattern(/^[0-9]+$/).required().messages({
    'string.pattern.base': 'Phone number must contain only numeric digits',
    'string.length': 'Phone number must be exactly 10 digits long'
  })
});

const verifyOTP = Joi.object({
  phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  otp: Joi.string().length(6).pattern(/^[0-9]+$/).required()
});

const login = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const register = Joi.object({
  phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(2).required(),
  password: Joi.string().min(6).required(),
  referred_by: Joi.string().uuid().optional().allow('')
});

const adminLogin = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

module.exports = {
  sendOTP,
  verifyOTP,
  login,
  register,
  adminLogin
};

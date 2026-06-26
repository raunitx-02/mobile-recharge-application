const rateLimit = require('express-rate-limit');
const response = require('../utils/response');

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // Limit each phone to 5 OTP requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.body.phone || req.ip;
  },
  handler: (req, res) => {
    return response.error(res, 'Too many OTP requests. Please try again after an hour.', 429);
  }
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 100, // Limit each IP to 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return response.error(res, 'Rate limit exceeded. Please slow down your requests.', 429);
  }
});

module.exports = {
  otpLimiter,
  generalLimiter
};

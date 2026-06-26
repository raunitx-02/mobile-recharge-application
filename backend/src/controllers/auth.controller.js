const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { generateOTP } = require('../utils/otp');
const { User, OTPRecord, Notification } = require('../models');
const msg91Service = require('../services/msg91.service');
const redis = require('../config/redis');
const response = require('../utils/response');
const logger = require('../utils/logger');
const crypto = require('crypto');

// POST /send-otp
const sendOTP = async (req, res) => {
  const { phone } = req.body;

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Save to database
    await OTPRecord.create({
      phone,
      otp,
      expires_at: expiresAt,
      status: 'active'
    });

    // Send SMS
    await msg91Service.sendOTP(phone, otp);

    return response.success(res, null, 'OTP sent successfully');
  } catch (err) {
    logger.error('sendOTP error:', err);
    return response.error(res, 'Failed to send OTP. Please try again.', 500);
  }
};

// POST /verify-otp
const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  try {
    // Find active OTP record
    const otpRecord = await OTPRecord.findOne({
      where: { phone, otp, status: 'active' },
      order: [['created_at', 'DESC']]
    });

    if (!otpRecord) {
      return response.error(res, 'Invalid OTP. Please check and try again.');
    }

    if (new Date(otpRecord.expires_at) < new Date()) {
      await otpRecord.update({ status: 'expired' });
      return response.error(res, 'OTP has expired. Please request a new one.');
    }

    // Mark OTP as verified
    await otpRecord.update({ status: 'verified' });

    // Check if user already exists
    let user = await User.findOne({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      // Create user with default referral code
      isNewUser = true;
      const refCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      user = await User.create({
        phone,
        name: `User ${phone.slice(-4)}`,
        referral_code: refCode,
        wallet_balance: 0.00,
        kyc_status: 'pending',
        status: 'active'
      });

      // Create welcome notification
      await Notification.create({
        user_id: user.id,
        title: 'Welcome to AetherPay 🎉',
        body: 'Welcome! Start recharges and earn high commission slabs instantly.',
        type: 'info'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Save refresh token in Redis (or database fallback)
    if (redis && redis.status !== 'mock') {
      await redis.setex(`refresh_token:${user.id}:${refreshToken}`, 30 * 24 * 60 * 60, 'true'); // 30 days
    }

    return response.success(res, {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        wallet_balance: user.wallet_balance,
        referral_code: user.referral_code,
        kyc_status: user.kyc_status,
        status: user.status
      },
      accessToken,
      refreshToken,
      isNewUser
    }, 'Authentication successful');
  } catch (err) {
    logger.error('verifyOTP error:', err);
    return response.error(res, 'OTP verification failed', 500);
  }
};

// POST /login
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return response.error(res, 'Invalid email or password', 401);
    }

    if (!user.password_hash) {
      return response.error(res, 'Password not set. Please login using OTP.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return response.error(res, 'Invalid email or password', 401);
    }

    if (user.status === 'blocked') {
      return response.error(res, 'Your account has been blocked. Please contact support.', 403);
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    if (redis && redis.status !== 'mock') {
      await redis.setex(`refresh_token:${user.id}:${refreshToken}`, 30 * 24 * 60 * 60, 'true');
    }

    return response.success(res, {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        wallet_balance: user.wallet_balance,
        referral_code: user.referral_code,
        kyc_status: user.kyc_status,
        status: user.status
      },
      accessToken,
      refreshToken
    }, 'Login successful');
  } catch (err) {
    logger.error('login error:', err);
    return response.error(res, 'Login failed', 500);
  }
};

// POST /register
const register = async (req, res) => {
  const { phone, email, name, password, referred_by } = req.body;

  try {
    // Check constraints
    let existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return response.error(res, 'Phone number already registered', 400);
    }

    existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return response.error(res, 'Email address already registered', 400);
    }

    let referrer = null;
    if (referred_by) {
      referrer = await User.findOne({ where: { referral_code: referred_by } });
      if (!referrer) {
        return response.error(res, 'Invalid referral code', 400);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const refCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const user = await User.create({
      phone,
      email,
      name,
      password_hash,
      referral_code: refCode,
      referred_by: referrer ? referrer.id : null,
      wallet_balance: 0.00,
      kyc_status: 'pending',
      status: 'active'
    });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    if (redis && redis.status !== 'mock') {
      await redis.setex(`refresh_token:${user.id}:${refreshToken}`, 30 * 24 * 60 * 60, 'true');
    }

    return response.success(res, {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        wallet_balance: user.wallet_balance,
        referral_code: user.referral_code,
        kyc_status: user.kyc_status,
        status: user.status
      },
      accessToken,
      refreshToken
    }, 'Registration successful');
  } catch (err) {
    logger.error('register error:', err);
    return response.error(res, 'Registration failed', 500);
  }
};

// POST /refresh-token
const refreshSessionToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return response.error(res, 'Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'aetherpay-refresh-secret');
    
    // Check if token blacklisted in Redis
    if (redis && redis.status !== 'mock') {
      const exists = await redis.get(`refresh_token:${decoded.userId}:${refreshToken}`);
      if (!exists) {
        return response.error(res, 'Session expired or logged out', 401);
      }
    }

    const accessToken = generateAccessToken(decoded.userId);
    return response.success(res, { accessToken }, 'Access token refreshed');
  } catch (err) {
    return response.error(res, 'Invalid refresh token', 401);
  }
};

// POST /logout
const logout = async (req, res) => {
  const { refreshToken } = req.body;
  const user = req.user;

  try {
    if (redis && redis.status !== 'mock' && refreshToken) {
      await redis.del(`refresh_token:${user.id}:${refreshToken}`);
    }
    return response.success(res, null, 'Logged out successfully');
  } catch (err) {
    logger.error('logout error:', err);
    return response.error(res, 'Logout failed', 500);
  }
};

module.exports = {
  sendOTP,
  verifyOTP,
  login,
  register,
  refreshSessionToken,
  logout
};

const { Offer, Coupon, User } = require('../models');
const response = require('../utils/response');
const { Op } = require('sequelize');

// GET /
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.findAll({
      where: {
        status: true,
        valid_till: { [Op.gt]: new Date() }
      },
      order: [['created_at', 'DESC']]
    });

    return response.success(res, offers, 'Offers retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch offers', 500);
  }
};

// POST /apply-coupon
const applyCoupon = async (req, res) => {
  const { code, amount } = req.body;

  try {
    const coupon = await Coupon.findOne({
      where: { code, status: true }
    });

    if (!coupon) {
      return response.error(res, 'Invalid coupon code', 400);
    }

    if (new Date(coupon.valid_till) < new Date()) {
      return response.error(res, 'Coupon has expired', 400);
    }

    const rechargeAmount = parseFloat(amount);
    if (rechargeAmount < parseFloat(coupon.min_recharge)) {
      return response.error(res, `Minimum recharge required is ₹${coupon.min_recharge}`, 400);
    }

    if (coupon.used_count >= coupon.usage_limit) {
      return response.error(res, 'Coupon usage limit reached', 400);
    }

    let discount = 0.00;
    if (coupon.discount_type === 'flat') {
      discount = parseFloat(coupon.value);
    } else if (coupon.discount_type === 'percentage') {
      discount = (rechargeAmount * parseFloat(coupon.value)) / 100;
      if (coupon.max_discount && discount > parseFloat(coupon.max_discount)) {
        discount = parseFloat(coupon.max_discount);
      }
    }

    discount = parseFloat(discount.toFixed(2));
    const finalAmount = parseFloat((rechargeAmount - discount).toFixed(2));

    return response.success(res, {
      discount,
      finalAmount,
      couponId: coupon.id
    }, 'Coupon applied successfully');
  } catch (err) {
    return response.error(res, 'Failed to apply coupon', 500);
  }
};

// GET /referral
const getReferralStats = async (req, res) => {
  const user = req.user;

  try {
    const referredCount = await User.count({
      where: { referred_by: user.id }
    });

    // Commission payout mock calculation for referrals
    const totalEarned = referredCount * 10.00; // Flat ₹10 bonus per referral

    return response.success(res, {
      referralCode: user.referral_code,
      referredCount,
      totalEarned
    }, 'Referral stats retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch referral statistics', 500);
  }
};

module.exports = {
  getOffers,
  applyCoupon,
  getReferralStats
};

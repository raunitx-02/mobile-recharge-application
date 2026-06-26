const { User } = require('../models');
const bcrypt = require('bcryptjs');
const response = require('../utils/response');

// GET /
const getProfile = async (req, res) => {
  const user = req.user;
  return response.success(res, {
    id: user.id,
    phone: user.phone,
    email: user.email,
    name: user.name,
    wallet_balance: user.wallet_balance,
    referral_code: user.referral_code,
    kyc_status: user.kyc_status,
    status: user.status
  }, 'Profile retrieved successfully');
};

// PUT /update
const updateProfile = async (req, res) => {
  const user = req.user;
  const { name, email } = req.body;

  try {
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return response.error(res, 'Email address already in use', 400);
      }
    }

    await user.update({
      name: name || user.name,
      email: email || user.email
    });

    return response.success(res, {
      id: user.id,
      phone: user.phone,
      email: user.email,
      name: user.name,
      kyc_status: user.kyc_status
    }, 'Profile updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to update profile settings', 500);
  }
};

// PUT /change-password
const changePassword = async (req, res) => {
  const user = req.user;
  const { oldPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return response.error(res, 'New password must be at least 6 characters', 400);
  }

  try {
    if (user.password_hash) {
      const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
      if (!isMatch) {
        return response.error(res, 'Incorrect current password', 400);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await user.update({ password_hash });
    return response.success(res, null, 'Password updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to change password', 500);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};

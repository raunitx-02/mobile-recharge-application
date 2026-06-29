const { User, Transaction, WalletTransaction, sequelize } = require('../../models');
const response = require('../../utils/response');
const { Op } = require('sequelize');

// GET /admin/users
const getUsers = async (req, res) => {
  const { page = 1, limit = 20, search, status } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash', 'refresh_token'] }
    });
    return response.success(res, { users: rows, total: count, page: parseInt(page) }, 'Users retrieved');
  } catch (err) {
    console.error('getUsers error:', err);
    return response.error(res, 'Failed to fetch users', 500);
  }
};

// GET /admin/users/:id
const getUserDetail = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash', 'refresh_token'] },
      include: [{ model: Transaction, as: 'transactions', limit: 10, order: [['created_at', 'DESC']] }]
    });
    if (!user) return response.error(res, 'User not found', 404);
    return response.success(res, user, 'User details');
  } catch (err) {
    return response.error(res, 'Failed to fetch user', 500);
  }
};

// PATCH /admin/users/:id/status
const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  if (!['active', 'blocked', 'inactive'].includes(status))
    return response.error(res, 'Invalid status', 400);
  try {
    await User.update({ status }, { where: { id: req.params.id } });
    return response.success(res, null, `User ${status}`);
  } catch (err) {
    return response.error(res, 'Failed to update status', 500);
  }
};

// POST /admin/users/:id/wallet
const adjustUserWallet = async (req, res) => {
  const { type, amount, reason } = req.body;
  if (!amount || amount <= 0) return response.error(res, 'Invalid amount', 400);

  const t = await sequelize.transaction();
  try {
    const user = await User.findByPk(req.params.id, { transaction: t });
    if (!user) { await t.rollback(); return response.error(res, 'User not found', 404); }

    const currentBalance = parseFloat(user.wallet_balance || 0);
    const amt = parseFloat(amount);
    const newBalance = type === 'credit' ? currentBalance + amt : currentBalance - amt;

    if (newBalance < 0) { await t.rollback(); return response.error(res, 'Insufficient wallet balance', 400); }

    await User.update({ wallet_balance: newBalance }, { where: { id: req.params.id }, transaction: t });

    if (WalletTransaction) {
      await WalletTransaction.create({
        user_id: req.params.id,
        type: type === 'credit' ? 'credit' : 'debit',
        amount: amt,
        closing_balance: newBalance,
        description: reason || `Admin ${type}`,
        status: 'success'
      }, { transaction: t });
    }

    await t.commit();
    return response.success(res, { wallet_balance: newBalance }, `Wallet ${type}ed ₹${amount}`);
  } catch (err) {
    await t.rollback();
    console.error('adjustWallet error:', err);
    return response.error(res, 'Wallet adjustment failed', 500);
  }
};

module.exports = { getUsers, getUserDetail, updateUserStatus, adjustUserWallet };

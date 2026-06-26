const { User, Transaction, WalletTransaction, sequelize } = require('../../models');
const walletService = require('../../services/wallet.service');
const response = require('../../utils/response');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { Op } = require('sequelize');

// GET /users?page=&search=&status=
const getUsers = async (req, res) => {
  const { page, limit, search, status } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (search) {
      whereClause([Op.or]) = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['created_at', 'DESC']]
    });

    const paginatedResult = getPagingData(users, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Users retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch users list', 500);
  }
};

// GET /users/:id
const getUserDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }
    return response.success(res, user, 'User details retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch user details', 500);
  }
};

// PUT /users/:id/status
const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    await user.update({ status });
    return response.success(res, user, `User status updated to ${status}`);
  } catch (err) {
    return response.error(res, 'Failed to update user status', 500);
  }
};

// PUT /users/:id/wallet
const adjustUserWallet = async (req, res) => {
  const { id } = req.params;
  const { type, amount, remark } = req.body;
  const adminId = req.adminUser.id;

  const dbTxn = await sequelize.transaction();

  try {
    let creditResult;
    const refId = `MANUAL_${Date.now()}`;

    if (type === 'credit') {
      creditResult = await walletService.creditWallet(
        id,
        amount,
        refId,
        'manual_adjustment',
        `Admin Adjust (Credit): ${remark}`,
        dbTxn
      );
    } else if (type === 'debit') {
      creditResult = await walletService.debitWallet(
        id,
        amount,
        refId,
        'manual_adjustment',
        `Admin Adjust (Debit): ${remark}`,
        dbTxn
      );
    }

    await dbTxn.commit();
    return response.success(res, { balance: creditResult.newBalance }, 'Wallet adjusted successfully');
  } catch (err) {
    await dbTxn.rollback();
    return response.error(res, err.message || 'Wallet adjustment failed', 400);
  }
};

// PUT /users/:id/api-override
const overrideUserApi = async (req, res) => {
  const { id } = req.params;
  const { apiConfigId } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return response.error(res, 'User not found', 404);
    }

    await user.update({ api_override_id: apiConfigId || null });
    return response.success(res, user, 'User API routing override saved');
  } catch (err) {
    return response.error(res, 'Failed to save API routing override', 500);
  }
};

module.exports = {
  getUsers,
  getUserDetail,
  updateUserStatus,
  adjustUserWallet,
  overrideUserApi
};

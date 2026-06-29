const { Transaction, User } = require('../../models');
const response = require('../../utils/response');
const { Op } = require('sequelize');

// GET /admin/transactions
const getTransactions = async (req, res) => {
  const { page = 1, limit = 20, search, status, type, dateFrom, dateTo, userId } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const where = {};
    if (status && status !== 'all') where.status = status;
    if (type && type !== 'all') where.type = type;
    if (userId) where.user_id = userId;
    
    if (search) {
      const users = await User.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
          ]
        },
        attributes: ['id']
      });
      const userIds = users.map(u => u.id);

      where[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { account_no: { [Op.like]: `%${search}%` } },
        { operator: { [Op.like]: `%${search}%` } }
      ];

      if (userIds.length > 0) {
        where[Op.or].push({ user_id: { [Op.in]: userIds } });
      }
    }
    if (dateFrom || dateTo) {
      where.created_at = {};
      if (dateFrom) where.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        where.created_at[Op.lte] = to;
      }
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
    });

    return response.success(res, { transactions: rows, total: count, page: parseInt(page) }, 'Transactions retrieved');
  } catch (err) {
    console.error('getTransactions error:', err);
    return response.error(res, 'Failed to fetch transactions', 500);
  }
};

// PATCH /admin/transactions/:id/status
const updateTxnStatus = async (req, res) => {
  const { status, remarks } = req.body;
  try {
    const txn = await Transaction.findByPk(req.params.id);
    if (!txn) return response.error(res, 'Transaction not found', 404);
    await txn.update({ status, admin_remarks: remarks });
    return response.success(res, null, 'Transaction updated');
  } catch (err) {
    return response.error(res, 'Failed to update transaction', 500);
  }
};

module.exports = { getTransactions, updateTxnStatus };

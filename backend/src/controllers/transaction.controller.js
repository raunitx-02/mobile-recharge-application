const { Transaction } = require('../models');
const response = require('../utils/response');
const { getPagination, getPagingData } = require('../utils/pagination');
const { Op } = require('sequelize');

// GET /
const getTransactions = async (req, res) => {
  const userId = req.user.id;
  const { page, limit, status, type, operator, dateFrom, dateTo } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = { user_id: userId };
    
    if (status) {
      whereClause.status = status;
    }
    if (type) {
      whereClause.type = type;
    }
    if (operator) {
      whereClause.operator = { [Op.iLike]: `%${operator}%` };
    }
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.created_at[Op.lte] = new Date(dateTo);
    }

    const txns = await Transaction.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['created_at', 'DESC']]
    });

    const paginatedResult = getPagingData(txns, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Transactions retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch transaction history', 500);
  }
};

// GET /:id
const getTransactionDetail = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const txn = await Transaction.findOne({
      where: { id, user_id: userId }
    });

    if (!txn) {
      return response.error(res, 'Transaction not found', 404);
    }

    return response.success(res, txn, 'Transaction details retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch transaction details', 500);
  }
};

module.exports = {
  getTransactions,
  getTransactionDetail
};

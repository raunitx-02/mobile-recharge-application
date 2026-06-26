const { Transaction, FundRequest, ApiLog, User, ApiConfig } = require('../../models');
const response = require('../../utils/response');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { Op } = require('sequelize');
const XLSX = require('xlsx');

// GET /reports/recharge?page=&status=&dateFrom=&dateTo=&operator=&userId=&circle=
const getRechargeReport = async (req, res) => {
  const { page, limit, status, dateFrom, dateTo, operator, userId, circle } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = {};
    if (status) whereClause.status = status;
    if (operator) whereClause.operator = operator;
    if (userId) whereClause.user_id = userId;
    if (circle) whereClause.circle = circle;
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.created_at[Op.lte] = new Date(dateTo);
    }

    const txns = await Transaction.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
    });

    const paginatedResult = getPagingData(txns, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Recharge reports retrieved');
  } catch (err) {
    return response.error(res, 'Failed to generate recharge report', 500);
  }
};

// GET /reports/fund-orders?page=&status=&dateFrom=&dateTo=
const getFundOrdersReport = async (req, res) => {
  const { page, limit, status, dateFrom, dateTo } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = {};
    if (status) whereClause.status = status;
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.created_at[Op.lte] = new Date(dateTo);
    }

    const requests = await FundRequest.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
    });

    const paginatedResult = getPagingData(requests, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Fund orders report retrieved');
  } catch (err) {
    return response.error(res, 'Failed to generate fund orders report', 500);
  }
};

// GET /reports/recharge/export
const exportRechargeReport = async (req, res) => {
  try {
    const txns = await Transaction.findAll({
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
    });

    // Format data rows
    const data = txns.map(t => ({
      'Transaction ID': t.id,
      'User Name': t.user ? t.user.name : 'N/A',
      'User Phone': t.user ? t.user.phone : 'N/A',
      'Operator': t.operator,
      'Account/Mobile Number': t.account_no,
      'Amount (INR)': parseFloat(t.recharge_amount),
      'Debit Amount (INR)': parseFloat(t.debit_amount),
      'Commission Earned': parseFloat(t.commission),
      'API Used': t.api_name,
      'Switch ID / Live Ref': t.live_id || 'N/A',
      'Status': t.status.toUpperCase(),
      'Timestamp': t.created_at
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Recharges');

    // Build spreadsheet buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=recharge_report.xlsx');
    return res.send(buffer);
  } catch (err) {
    return response.error(res, 'Failed to export Excel report spreadsheet', 500);
  }
};

module.exports = {
  getRechargeReport,
  getFundOrdersReport,
  exportRechargeReport
};

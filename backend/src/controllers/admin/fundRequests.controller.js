const { FundRequest, User, sequelize } = require('../../models');
const walletService = require('../../services/wallet.service');
const fcmService = require('../../services/fcm.service');
const response = require('../../utils/response');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { Op } = require('sequelize');

// GET /fund-requests?page=&status=&dateFrom=&dateTo=
const getFundRequests = async (req, res) => {
  const { page, limit, status, dateFrom, dateTo } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
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
    }, 'Fund requests retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch fund requests', 500);
  }
};

// PUT /fund-requests/:id/approve
const approveFundRequest = async (req, res) => {
  const { id } = req.params;
  const adminId = req.adminUser.id;

  const dbTxn = await sequelize.transaction();

  try {
    const request = await FundRequest.findByPk(id, { transaction: dbTxn, lock: true });
    if (!request) {
      await dbTxn.rollback();
      return response.error(res, 'Fund request not found', 404);
    }

    if (request.status !== 'pending') {
      await dbTxn.rollback();
      return response.error(res, 'Fund request has already been processed', 400);
    }

    // 1. Credit wallet
    await walletService.creditWallet(
      request.user_id,
      request.amount,
      request.reference_no,
      'fund_request',
      `Manual deposit approved - Ref: ${request.reference_no}`,
      dbTxn
    );

    // 2. Mark request as approved
    await request.update({
      status: 'approved',
      approved_by: adminId
    }, { transaction: dbTxn });

    await dbTxn.commit();

    // Send push notification
    const user = await User.findByPk(request.user_id);
    if (user && user.fcm_token) {
      fcmService.sendToDevice(
        user.fcm_token,
        'Wallet Top-up Successful 💰',
        `Your manual deposit request of ₹${request.amount} has been approved.`
      );
    }

    return response.success(res, request, 'Fund request approved and credited');
  } catch (err) {
    await dbTxn.rollback();
    return response.error(res, err.message || 'Verification / Approval failed', 500);
  }
};

// PUT /fund-requests/:id/reject
const rejectFundRequest = async (req, res) => {
  const { id } = req.params;
  const { remark } = req.body;
  const adminId = req.adminUser.id;

  try {
    const request = await FundRequest.findByPk(id);
    if (!request) {
      return response.error(res, 'Fund request not found', 404);
    }

    if (request.status !== 'pending') {
      return response.error(res, 'Fund request has already been processed', 400);
    }

    await request.update({
      status: 'rejected',
      remark: remark || 'Rejected by Admin',
      approved_by: adminId
    });

    // Send push notification
    const user = await User.findByPk(request.user_id);
    if (user && user.fcm_token) {
      fcmService.sendToDevice(
        user.fcm_token,
        'Deposit Request Rejected ❌',
        `Your deposit request of ₹${request.amount} was rejected. Reason: ${remark || 'N/A'}`
      );
    }

    return response.success(res, request, 'Fund request rejected successfully');
  } catch (err) {
    return response.error(res, 'Failed to reject fund request', 500);
  }
};

module.exports = {
  getFundRequests,
  approveFundRequest,
  rejectFundRequest
};

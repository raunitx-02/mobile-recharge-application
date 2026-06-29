const { User, Transaction, Wallet, WalletTransaction, sequelize } = require('../../models');
const response = require('../../utils/response');
const { Op, fn, col, literal } = require('sequelize');

// GET /admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [totalUsers, todayTxns, successTxns, todayRevenue, recentTransactions] = await Promise.all([
      User.count(),
      Transaction.count({ where: { created_at: { [Op.gte]: today } } }),
      Transaction.count({ where: { created_at: { [Op.gte]: today }, status: 'success' } }),
      Transaction.sum('recharge_amount', { where: { created_at: { [Op.gte]: today }, status: 'success' } }),
      Transaction.findAll({
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
      })
    ]);

    const successRate = todayTxns > 0 ? parseFloat(((successTxns / todayTxns) * 100).toFixed(1)) : 100;

    // Build revenue trend (last 7 days)
    const revenueTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const amount = await Transaction.sum('recharge_amount', {
        where: { created_at: { [Op.gte]: d, [Op.lt]: next }, status: 'success' }
      }) || 0;
      revenueTrend.push({ date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }), amount });
    }

    // Build txnStats (last 7 days)
    const txnStats = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const [success, failed] = await Promise.all([
        Transaction.count({ where: { created_at: { [Op.gte]: d, [Op.lt]: next }, status: 'success' } }),
        Transaction.count({ where: { created_at: { [Op.gte]: d, [Op.lt]: next }, status: 'failed' } }),
      ]);
      txnStats.push({ date: d.toLocaleDateString('en-IN', { weekday: 'short' }), success, failed });
    }

    return response.success(res, {
      stats: {
        totalUsers,
        todayRevenue: todayRevenue || 0,
        todayTxns,
        successRate,
      },
      revenueTrend,
      txnStats,
      recentTransactions,
      topOperators: []
    }, 'Dashboard stats retrieved');
  } catch (err) {
    console.error('Dashboard error:', err);
    return response.error(res, 'Failed to fetch dashboard metrics', 500);
  }
};

module.exports = { getDashboardStats };

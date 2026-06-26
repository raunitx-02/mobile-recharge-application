const { User, Transaction, ApiConfig } = require('../../models');
const response = require('../../utils/response');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { Op } = require('sequelize');

// GET /admin/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { status: 'active' } });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTransactions = await Transaction.count({
      where: { created_at: { [Op.gte]: today } }
    });

    const successTransactions = await Transaction.count({
      where: { created_at: { [Op.gte]: today }, status: 'success' }
    });

    const todayRevenue = await Transaction.sum('recharge_amount', {
      where: { created_at: { [Op.gte]: today }, status: 'success' }
    }) || 0.00;

    const todaySuccessRate = todayTransactions > 0 
      ? parseFloat(((successTransactions / todayTransactions) * 100).toFixed(2)) 
      : 100.00;

    // Last 10 transactions
    const latestTransactions = await Transaction.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'phone'] }]
    });

    // Mock analytical distribution details
    const last30DaysRevenue = [
      { date: '2026-06-20', revenue: 15400 },
      { date: '2026-06-21', revenue: 12100 },
      { date: '2026-06-22', revenue: 19800 },
      { date: '2026-06-23', revenue: 24500 },
      { date: '2026-06-24', revenue: 28400 },
      { date: '2026-06-25', revenue: 32000 },
      { date: '2026-06-26', revenue: todayRevenue }
    ];

    const statusDistribution = [
      { name: 'Success', value: successTransactions || 85, color: '#34C759' },
      { name: 'Pending', value: (todayTransactions - successTransactions) || 10, color: '#FF9F0A' },
      { name: 'Failed', value: 5, color: '#FF3B30' }
    ];

    const topOperators = [
      { name: 'Jio Prepaid', count: 125, revenue: 25400 },
      { name: 'Airtel Prepaid', count: 98, revenue: 19800 },
      { name: 'Vi Prepaid', count: 42, revenue: 8400 }
    ];

    return response.success(res, {
      totalUsers,
      activeUsers,
      todayTransactions,
      todayRevenue,
      todaySuccessRate,
      latestTransactions,
      last30DaysRevenue,
      statusDistribution,
      topOperators
    }, 'Admin dashboard metrics retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch dashboard metrics', 500);
  }
};

module.exports = {
  getDashboardStats
};

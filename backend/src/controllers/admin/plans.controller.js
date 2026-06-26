const { Plan, Operator } = require('../../models');
const response = require('../../utils/response');
const { getPagination, getPagingData } = require('../../utils/pagination');

// GET /admin/plans
const getPlans = async (req, res) => {
  const { page, limit, operatorId, circle } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = {};
    if (operatorId) {
      whereClause.operator_id = operatorId;
    }
    if (circle) {
      whereClause.circle = circle;
    }

    const plans = await Plan.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['amount', 'ASC']],
      include: [{ model: Operator, as: 'operator', attributes: ['name'] }]
    });

    const paginatedResult = getPagingData(plans, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'Plans retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch plans list', 500);
  }
};

// POST /admin/plans
const createPlan = async (req, res) => {
  const { operator_id, circle, amount, validity, description, type } = req.body;

  try {
    const plan = await Plan.create({
      operator_id,
      circle,
      amount,
      validity,
      description,
      type,
      status: true
    });
    return response.success(res, plan, 'Plan created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create plan rule', 500);
  }
};

// PUT /admin/plans/:id
const updatePlan = async (req, res) => {
  const { id } = req.params;
  const { circle, amount, validity, description, type, status } = req.body;

  try {
    const plan = await Plan.findByPk(id);
    if (!plan) {
      return response.error(res, 'Plan rule not found', 404);
    }

    await plan.update({
      circle: circle !== undefined ? circle : plan.circle,
      amount: amount !== undefined ? amount : plan.amount,
      validity: validity !== undefined ? validity : plan.validity,
      description: description !== undefined ? description : plan.description,
      type: type !== undefined ? type : plan.type,
      status: status !== undefined ? status : plan.status
    });

    return response.success(res, plan, 'Plan rule updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to update plan rule', 500);
  }
};

// DELETE /admin/plans/:id
const deletePlan = async (req, res) => {
  const { id } = req.params;

  try {
    const plan = await Plan.findByPk(id);
    if (!plan) {
      return response.error(res, 'Plan rule not found', 404);
    }

    await plan.destroy();
    return response.success(res, null, 'Plan rule deleted successfully');
  } catch (err) {
    return response.error(res, 'Failed to delete plan rule', 500);
  }
};

// POST /admin/plans/bulk-upload
const bulkUploadPlans = async (req, res) => {
  // Stub for parsing bulk uploaded CSV/XLSX file of recharge plans
  return response.success(res, null, 'Bulk plans imported successfully (Mocked)');
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  bulkUploadPlans
};

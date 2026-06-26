const { Commission, Operator, ApiConfig } = require('../../models');
const response = require('../../utils/response');

// GET /commissions
const getCommissions = async (req, res) => {
  try {
    const rules = await Commission.findAll({
      include: [
        { model: Operator, as: 'operator', attributes: ['name', 'code'] },
        { model: ApiConfig, as: 'apiConfig', attributes: ['name'] }
      ]
    });
    return response.success(res, rules, 'Commission slabs retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to retrieve commission slabs', 500);
  }
};

// POST /commissions
const createCommission = async (req, res) => {
  const { operator_id, circle, api_config_id, user_id, type, value, min_amount, max_amount } = req.body;

  try {
    const slab = await Commission.create({
      operator_id,
      circle: circle || null,
      api_config_id: api_config_id || null,
      user_id: user_id || null,
      type,
      value,
      min_amount,
      max_amount,
      status: true
    });

    return response.success(res, slab, 'Commission slab rule created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create commission rule', 500);
  }
};

// PUT /commissions/:id
const updateCommission = async (req, res) => {
  const { id } = req.params;
  const { circle, api_config_id, user_id, type, value, min_amount, max_amount, status } = req.body;

  try {
    const slab = await Commission.findByPk(id);
    if (!slab) {
      return response.error(res, 'Commission rule not found', 404);
    }

    await slab.update({
      circle: circle !== undefined ? circle : slab.circle,
      api_config_id: api_config_id !== undefined ? api_config_id : slab.api_config_id,
      user_id: user_id !== undefined ? user_id : slab.user_id,
      type: type !== undefined ? type : slab.type,
      value: value !== undefined ? value : slab.value,
      min_amount: min_amount !== undefined ? min_amount : slab.min_amount,
      max_amount: max_amount !== undefined ? max_amount : slab.max_amount,
      status: status !== undefined ? status : slab.status
    });

    return response.success(res, slab, 'Commission rule updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to update commission rule', 500);
  }
};

// DELETE /commissions/:id
const deleteCommission = async (req, res) => {
  const { id } = req.params;

  try {
    const slab = await Commission.findByPk(id);
    if (!slab) {
      return response.error(res, 'Commission rule not found', 404);
    }

    await slab.destroy();
    return response.success(res, null, 'Commission rule deleted successfully');
  } catch (err) {
    return response.error(res, 'Failed to delete commission rule', 500);
  }
};

module.exports = {
  getCommissions,
  createCommission,
  updateCommission,
  deleteCommission
};

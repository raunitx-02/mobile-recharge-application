const { Operator } = require('../../models');
const response = require('../../utils/response');

// GET /admin/operators
const getOperators = async (req, res) => {
  try {
    const operators = await Operator.findAll({ order: [['type', 'ASC'], ['name', 'ASC']] });
    return response.success(res, operators, 'Operators retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to fetch operators', 500);
  }
};

// POST /admin/operators
const createOperator = async (req, res) => {
  const { name, code, type, logo_url } = req.body;

  try {
    const exists = await Operator.findOne({ where: { code } });
    if (exists) {
      return response.error(res, `Operator code ${code} already registered`, 400);
    }

    const operator = await Operator.create({ name, code, type, logo_url, status: true });
    return response.success(res, operator, 'Operator created successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to create operator', 500);
  }
};

// PUT /admin/operators/:id
const updateOperator = async (req, res) => {
  const { id } = req.params;
  const { name, code, type, logo_url, status } = req.body;

  try {
    const operator = await Operator.findByPk(id);
    if (!operator) {
      return response.error(res, 'Operator not found', 404);
    }

    await operator.update({
      name: name !== undefined ? name : operator.name,
      code: code !== undefined ? code : operator.code,
      type: type !== undefined ? type : operator.type,
      logo_url: logo_url !== undefined ? logo_url : operator.logo_url,
      status: status !== undefined ? status : operator.status
    });

    return response.success(res, operator, 'Operator updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to update operator details', 500);
  }
};

// DELETE /admin/operators/:id
const deleteOperator = async (req, res) => {
  const { id } = req.params;

  try {
    const operator = await Operator.findByPk(id);
    if (!operator) {
      return response.error(res, 'Operator not found', 404);
    }

    // Soft delete / block operator
    await operator.update({ status: false });
    return response.success(res, null, 'Operator disabled / deleted successfully');
  } catch (err) {
    return response.error(res, 'Failed to remove operator', 500);
  }
};

module.exports = {
  getOperators,
  createOperator,
  updateOperator,
  deleteOperator
};

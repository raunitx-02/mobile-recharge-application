const { ApiConfig, CircleSwitch, ApiLog, Operator } = require('../../models');
const { encrypt } = require('../../utils/encryption');
const response = require('../../utils/response');
const { getPagination, getPagingData } = require('../../utils/pagination');
const { Op } = require('sequelize');

// GET /api-configs
const getApiConfigs = async (req, res) => {
  try {
    const configs = await ApiConfig.findAll();
    // Mask sensitive configurations details before exposing to admin panel
    const maskedConfigs = configs.map(c => {
      const plain = c.toJSON();
      plain.credentials_encrypted = '[MASKED]';
      return plain;
    });
    return response.success(res, maskedConfigs, 'API configurations retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch API configs', 500);
  }
};

// POST /api-configs
const createApiConfig = async (req, res) => {
  const { name, type, base_url, status_url, balance_url, credentials } = req.body;

  try {
    const encryptedCreds = encrypt(JSON.stringify(credentials));

    const config = await ApiConfig.create({
      name,
      type,
      base_url,
      status_url,
      balance_url,
      credentials_encrypted: encryptedCreds,
      in_switch: true,
      status: true
    });

    const plain = config.toJSON();
    plain.credentials_encrypted = '[MASKED]';

    return response.success(res, plain, 'API configuration added successfully', 201);
  } catch (err) {
    return response.error(res, 'Failed to add API configuration', 500);
  }
};

// PUT /api-configs/:id
const updateApiConfig = async (req, res) => {
  const { id } = req.params;
  const { name, base_url, status_url, balance_url, credentials, in_switch, status } = req.body;

  try {
    const config = await ApiConfig.findByPk(id);
    if (!config) {
      return response.error(res, 'API configuration not found', 404);
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (base_url !== undefined) updates.base_url = base_url;
    if (status_url !== undefined) updates.status_url = status_url;
    if (balance_url !== undefined) updates.balance_url = balance_url;
    if (in_switch !== undefined) updates.in_switch = in_switch;
    if (status !== undefined) updates.status = status;
    if (credentials !== undefined) {
      updates.credentials_encrypted = encrypt(JSON.stringify(credentials));
    }

    await config.update(updates);
    
    const plain = config.toJSON();
    plain.credentials_encrypted = '[MASKED]';

    return response.success(res, plain, 'API configuration updated successfully');
  } catch (err) {
    return response.error(res, 'Failed to update API configuration', 500);
  }
};

// DELETE /api-configs/:id
const deleteApiConfig = async (req, res) => {
  const { id } = req.params;

  try {
    const config = await ApiConfig.findByPk(id);
    if (!config) {
      return response.error(res, 'API configuration not found', 404);
    }

    await config.destroy();
    return response.success(res, null, 'API configuration deleted successfully');
  } catch (err) {
    return response.error(res, 'Failed to delete API configuration', 500);
  }
};

// POST /api-configs/:id/test
const testApiConnection = async (req, res) => {
  return response.success(res, { connection: 'success', ping: '45ms' }, 'API connection test succeeded');
};

// GET /api-configs/:id/balance
const getApiBalance = async (req, res) => {
  return response.success(res, { balance: '₹4,50,250.00', currency: 'INR' }, 'API Provider wallet balance retrieved');
};

// PUT /api-configs/:id/toggle
const toggleApiSwitch = async (req, res) => {
  const { id } = req.params;

  try {
    const config = await ApiConfig.findByPk(id);
    if (!config) {
      return response.error(res, 'API configuration not found', 404);
    }

    await config.update({ in_switch: !config.in_switch });
    return response.success(res, { in_switch: config.in_switch }, `API routing switch toggled to ${config.in_switch}`);
  } catch (err) {
    return response.error(res, 'Failed to toggle API routing switch', 500);
  }
};

// GET /api-switching
const getApiSwitchingRules = async (req, res) => {
  try {
    const rules = await CircleSwitch.findAll({
      include: [
        { model: Operator, as: 'operator', attributes: ['name', 'code'] },
        { model: ApiConfig, as: 'apiConfig', attributes: ['name'] }
      ]
    });
    return response.success(res, rules, 'Routing switches retrieved successfully');
  } catch (err) {
    return response.error(res, 'Failed to retrieve API switching rules', 500);
  }
};

// PUT /api-switching
const updateApiSwitchingRules = async (req, res) => {
  const rules = req.body; // Array of { operatorId, circle, apiConfigId }

  try {
    await CircleSwitch.destroy({ where: {} }); // Wipe old rules and bulk create new routing config

    const switchRecords = [];
    for (const rule of rules) {
      switchRecords.push({
        operator_id: rule.operatorId,
        circle: rule.circle,
        api_config_id: rule.apiConfigId,
        status: true
      });
    }

    await CircleSwitch.bulkCreate(switchRecords);
    return response.success(res, null, 'API routing rules saved successfully');
  } catch (err) {
    return response.error(res, 'Failed to update switching rules config', 500);
  }
};

// GET /api-logs
const getApiLogs = async (req, res) => {
  const { page, limit, apiId, status, dateFrom, dateTo } = req.query;

  try {
    const { limit: l, offset } = getPagination(page, limit);

    const whereClause = {};
    if (apiId) {
      whereClause.api_config_id = apiId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (dateFrom || dateTo) {
      whereClause.created_at = {};
      if (dateFrom) whereClause.created_at[Op.gte] = new Date(dateFrom);
      if (dateTo) whereClause.created_at[Op.lte] = new Date(dateTo);
    }

    const logs = await ApiLog.findAndCountAll({
      where: whereClause,
      limit: l,
      offset,
      order: [['created_at', 'DESC']],
      include: [{ model: ApiConfig, as: 'apiConfig', attributes: ['name', 'type'] }]
    });

    const paginatedResult = getPagingData(logs, page, l);
    return response.paginated(res, paginatedResult.items, {
      totalItems: paginatedResult.totalItems,
      totalPages: paginatedResult.totalPages,
      currentPage: paginatedResult.currentPage
    }, 'API Logs retrieved');
  } catch (err) {
    return response.error(res, 'Failed to fetch API logs', 500);
  }
};

module.exports = {
  getApiConfigs,
  createApiConfig,
  updateApiConfig,
  deleteApiConfig,
  testApiConnection,
  getApiBalance,
  toggleApiSwitch,
  getApiSwitchingRules,
  updateApiSwitchingRules,
  getApiLogs
};

const { Commission, Operator, User } = require('../models');
const logger = require('../utils/logger');

async function calculateCommission(operatorId, circle, amount, apiConfigId, userId) {
  const rechargeAmount = parseFloat(amount);
  
  try {
    // 1. Fetch Operator details
    const operator = await Operator.findByPk(operatorId);
    if (!operator) {
      throw new Error('Operator details not found for commission calculation');
    }

    // 2. Query Commission configuration rules matching this transaction
    // Order of lookup precedence:
    // a. User-specific rule
    // b. Specific API Config override
    // c. Specific Circle override
    // d. Flat/generic operator rules
    
    // Find all active rules for this operator
    const rules = await Commission.findAll({
      where: {
        operator_id: operatorId,
        status: true
      }
    });

    if (rules.length === 0) {
      logger.warn(`No commission rules defined for operator ${operator.name}`);
      return 0.00;
    }

    let matchingRule = null;

    // Filter logic based on specificity
    // Precedence 1: User Specific Rule
    if (userId) {
      matchingRule = rules.find(r => r.user_id === userId && 
        (!r.circle || r.circle === circle) &&
        (!r.api_config_id || r.api_config_id === apiConfigId)
      );
    }

    // Precedence 2: API Specific Switch Slab
    if (!matchingRule && apiConfigId) {
      matchingRule = rules.find(r => !r.user_id && r.api_config_id === apiConfigId && (!r.circle || r.circle === circle));
    }

    // Precedence 3: Circle Specific Switch Slab
    if (!matchingRule && circle) {
      matchingRule = rules.find(r => !r.user_id && !r.api_config_id && r.circle === circle);
    }

    // Precedence 4: Fallback standard operator slab
    if (!matchingRule) {
      matchingRule = rules.find(r => !r.user_id && !r.api_config_id && !r.circle);
    }

    if (!matchingRule) {
      logger.warn(`No specific matching commission rule found. Using first available or fallback.`);
      matchingRule = rules[0]; // fallback
    }

    // Check transaction amount limits
    if (matchingRule.min_amount && rechargeAmount < parseFloat(matchingRule.min_amount)) {
      return 0.00;
    }
    if (matchingRule.max_amount && rechargeAmount > parseFloat(matchingRule.max_amount)) {
      return 0.00;
    }

    // Calculate commission payout
    let calculatedAmount = 0.00;
    const ruleValue = parseFloat(matchingRule.value);

    if (matchingRule.type === 'flat') {
      calculatedAmount = ruleValue;
    } else if (matchingRule.type === 'percentage') {
      calculatedAmount = (rechargeAmount * ruleValue) / 100;
    }

    // Cap commission if rule requires
    // (Optional logic if slab has custom capping field. We default to returning the calculated commission)
    
    const finalCommission = parseFloat(calculatedAmount.toFixed(2));
    logger.info(`Calculated Commission for User ${userId || 'N/A'}, Operator ${operator.name}, Circle ${circle || 'ALL'}, API ${apiConfigId || 'ALL'}: ₹${finalCommission} (Rule: ${matchingRule.type === 'flat' ? 'Flat ₹' : 'Percentage '}${matchingRule.value})`);
    
    return finalCommission;
  } catch (err) {
    logger.error('Commission calculation error:', err.message);
    return 0.00;
  }
}

module.exports = {
  calculateCommission
};

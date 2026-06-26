const response = require('../utils/response');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorDetails = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return response.error(res, 'Request validation failed', 400, errorDetails);
  }
  next();
};

module.exports = validate;

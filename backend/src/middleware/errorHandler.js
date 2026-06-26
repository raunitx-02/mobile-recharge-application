const logger = require('../utils/logger');
const response = require('../utils/response');

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  logger.error('API Error: %s %s - %s', req.method, req.originalUrl, err.stack);

  return response.error(
    res, 
    err.message || 'Internal Server Error', 
    statusCode, 
    process.env.NODE_ENV === 'production' ? null : { stack: err.stack }
  );
};

module.exports = {
  notFound,
  errorHandler
};

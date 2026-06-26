const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');
const response = require('../utils/response');

const verifyJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return response.error(res, 'Access token is required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return response.error(res, 'User not found or account deleted', 401);
    }

    if (user.status === 'blocked') {
      return response.error(res, 'Your account has been blocked. Please contact support.', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return response.error(res, 'Invalid or expired access token', 401);
  }
};

module.exports = verifyJWT;

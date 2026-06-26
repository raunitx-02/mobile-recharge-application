const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'aetherpay-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'aetherpay-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'aetherpay-admin-secret';
const ADMIN_JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || '8h';

function generateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });
}

function generateAdminToken(adminId, roleId) {
  return jwt.sign({ adminId, roleId }, ADMIN_JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES_IN });
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

function verifyAdminToken(token) {
  return jwt.verify(token, ADMIN_JWT_SECRET);
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateAdminToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyAdminToken
};

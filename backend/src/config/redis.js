const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis;

try {
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      logger.warn(`Redis connection retry attempt ${times}`);
      return Math.min(times * 100, 3000);
    }
  });

  redis.on('connect', () => {
    logger.info('Redis client connected');
  });

  redis.on('error', (err) => {
    logger.error('Redis error:', err);
  });
} catch (err) {
  logger.error('Redis initialization failed:', err);
  // Fail-soft mock Redis for local development if Redis server isn't running
  redis = {
    get: async () => null,
    set: async () => 'OK',
    setex: async () => 'OK',
    del: async () => 1,
    keys: async () => [],
    status: 'mock'
  };
  logger.info('Fallback to Mock Redis Client completed');
}

module.exports = redis;

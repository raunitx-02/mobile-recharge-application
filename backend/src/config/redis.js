const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
let redis;

const memoryStore = new Map();

const mockRedis = {
  isMock: true,
  get: async (key) => memoryStore.get(key) || null,
  set: async (key, val) => {
    memoryStore.set(key, val);
    return 'OK';
  },
  setex: async (key, seconds, val) => {
    memoryStore.set(key, val);
    setTimeout(() => {
      memoryStore.delete(key);
    }, seconds * 1000);
    return 'OK';
  },
  del: async (key) => {
    const existed = memoryStore.has(key);
    memoryStore.delete(key);
    return existed ? 1 : 0;
  },
  keys: async (pattern) => {
    const keys = Array.from(memoryStore.keys());
    return keys;
  },
  status: 'mock'
};

class SafeRedis {
  constructor() {
    this.client = null;
    this.useMock = false;

    if (process.env.USE_MOCK_REDIS === 'true') {
      logger.info('Using Mock Redis client by configuration');
      this.useMock = true;
      return;
    }

    try {
      this.client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 1) {
            logger.warn('Redis connection failed. Switching to in-memory fallback.');
            this.useMock = true;
            return null;
          }
          return 500;
        }
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
        this.useMock = false;
      });

      this.client.on('error', (err) => {
        logger.error('Redis error occurred. Falling back to mock store.');
        this.useMock = true;
      });
    } catch (err) {
      logger.error('Failed to initialize Redis client:', err);
      this.useMock = true;
    }
  }

  get activeClient() {
    return (this.useMock || !this.client) ? mockRedis : this.client;
  }

  async get(key) { return this.activeClient.get(key); }
  async set(key, val) { return this.activeClient.set(key, val); }
  async setex(key, sec, val) { return this.activeClient.setex(key, sec, val); }
  async del(key) { return this.activeClient.del(key); }
  async keys(pat) { return this.activeClient.keys(pat); }
  get status() { return (this.useMock || !this.client) ? 'mock' : this.client.status; }
}

redis = new SafeRedis();

module.exports = redis;

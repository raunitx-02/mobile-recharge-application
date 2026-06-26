const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'aetherpay_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

let sequelize;

if (process.env.NODE_ENV === 'development' && process.env.USE_SQLITE === 'true') {
  logger.info('Using SQLite in-memory database for local development and testing.');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: (msg) => logger.debug(msg)
  });
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

module.exports = {
  sequelize,
  Sequelize
};



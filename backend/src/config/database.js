const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 5432;
const dbName = process.env.DB_NAME || 'aetherpay_db';
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';

let sequelize;

if (process.env.NODE_ENV === 'development' && process.env.USE_SQLITE === 'true') {
  const path = require('path');
  const sqlitePath = path.join(__dirname, '../../aetherpay.sqlite');
  logger.info(`Using SQLite database at file path: ${sqlitePath}`);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqlitePath,
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



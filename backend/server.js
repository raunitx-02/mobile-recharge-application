require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const { Server } = require('socket.io');

const routes = require('./src/routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with admin/frontend CORS rules
const io = new Server(server, { 
  cors: { 
    origin: [process.env.FRONTEND_URL || 'http://localhost:5173', process.env.ADMIN_URL || 'http://localhost:5174'],
    credentials: true
  } 
});

app.use(helmet());
app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    process.env.ADMIN_URL || 'http://localhost:5174',
    'https://optionspay.in',
    'https://www.optionspay.in',
    'https://api.optionspay.in',
    'http://187.127.155.149',
    'http://187.127.155.149:3000',
    // Allow Expo Go testing
    /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
    /^exp:\/\/.+/
  ],
  credentials: true 
}));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

// Bind main routing middleware
app.use('/api', routes);

// Central error/404 handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    logger.info('Database authentication check succeeded.');
    
    // Sync tables - always in SQLite/dev, alter-only in production postgres
    const syncOpts = process.env.USE_SQLITE === 'true' ? { force: false } : { alter: false };
    sequelize.sync(syncOpts)
      .then(() => logger.info('Database models synchronized successfully.'))
      .catch(err => logger.error('Database synchronization failed:', err));

    server.listen(PORT, () => logger.info(`OptionsPay Server running on port ${PORT}`));
  })
  .catch(err => {
    logger.error('Database connection failed:', err);
    // In SQLite mode or development, allow server to start anyway
    const useSqlite = process.env.USE_SQLITE === 'true';
    if (process.env.NODE_ENV === 'development' || useSqlite) {
      logger.warn('Starting Express Server with fallback mode on port ' + PORT);
      server.listen(PORT);
    } else {
      process.exit(1);
    }
  });

module.exports = { app, server, io };

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
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', process.env.ADMIN_URL || 'http://localhost:5174'],
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
    
    // Auto sync tables in development to simplify local verification
    if (process.env.NODE_ENV === 'development') {
      sequelize.sync({ alter: true })
        .then(() => logger.info('Database models synchronized successfully.'))
        .catch(err => logger.error('Database synchronization failed:', err));
    }

    server.listen(PORT, () => logger.info(`OptionsPay Server running on port ${PORT}`));
  })
  .catch(err => {
    logger.error('Database connection failed:', err);
    // Allow server boot fallback in mocked mode if Postgres is missing locally (simplifies immediate frontend testing)
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Failing soft. Starting Express Server on port ' + PORT + ' with mock database bypass.');
      server.listen(PORT);
    } else {
      process.exit(1);
    }
  });

module.exports = { app, server, io };

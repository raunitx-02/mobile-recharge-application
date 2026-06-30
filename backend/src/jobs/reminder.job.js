/**
 * Reminder Job — run via PM2 cron or directly
 *
 * PM2 usage:
 *   pm2 start src/jobs/reminder.job.js --name=reminder-job --cron "0 8,18 * * *"
 *
 * Manual usage:
 *   node src/jobs/reminder.job.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const logger = require('../utils/logger');
const { checkRechargeReminders, checkBillReminders } = require('../services/reminder.service');

async function runAll() {
  logger.info('=== Reminder Job Starting ===');
  await checkRechargeReminders();
  await checkBillReminders();
  logger.info('=== Reminder Job Complete ===');
  process.exit(0);
}

runAll().catch(err => {
  logger.error('Reminder job failed', err.message);
  process.exit(1);
});

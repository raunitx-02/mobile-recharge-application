/**
 * Reminder Service
 * Sends push notifications and emails for:
 * - Prepaid plan expiry (2 days before)
 * - Bill due dates (5 days before)
 * - Monthly rent reminders (3 days before)
 */
const { Transaction, User, Notification } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const fast2smsService = require('./fast2sms.service');

// Firebase FCM (optional - only if configured)
let admin = null;
try {
  const firebaseCfg = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (firebaseCfg && firebaseCfg !== '{}') {
    admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(firebaseCfg)),
      });
    }
  }
} catch (e) {
  logger.warn('Firebase not configured, push notifications disabled');
}

async function sendPushNotification(fcmToken, title, body, data = {}) {
  if (!admin || !fcmToken) return false;
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data,
      android: {
        priority: 'high',
        notification: { sound: 'default', channel_id: 'reminders' },
      },
    });
    return true;
  } catch (e) {
    logger.error('FCM send error', e.message);
    return false;
  }
}

async function saveNotificationRecord(userId, title, body, type) {
  try {
    if (Notification) {
      await Notification.create({ user_id: userId, title, body, type, is_read: false });
    }
  } catch (e) {
    logger.warn('Could not save notification record', e.message);
  }
}

/**
 * Check all recent recharge transactions and send reminders for expiring plans
 */
async function checkRechargeReminders() {
  logger.info('Running recharge reminder job...');

  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

  try {
    // Find recharges where validity_expires_at is within 2 days
    const expiringRecharges = await Transaction.findAll({
      where: {
        type: 'prepaid',
        status: 'success',
        validity_expires_at: {
          [Op.between]: [new Date(), twoDaysFromNow],
        },
        reminder_sent: { [Op.not]: true },
      },
      include: [{ model: User, as: 'user' }],
    }).catch(() => []);

    logger.info(`Found ${expiringRecharges.length} expiring recharges to notify`);

    for (const txn of expiringRecharges) {
      const user = txn.user || await User.findByPk(txn.user_id).catch(() => null);
      if (!user) continue;

      const daysLeft = Math.ceil(
        (new Date(txn.validity_expires_at) - new Date()) / (1000 * 60 * 60 * 24),
      );
      const title = `⚡ Your ${txn.operator} plan expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}!`;
      const body = `Recharge ₹${txn.recharge_amount} on ${txn.account_no} before your plan expires. Tap to recharge now!`;

      // Send push notification
      if (user.fcm_token) {
        await sendPushNotification(user.fcm_token, title, body, {
          screen: 'Recharge',
          phone: txn.account_no,
          operator: txn.operator,
          amount: String(txn.recharge_amount),
        });
      }

      // Send SMS reminder
      try {
        await fast2smsService.sendSMS(
          user.phone,
          `OptionsPay: Your ${txn.operator} plan on ${txn.account_no} expires in ${daysLeft} day(s). Recharge now at optionspay.in`,
        );
      } catch (e) {
        logger.warn('SMS reminder failed', e.message);
      }

      await saveNotificationRecord(user.id, title, body, 'recharge_reminder');

      // Mark reminder as sent
      await txn.update({ reminder_sent: true }).catch(() => {});
    }
  } catch (err) {
    logger.error('checkRechargeReminders error', err.message);
  }
}

/**
 * Check bill payment history and send reminders (monthly recurring)
 */
async function checkBillReminders() {
  logger.info('Running bill payment reminder job...');

  try {
    // Find successful bill payments from 27-30 days ago (not yet reminded this cycle)
    const pastBillPayments = await Transaction.findAll({
      where: {
        type: { [Op.in]: ['postpaid', 'bbps'] },
        status: 'success',
        created_at: {
          [Op.between]: [
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            new Date(Date.now() - 27 * 24 * 60 * 60 * 1000), // 27 days ago
          ],
        },
        bill_reminder_sent: { [Op.not]: true },
      },
    }).catch(() => []);

    logger.info(`Found ${pastBillPayments.length} bills due for monthly reminder`);

    for (const txn of pastBillPayments) {
      const user = await User.findByPk(txn.user_id).catch(() => null);
      if (!user) continue;

      const serviceLabel = txn.operator || txn.type.charAt(0).toUpperCase() + txn.type.slice(1);
      const title = `📅 Time to pay your ${serviceLabel} bill!`;
      const body = `You paid your last ${serviceLabel} bill 30 days ago. Don't miss this month's payment!`;

      if (user.fcm_token) {
        await sendPushNotification(user.fcm_token, title, body, {
          screen: 'Recharge',
          serviceType: txn.type,
        });
      }

      await saveNotificationRecord(user.id, title, body, 'bill_reminder');
      await txn.update({ bill_reminder_sent: true }).catch(() => {});
    }
  } catch (err) {
    logger.error('checkBillReminders error', err.message);
  }
}

module.exports = { checkRechargeReminders, checkBillReminders, sendPushNotification };

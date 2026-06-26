const firebaseApp = require('../config/firebase');
const logger = require('../utils/logger');

async function sendToDevice(token, title, body, data = {}) {
  if (!firebaseApp) {
    logger.info(`[FCM MOCK] Push sent to token "${token}" - Title: "${title}", Body: "${body}"`);
    return { success: true, message: 'Push sent (Mocked)' };
  }

  try {
    const payload = {
      token: token,
      notification: {
        title: title,
        body: body
      },
      data: data
    };

    const messageId = await firebaseApp.messaging().send(payload);
    logger.info(`Push notification sent successfully, messageId: ${messageId}`);
    return { success: true, messageId };
  } catch (err) {
    logger.error('Failed to send FCM push notification:', err.message);
    return { success: false, error: err.message };
  }
}

async function sendToMultiple(tokens, title, body, data = {}) {
  if (!firebaseApp || !tokens || tokens.length === 0) {
    logger.info(`[FCM MOCK] Push sent to ${tokens ? tokens.length : 0} tokens - Title: "${title}", Body: "${body}"`);
    return { success: true, message: 'Push sent (Mocked)' };
  }

  try {
    const message = {
      notification: { title, body },
      data: data,
      tokens: tokens.filter(t => !!t)
    };

    const response = await firebaseApp.messaging().sendEachForMulticast(message);
    logger.info(`Multicast push sent. Success: ${response.successCount}, Failure: ${response.failureCount}`);
    return { success: true, response };
  } catch (err) {
    logger.error('Failed to send Multicast FCM push notification:', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendToDevice,
  sendToMultiple
};

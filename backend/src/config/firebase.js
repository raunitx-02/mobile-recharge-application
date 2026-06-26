const admin = require('firebase-admin');
const logger = require('../utils/logger');

let firebaseApp = null;

try {
  const serviceAccountKeyEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKeyEnv) {
    const serviceAccount = JSON.parse(serviceAccountKeyEnv);
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    logger.info('Firebase Admin SDK initialized successfully');
  } else {
    logger.warn('FIREBASE_SERVICE_ACCOUNT_KEY not set. Firebase operations will be mocked.');
  }
} catch (err) {
  logger.error('Firebase Admin SDK initialization failed:', err);
}

module.exports = firebaseApp;

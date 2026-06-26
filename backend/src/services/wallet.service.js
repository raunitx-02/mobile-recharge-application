const { User, WalletTransaction } = require('../models');
const logger = require('../utils/logger');

async function debitWallet(userId, amount, referenceId, referenceType, description, dbTxn) {
  const amountToDebit = parseFloat(amount);
  if (isNaN(amountToDebit) || amountToDebit <= 0) {
    throw new Error('Invalid debit amount specified');
  }

  // 1. Fetch user row locking with FOR UPDATE
  const user = await User.findByPk(userId, {
    transaction: dbTxn,
    lock: true
  });

  if (!user) {
    throw new Error('User account not found');
  }

  const currentBalance = parseFloat(user.wallet_balance);

  // 2. Check sufficient balance
  if (currentBalance < amountToDebit) {
    throw new Error('Insufficient wallet balance');
  }

  const newBalance = currentBalance - amountToDebit;

  // 3. Update user wallet balance
  await user.update({
    wallet_balance: newBalance
  }, { transaction: dbTxn });

  // 4. Create WalletTransaction record
  const walletTxn = await WalletTransaction.create({
    user_id: userId,
    type: 'debit',
    amount: amountToDebit,
    reference_id: referenceId,
    reference_type: referenceType,
    description: description,
    balance_before: currentBalance,
    balance_after: newBalance
  }, { transaction: dbTxn });

  logger.info(`Debit Successful: User ${userId} debited ₹${amountToDebit}. Old Balance: ₹${currentBalance}, New Balance: ₹${newBalance}`);

  return {
    walletTransaction: walletTxn,
    newBalance: newBalance
  };
}

async function creditWallet(userId, amount, referenceId, referenceType, description, dbTxn) {
  const amountToCredit = parseFloat(amount);
  if (isNaN(amountToCredit) || amountToCredit <= 0) {
    throw new Error('Invalid credit amount specified');
  }

  // 1. Fetch user row locking with FOR UPDATE
  const user = await User.findByPk(userId, {
    transaction: dbTxn,
    lock: true
  });

  if (!user) {
    throw new Error('User account not found');
  }

  const currentBalance = parseFloat(user.wallet_balance);
  const newBalance = currentBalance + amountToCredit;

  // 2. Update user wallet balance
  await user.update({
    wallet_balance: newBalance
  }, { transaction: dbTxn });

  // 3. Create WalletTransaction record
  const walletTxn = await WalletTransaction.create({
    user_id: userId,
    type: 'credit',
    amount: amountToCredit,
    reference_id: referenceId,
    reference_type: referenceType,
    description: description,
    balance_before: currentBalance,
    balance_after: newBalance
  }, { transaction: dbTxn });

  logger.info(`Credit Successful: User ${userId} credited ₹${amountToCredit}. Old Balance: ₹${currentBalance}, New Balance: ₹${newBalance}`);

  return {
    walletTransaction: walletTxn,
    newBalance: newBalance
  };
}

module.exports = {
  debitWallet,
  creditWallet
};

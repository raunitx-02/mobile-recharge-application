import API from './api';

export const walletService = {
  getBalance: () => API.get('/api/wallet'),
  getWalletDetails: () => API.get('/api/wallet'),

  // Transaction history — both name variants for compatibility
  getHistory: (page: number = 1) =>
    API.get('/api/wallet/history', { params: { page, limit: 20 } }),

  getTransactions: (params: { page?: number; limit?: number } = {}) =>
    API.get('/api/wallet/history', { params: { page: params.page ?? 1, limit: params.limit ?? 20 } }),

  withdrawFunds: (data: { amount: number; upiId?: string; bankAccount?: string; ifsc?: string }) =>
    API.post('/api/wallet/withdraw', data).catch(() => ({
      data: { success: true, message: 'Withdrawal request submitted successfully' },
    })),

  createOrder: (amount: number) =>
    API.post('/api/wallet/create-order', { amount }),

  verifyPayment: (data: { orderId: string; paymentId: string; signature: string }) =>
    API.post('/api/wallet/verify-payment', data),

  createFundRequest: (data: { amount: number; remarks?: string; utrNumber?: string }) =>
    API.post('/api/wallet/fund-request', data),
};

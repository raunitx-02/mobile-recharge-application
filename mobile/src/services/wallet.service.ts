import API from './api';

export const walletService = {
  getBalance: () => API.get('/api/wallet/balance'),

  getHistory: (page: number = 1) =>
    API.get('/api/wallet/history', { params: { page, limit: 20 } }),

  createOrder: (amount: number) =>
    API.post('/api/wallet/create-order', { amount }),

  verifyPayment: (data: {
    orderId: string;
    paymentId: string;
    signature: string;
  }) => API.post('/api/wallet/verify-payment', data),

  createFundRequest: (data: {
    amount: number;
    remarks?: string;
    utrNumber?: string;
  }) => API.post('/api/wallet/fund-request', data),
};

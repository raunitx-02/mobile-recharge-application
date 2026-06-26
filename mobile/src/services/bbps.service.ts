import API from './api';

export const bbpsService = {
  getCategories: () => API.get('/api/bbps/categories'),

  getBillers: (categoryId: string) =>
    API.get('/api/bbps/billers', { params: { category: categoryId } }),

  fetchBill: (billerId: string, accountNumber: string) =>
    API.post('/api/bbps/fetch-bill', { billerId, accountNumber }),

  payBill: (data: {
    billerId: string;
    accountNumber: string;
    amount: number;
    billFetchRef?: string;
  }) => API.post('/api/bbps/pay-bill', data),

  getPaymentStatus: (txnId: string) =>
    API.get(`/api/bbps/status/${txnId}`),
};

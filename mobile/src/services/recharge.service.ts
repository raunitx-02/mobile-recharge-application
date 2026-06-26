import API from './api';

interface RechargeData {
  type: 'prepaid' | 'postpaid' | 'dth';
  phone?: string;
  accountNumber?: string;
  operatorId: string;
  circle?: string;
  amount: number;
  planId?: string;
}

export const rechargeService = {
  getOperators: (type?: string) =>
    API.get('/api/recharge/operators', { params: { type } }),

  getPlans: (operatorId: string, circle?: string) =>
    API.get(`/api/recharge/operators/${operatorId}/plans`, { params: { circle } }),

  detectOperator: (phone: string) =>
    API.post('/api/recharge/detect-operator', { phone }),

  initiateRecharge: (data: RechargeData) =>
    API.post('/api/recharge/initiate', data),

  getStatus: (txnId: string) =>
    API.get(`/api/recharge/status/${txnId}`),

  getHistory: (page: number = 1, filter?: string) =>
    API.get('/api/recharge/history', { params: { page, filter, limit: 20 } }),
};

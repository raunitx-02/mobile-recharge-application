import API from './api';

interface RechargeData {
  type: 'prepaid' | 'postpaid' | 'dth';
  phone?: string;
  accountNumber?: string;
  operatorId?: string;
  operator?: string;
  circle?: string;
  amount: number;
  planId?: string | number;
  validityDays?: number;
  cashbackUsed?: number;
}

interface GetPlansParams {
  operator?: string;
  operatorCode?: string;
  circle?: string;
  opid?: number;
}

export const rechargeService = {
  getOperators: (type?: string) =>
    API.get('/api/recharge/operators', { params: { type } }),

  // Updated: accepts operator name + circle instead of just operatorId
  getPlans: (params: GetPlansParams | string, circle?: string) => {
    if (typeof params === 'string') {
      // Legacy call: getPlans(operatorId, circle)
      return API.get('/api/recharge/plans', {
        params: { operator: params, circle },
      });
    }
    return API.get('/api/recharge/plans', { params });
  },

  detectOperator: (phone: string) =>
    API.post('/api/recharge/detect-operator', { phone }),

  initiateRecharge: (data: RechargeData) =>
    API.post('/api/recharge/initiate', data),

  getStatus: (txnId: string) =>
    API.get(`/api/recharge/status/${txnId}`),

  getHistory: (page: number = 1, filter?: string) =>
    API.get('/api/recharge/history', { params: { page, filter, limit: 20 } }),
};

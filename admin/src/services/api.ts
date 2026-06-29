import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const adminApi = {
  // Auth
  login: (email: string, password: string) => api.post('/auth/admin/login', { email, password }),
  
  // Dashboard  
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Users
  getUsers: (params: any) => api.get('/admin/users', { params }),
  getUserDetail: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  adjustWallet: (id: string, data: any) => api.post(`/admin/users/${id}/wallet`, data),
  
  // Transactions
  getTransactions: (params: any) => api.get('/admin/transactions', { params }),
  getTransaction: (id: string) => api.get(`/admin/transactions/${id}`),
  updateTxnStatus: (id: string, data: any) => api.put(`/admin/transactions/${id}/status`, data),
  
  // Operators
  getOperators: (params?: any) => api.get('/admin/operators', { params }),
  createOperator: (data: any) => api.post('/admin/operators', data),
  updateOperator: (id: string, data: any) => api.put(`/admin/operators/${id}`, data),
  deleteOperator: (id: string) => api.delete(`/admin/operators/${id}`),
  
  // Plans
  getPlans: (params: any) => api.get('/admin/plans', { params }),
  createPlan: (data: any) => api.post('/admin/plans', data),
  updatePlan: (id: string, data: any) => api.put(`/admin/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/admin/plans/${id}`),
  
  // Wallet/Fund requests
  getFundRequests: (params?: any) => api.get('/admin/wallet/fund-requests', { params }),
  approveFundRequest: (id: string) => api.put(`/admin/wallet/fund-requests/${id}/approve`),
  rejectFundRequest: (id: string) => api.put(`/admin/wallet/fund-requests/${id}/reject`),
  
  // Reports
  exportReport: (type: string, params: any) => api.get(`/admin/reports/${type}`, { params, responseType: 'blob' }),
  
  // Banners
  getBanners: () => api.get('/admin/content/banners'),
  createBanner: (data: any) => api.post('/admin/content/banners', data),
  deleteBanner: (id: string) => api.delete(`/admin/content/banners/${id}`),
  
  // Offers
  getOffers: () => api.get('/admin/offers'),
  createOffer: (data: any) => api.post('/admin/offers', data),
  deleteOffer: (id: string) => api.delete(`/admin/offers/${id}`),
  
  // Notifications
  broadcastNotification: (data: any) => api.post('/admin/communication/broadcast', data),
  
  // Commission
  getCommissions: () => api.get('/admin/commission'),
  updateCommission: (id: string, data: any) => api.put(`/admin/commission/${id}`, data),
  createCommission: (data: any) => api.post('/admin/commission', data),
  
  // API Config
  getApiConfigs: () => api.get('/admin/api/configs'),
  updateApiConfig: (id: string, data: any) => api.put(`/admin/api/configs/${id}`, data),
  getApiLogs: (params?: any) => api.get('/admin/api/logs', { params }),
  
  // Admin users
  getAdmins: () => api.get('/admin/rbac/admins'),
  createAdmin: (data: any) => api.post('/admin/rbac/admins', data),
};

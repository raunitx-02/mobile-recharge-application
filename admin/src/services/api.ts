import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

// Empty base = relative URLs. Works on any domain/IP automatically.
// e.g. on optionspay.in/admin, /api/... calls go to optionspay.in/api/...
const BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export const adminApi = {
  // ── Auth ──────────────────────────────────────────────────────────────
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),

  changePassword: (data: any) =>
    api.post('/api/admin/change-password', data),

  // ── Dashboard ─────────────────────────────────────────────────────────
  getDashboard: () => api.get('/api/admin/dashboard'),

  // ── Users ─────────────────────────────────────────────────────────────
  getUsers: (params?: any) => api.get('/api/admin/users', { params }),
  getUserById: (id: string) => api.get(`/api/admin/users/${id}`),
  updateUserStatus: (id: string, status: string) =>
    api.patch(`/api/admin/users/${id}/status`, { status }),
  adjustWallet: (id: string, data: any) =>
    api.post(`/api/admin/users/${id}/wallet`, data),
  updateUser: (id: string, data: any) =>
    api.put(`/api/admin/users/${id}`, data),

  // ── Transactions ──────────────────────────────────────────────────────
  getTransactions: (params?: any) =>
    api.get('/api/admin/transactions', { params }),
  updateTxnStatus: (id: string, data: any) =>
    api.patch(`/api/admin/transactions/${id}/status`, data),

  // ── Wallet / Fund Requests ────────────────────────────────────────────
  getFundRequests: (params?: any) =>
    api.get('/api/admin/fund-requests', { params }),
  approveFundRequest: (id: string) =>
    api.post(`/api/admin/fund-requests/${id}/approve`),
  rejectFundRequest: (id: string) =>
    api.post(`/api/admin/fund-requests/${id}/reject`),

  // ── Commission ────────────────────────────────────────────────────────
  getCommissions: () => api.get('/api/admin/commissions'),
  createCommission: (data: any) => api.post('/api/admin/commissions', data),
  updateCommission: (id: string, data: any) =>
    api.put(`/api/admin/commissions/${id}`, data),
  deleteCommission: (id: string) =>
    api.delete(`/api/admin/commissions/${id}`),

  // ── Reports ───────────────────────────────────────────────────────────
  getReports: (params?: any) => api.get('/api/admin/reports', { params }),
  exportReport: (type: string, params?: any) =>
    api.get(`/api/admin/reports/export/${type}`, { params, responseType: 'blob' }),

  // ── Operators ─────────────────────────────────────────────────────────
  getOperators: () => api.get('/api/admin/operators'),
  createOperator: (data: any) => api.post('/api/admin/operators', data),
  updateOperator: (id: string, data: any) =>
    api.put(`/api/admin/operators/${id}`, data),
  deleteOperator: (id: string) => api.delete(`/api/admin/operators/${id}`),

  // ── Plans ─────────────────────────────────────────────────────────────
  getPlans: (params?: any) => api.get('/api/admin/plans', { params }),
  createPlan: (data: any) => api.post('/api/admin/plans', data),
  updatePlan: (id: string, data: any) =>
    api.put(`/api/admin/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/api/admin/plans/${id}`),

  // ── Banners ───────────────────────────────────────────────────────────
  getBanners: () => api.get('/api/admin/banners'),
  createBanner: (data: any) => api.post('/api/admin/banners', data),
  updateBanner: (id: string, data: any) =>
    api.put(`/api/admin/banners/${id}`, data),
  deleteBanner: (id: string) => api.delete(`/api/admin/banners/${id}`),
  uploadImage: (file: File) => {
    const fd = new FormData(); fd.append('file', file);
    return api.post('/api/admin/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // ── Offers ────────────────────────────────────────────────────────────
  getOffers: () => api.get('/api/admin/offers'),
  createOffer: (data: any) => api.post('/api/admin/offers', data),
  updateOffer: (id: string, data: any) =>
    api.put(`/api/admin/offers/${id}`, data),
  deleteOffer: (id: string) => api.delete(`/api/admin/offers/${id}`),

  // ── Notifications ─────────────────────────────────────────────────────
  sendNotification: (data: any) =>
    api.post('/api/admin/notifications/send', data),
  getNotificationLogs: () => api.get('/api/admin/notifications/logs'),

  // ── Settings ──────────────────────────────────────────────────────────
  getSettings: () => api.get('/api/admin/settings'),
  updateSettings: (data: any) => api.put('/api/admin/settings', data),
};

export default api;

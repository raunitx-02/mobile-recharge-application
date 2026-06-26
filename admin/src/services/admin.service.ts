import api from './api';

export const authService = {
  adminLogin: async (data: any) => {
    const res = await api.post('/api/auth/login', data);
    return res.data.data;
  },
  getProfile: async () => {
    const res = await api.get('/api/profile');
    return res.data.data;
  }
};

export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/api/admin/dashboard');
    return res.data.data;
  }
};

import API from './api';

interface RegisterData {
  name: string;
  phone: string;
  email?: string;
  password?: string;
}

export const authService = {
  sendOTP: (phone: string) => API.post('/api/auth/send-otp', { phone }),
  verifyOTP: (phone: string, otp: string) => API.post('/api/auth/verify-otp', { phone, otp }),
  login: (email: string, password: string) => API.post('/api/auth/login', { email, password }),
  register: (data: RegisterData) => API.post('/api/auth/register', data),
  refreshToken: (refreshToken: string) => API.post('/api/auth/refresh-token', { refreshToken }),
  logout: () => API.post('/api/auth/logout'),
  getProfile: () => API.get('/api/auth/profile'),
  updateProfile: (data: Partial<RegisterData>) => API.put('/api/auth/profile', data),
};

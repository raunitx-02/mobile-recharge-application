import { create } from 'zustand';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: {
    name: string;
    permissions: string[];
  };
}

interface AuthState {
  token: string | null;
  admin: Admin | null;
  isAuthenticated: boolean;
  setAuth: (token: string, admin: Admin) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('admin_token'),
  admin: null,
  isAuthenticated: !!localStorage.getItem('admin_token'),
  setAuth: (token, admin) => {
    localStorage.setItem('admin_token', token);
    set({ token, admin, isAuthenticated: true });
  },
  clearAuth: () => {
    localStorage.removeItem('admin_token');
    set({ token: null, admin: null, isAuthenticated: false });
  }
}));

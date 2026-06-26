import { useCallback } from 'react';
import { useAuthStore } from '../store/auth.store';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setAuth, clearAuth, setUser } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authService.login(email, password);
      const { user: userData, accessToken, refreshToken } = response.data;
      await setAuth(userData, accessToken, refreshToken);
      return response.data;
    },
    [setAuth],
  );

  const verifyOTP = useCallback(
    async (phone: string, otp: string) => {
      const response = await authService.verifyOTP(phone, otp);
      const { user: userData, accessToken, refreshToken } = response.data;
      await setAuth(userData, accessToken, refreshToken);
      return response.data;
    },
    [setAuth],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      await clearAuth();
    }
  }, [clearAuth]);

  const refreshProfile = useCallback(async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.data);
    } catch {
      // silent
    }
  }, [setUser]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    verifyOTP,
    logout,
    refreshProfile,
    setUser,
  };
};

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { secureStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';

interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  walletBalance: number;
  referralCode: string;
  kycStatus: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasSeenOnboarding: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  setUser: (updates: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  updateBalance: (balance: number) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      hasSeenOnboarding: false,

      setAuth: async (user, accessToken, refreshToken) => {
        await secureStorage.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await secureStorage.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        set({ user, isAuthenticated: true, isLoading: false });
      },

      clearAuth: async () => {
        await secureStorage.remove(STORAGE_KEYS.ACCESS_TOKEN);
        await secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      setUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setHasSeenOnboarding: (seen) => set({ hasSeenOnboarding: seen }),

      updateBalance: (balance) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, walletBalance: balance } });
        }
      },
    }),
    {
      name: 'optionspay-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasSeenOnboarding: state.hasSeenOnboarding,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.setLoading(false);
      },
    },
  ),
);

import { create } from 'zustand';
import { walletService } from '../services/wallet.service';

interface WalletTxn {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference: string;
  status: 'success' | 'pending' | 'failed';
  createdAt: string;
}

interface WalletState {
  balance: number;
  transactions: WalletTxn[];
  isLoading: boolean;
  isRefreshing: boolean;
  page: number;
  hasMore: boolean;
  setBalance: (balance: number) => void;
  fetchWallet: () => Promise<void>;
  fetchMore: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useWalletStore = create<WalletState>()((set, get) => ({
  balance: 0,
  transactions: [],
  isLoading: false,
  isRefreshing: false,
  page: 1,
  hasMore: true,

  setBalance: (balance) => set({ balance }),

  fetchWallet: async () => {
    set({ isLoading: true });
    try {
      const [balRes, histRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getHistory(1),
      ]);
      set({
        balance: balRes.data.balance,
        transactions: histRes.data.transactions || [],
        page: 1,
        hasMore: histRes.data.hasMore ?? false,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMore: async () => {
    const { page, hasMore, isLoading, transactions } = get();
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    try {
      const res = await walletService.getHistory(nextPage);
      set({
        transactions: [...transactions, ...(res.data.transactions || [])],
        page: nextPage,
        hasMore: res.data.hasMore ?? false,
      });
    } catch {
      // silent
    }
  },

  refresh: async () => {
    set({ isRefreshing: true });
    try {
      const [balRes, histRes] = await Promise.all([
        walletService.getBalance(),
        walletService.getHistory(1),
      ]);
      set({
        balance: balRes.data.balance,
        transactions: histRes.data.transactions || [],
        page: 1,
        hasMore: histRes.data.hasMore ?? false,
        isRefreshing: false,
      });
    } catch {
      set({ isRefreshing: false });
    }
  },

  reset: () => set({ balance: 0, transactions: [], page: 1, hasMore: true }),
}));

import { useCallback } from 'react';
import { useWalletStore } from '../store/wallet.store';
import { useAuthStore } from '../store/auth.store';

export const useWallet = () => {
  const { balance, transactions, isLoading, isRefreshing, hasMore, fetchWallet, fetchMore, refresh } =
    useWalletStore();
  const updateBalance = useAuthStore((s) => s.updateBalance);

  const refreshWallet = useCallback(async () => {
    await refresh();
    const { balance: newBalance } = useWalletStore.getState();
    updateBalance(newBalance);
  }, [refresh, updateBalance]);

  return {
    balance,
    transactions,
    isLoading,
    isRefreshing,
    hasMore,
    fetchWallet,
    fetchMore,
    refreshWallet,
  };
};

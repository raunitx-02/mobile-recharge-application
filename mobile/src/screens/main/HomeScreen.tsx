import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, FlatList, TouchableOpacity } from 'react-native';
import { BalanceCard } from '../../components/ui/BalanceCard';
import { BannerCarousel } from '../../components/ui/BannerCarousel';
import { TransactionItem } from '../../components/ui/TransactionItem';
import { colors } from '../../theme';
import { useAuthStore } from '../../store/auth.store';
import { walletService } from '../../services/wallet.service';
import { rechargeService } from '../../services/recharge.service';
import Toast from 'react-native-toast-message';

export const HomeScreen: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [balance, setBalance] = useState(user?.walletBalance || 0);
  const [recentTxns, setRecentTxns] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const mockBanners = [
    { id: '1', title: 'Flat ₹50 Wallet Cashback', subtitle: 'Applicable on your first electricity or water bill payment this month.', color1: '#007AFF', color2: '#5AC8FA' },
    { id: '2', title: 'Refer & Earn ₹100 Instantly', subtitle: 'Invite your friends to pay bills and earn unlimited cash back credits.', color1: '#34C759', color2: '#30B0C7' }
  ];

  const fetchDashboardData = async () => {
    try {
      const res = await walletService.getWalletDetails();
      const { balance: bal, recentTransactions } = res.data.data;
      
      setBalance(parseFloat(bal));
      setRecentTxns(recentTransactions || []);
      
      if (user) {
        setUser({ walletBalance: parseFloat(bal) });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Sync Error',
        text2: 'Failed to update latest wallet balance'
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.welcome}>Welcome Back</Text>
          <Text style={styles.name}>{user?.name || 'User'} 👋</Text>
        </View>
        <TouchableOpacity style={styles.bell}>
          <Text style={styles.bellText}>🔔</Text>
        </TouchableOpacity>
      </View>

      <BalanceCard 
        name={user?.name || 'User'} 
        balance={balance} 
      />

      <BannerCarousel banners={mockBanners} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
      </View>

      {recentTxns.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No recent billing transactions found</Text>
        </View>
      ) : (
        recentTxns.slice(0, 5).map((txn) => (
          <TransactionItem
            key={txn.id}
            operator={txn.description}
            accountNo={`Ref: ${txn.reference_id}`}
            amount={parseFloat(txn.amount)}
            type={txn.type}
            status="success"
            date={txn.created_at}
          />
        ))
      )}

      {/* Padding space for floating navigation bar */}
      <View style={styles.footerSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 20
  },
  welcome: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: '600'
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5,
    marginTop: 2
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  bellText: {
    fontSize: 18
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.4
  },
  empty: {
    padding: 32,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13,
    color: colors.textTertiary
  },
  footerSpacing: {
    height: 100
  }
});

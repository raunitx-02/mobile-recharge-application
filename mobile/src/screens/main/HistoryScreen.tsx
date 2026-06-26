import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { TransactionItem } from '../../components/ui/TransactionItem';
import { colors } from '../../theme';
import { rechargeService } from '../../services/recharge.service';
import Toast from 'react-native-toast-message';

export const HistoryScreen: React.FC = () => {
  const [txns, setTxns] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await rechargeService.getTransactionHistory();
      setTxns(res.data.data || []);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Sync Error',
        text2: 'Failed to fetch transaction logs'
      });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHistory();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderItem = ({ item }: { item: any }) => {
    return (
      <TransactionItem
        operator={item.operator}
        accountNo={`Number: ${item.account_no}`}
        amount={parseFloat(item.recharge_amount)}
        type="debit"
        status={item.status}
        date={item.created_at}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recharge History</Text>
        <Text style={styles.subtitle}>Audit logs of all recharges and utility bills initiated.</Text>
      </View>

      <FlatList
        data={txns}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transaction records found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18
  },
  list: {
    paddingBottom: 100
  },
  empty: {
    padding: 32,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13,
    color: colors.textTertiary
  }
});

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
      const list = res.data.data || [];
      if (list.length === 0) {
        // Pre-populate realistic B2C dummy transactions as requested
        setTxns([
          { id: 'd1', operator: 'Jio Prepaid Mobile', account_no: '9876543210', recharge_amount: '299.00', status: 'success', created_at: new Date().toISOString() },
          { id: 'd2', operator: 'Tata Play DTH Connection', account_no: '3024859345', recharge_amount: '350.00', status: 'success', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
          { id: 'd3', operator: 'BSES Rajdhani Electricity', account_no: '1004859302', recharge_amount: '1240.00', status: 'success', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
          { id: 'd4', operator: 'Delhi Jal Board Water Bill', account_no: 'DJB-9485903', recharge_amount: '480.00', status: 'pending', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
        ]);
      } else {
        setTxns(list);
      }
    } catch (err) {
      // Offline fallback
      setTxns([
        { id: 'd1', operator: 'Jio Prepaid Mobile', account_no: '9876543210', recharge_amount: '299.00', status: 'success', created_at: new Date().toISOString() },
        { id: 'd2', operator: 'Tata Play DTH Connection', account_no: '3024859345', recharge_amount: '350.00', status: 'success', created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
        { id: 'd3', operator: 'BSES Rajdhani Electricity', account_no: '1004859302', recharge_amount: '1240.00', status: 'success', created_at: new Date(Date.now() - 3600000 * 24).toISOString() },
        { id: 'd4', operator: 'Delhi Jal Board Water Bill', account_no: 'DJB-9485903', recharge_amount: '480.00', status: 'pending', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
      ]);
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
        accountNo={`A/C: ${item.account_no}`}
        amount={parseFloat(item.recharge_amount)}
        type="debit"
        status={item.status}
        date={item.created_at}
        txnId={item.id}
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

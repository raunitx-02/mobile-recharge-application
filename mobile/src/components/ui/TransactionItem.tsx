import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionItemProps {
  operator: string;
  accountNo: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'success' | 'pending' | 'failed' | 'processing';
  date: string | Date;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  operator,
  accountNo,
  amount,
  type,
  status,
  date,
  onPress
}) => {
  const isDebit = type === 'debit';
  const displayAmount = `${isDebit ? '-' : '+'} ${formatCurrency(amount)}`;

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.8}
    >
      <View style={styles.left}>
        <View style={[styles.avatarCircle, { backgroundColor: isDebit ? 'rgba(255, 59, 48, 0.08)' : 'rgba(52, 199, 89, 0.08)' }]}>
          <Text style={[styles.avatarText, { color: isDebit ? colors.error : colors.success }]}>
            {isDebit ? '⚡' : '💰'}
          </Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.operator} numberOfLines={1}>{operator}</Text>
          <Text style={styles.accountNo} numberOfLines={1}>{accountNo}</Text>
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: isDebit ? colors.text : colors.success }]}>
          {displayAmount}
        </Text>
        <StatusBadge status={status} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.80)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    fontSize: 18
  },
  details: {
    flex: 1,
    justifyContent: 'center'
  },
  operator: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2
  },
  accountNo: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  date: {
    fontSize: 10,
    color: colors.textTertiary,
    marginTop: 4
  },
  right: {
    alignItems: 'flex-end',
    gap: 6
  },
  amount: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.5
  }
});

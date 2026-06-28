import React, { useState } from 'react';
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
  txnId?: string;
  onPress?: () => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  operator,
  accountNo,
  amount,
  type,
  status,
  date,
  txnId = `TXN-${Math.floor(Math.random() * 100000000)}`,
  onPress
}) => {
  const [expanded, setExpanded] = useState(false);
  const isDebit = type === 'debit';
  const displayAmount = `${isDebit ? '-' : '+'} ${formatCurrency(amount)}`;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setExpanded(!expanded);
    }
  };

  const getIcon = () => {
    const cleanOp = operator.toLowerCase();
    if (cleanOp.includes('jio')) return '📱';
    if (cleanOp.includes('airtel')) return '📶';
    if (cleanOp.includes('dth')) return '📡';
    if (cleanOp.includes('elect')) return '⚡';
    if (cleanOp.includes('water')) return '💧';
    if (cleanOp.includes('gas')) return '🔥';
    if (cleanOp.includes('broad')) return '🌐';
    if (cleanOp.includes('fast')) return '🚗';
    if (cleanOp.includes('rent')) return '🏠';
    return isDebit ? '⚡' : '💰';
  };

  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity 
        style={[styles.container, expanded && styles.containerExpanded]} 
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.left}>
          <View style={[styles.avatarCircle, { backgroundColor: isDebit ? 'rgba(0, 122, 255, 0.08)' : 'rgba(52, 199, 89, 0.08)' }]}>
            <Text style={[styles.avatarText, { color: isDebit ? colors.primary : colors.success }]}>
              {getIcon()}
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

      {expanded && (
        <View style={styles.detailsBlock}>
          <View style={styles.divider} />
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailVal}>{txnId}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailVal}>{isDebit ? 'Wallet Balance' : 'Gateway / UPI'}</Text>
          </View>
          <View style={styles.detailsRow}>
            <Text style={styles.detailLabel}>Status</Text>
            <Text style={[styles.detailVal, { color: status === 'success' ? colors.success : colors.warning }]}>
              {status.toUpperCase()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
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
    elevation: 2,
    overflow: 'hidden'
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16
  },
  containerExpanded: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)'
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
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(60, 60, 67, 0.08)',
    marginHorizontal: 16,
    marginBottom: 12
  },
  detailsBlock: {
    paddingBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)'
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 4
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: '600'
  },
  detailVal: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700'
  }
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme';
import { formatCurrency, formatDate } from '../../utils/formatters';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface IconConfig {
  bg: string;
  emoji: string;
}

const getIconConfig = (operator: string, isCredit: boolean): IconConfig => {
  const op = operator.toLowerCase();
  if (op.includes('jio') || op.includes('mobile') || op.includes('prepaid') || op.includes('postpaid')) {
    return { bg: '#EAF3FF', emoji: '\ud83d\udcf1' };
  }
  if (op.includes('dth') || op.includes('play') || op.includes('dish') || op.includes('airtel')) {
    return { bg: '#FFF6EA', emoji: '\ud83d\udce1' };
  }
  if (op.includes('elect') || op.includes('power') || op.includes('bses') || op.includes('msedcl')) {
    return { bg: '#FFF0EA', emoji: '\u26a1' };
  }
  if (op.includes('water') || op.includes('jal')) {
    return { bg: '#EAF3FF', emoji: '\ud83d\udca7' };
  }
  if (op.includes('gas') || op.includes('igl') || op.includes('mgl')) {
    return { bg: '#FFEAEA', emoji: '\ud83d\udd25' };
  }
  if (op.includes('broad') || op.includes('fiber') || op.includes('internet')) {
    return { bg: '#EAFFF0', emoji: '\ud83c\udf10' };
  }
  if (op.includes('fast') || op.includes('nhai') || op.includes('tag')) {
    return { bg: '#FFF6EA', emoji: '\ud83d\udee3\ufe0f' };
  }
  if (op.includes('rent') || op.includes('society') || op.includes('housing')) {
    return { bg: '#F0EAFF', emoji: '\ud83c\udfe0' };
  }
  if (isCredit) {
    return { bg: '#EAFFF0', emoji: '\ud83d\udcb0' };
  }
  return { bg: '#F5F5F5', emoji: '\ud83d\udd27' };
};

interface StatusConfig {
  bg: string;
  textColor: string;
  label: string;
}

const getStatusConfig = (status: TransactionItemProps['status']): StatusConfig => {
  switch (status) {
    case 'success':
      return { bg: '#EAFFF0', textColor: '#34C759', label: '\u2022 Success' };
    case 'pending':
      return { bg: '#FFF6EA', textColor: '#FF9500', label: '\u2022 Pending' };
    case 'failed':
      return { bg: '#FFEAEA', textColor: '#FF3B30', label: '\u2022 Failed' };
    case 'processing':
      return { bg: '#EAF3FF', textColor: '#007AFF', label: '\u2022 Processing' };
  }
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const TransactionItem: React.FC<TransactionItemProps> = ({
  operator,
  accountNo,
  amount,
  type,
  status,
  date,
  txnId = `TXN-${Math.floor(Math.random() * 100000000)}`,
  onPress,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isDebit = type === 'debit';
  const isCredit = type === 'credit';
  const displayAmount = `${isDebit ? '-' : '+'} ${formatCurrency(amount)}`;
  const amountColor = isCredit ? '#34C759' : '#1C1C1E';

  const { bg: iconBg, emoji } = getIconConfig(operator, isCredit);
  const statusConfig = getStatusConfig(status);

  // Operator code: uppercase of first word
  const operatorCode = operator.split(' ')[0].toUpperCase();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setExpanded((prev) => !prev);
    }
  };

  return (
    <View style={styles.container}>
      {/* ── MAIN ROW ── */}
      <TouchableOpacity
        style={styles.mainRow}
        onPress={handlePress}
        activeOpacity={0.85}
      >
        {/* Left: icon square */}
        <View style={[styles.iconSquare, { backgroundColor: iconBg }]}>
          <Text style={styles.iconEmoji}>{emoji}</Text>
        </View>

        {/* Center: details */}
        <View style={styles.centerBlock}>
          <Text style={styles.operatorText} numberOfLines={1}>
            {operator}
          </Text>
          <Text style={styles.accountNoText} numberOfLines={1}>
            {accountNo}
          </Text>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </View>

        {/* Right: amount + status badge */}
        <View style={styles.rightBlock}>
          <Text style={[styles.amountText, { color: amountColor }]}>{displayAmount}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <Text style={[styles.statusText, { color: statusConfig.textColor }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── EXPANDED SECTION ── */}
      {expanded && (
        <View style={styles.expandedSection}>
          {/* Divider */}
          <View style={styles.divider} />

          {/* Detail rows */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Transaction ID</Text>
            <Text style={styles.detailValue}>{txnId}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Mode</Text>
            <Text style={styles.detailValue}>Wallet Balance</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Operator Code</Text>
            <Text style={styles.detailValue}>{operatorCode}</Text>
          </View>

          {/* Raise dispute (only on failed) */}
          {status === 'failed' && (
            <TouchableOpacity
              style={styles.disputeBtn}
              onPress={() => {}}
              activeOpacity={0.7}
            >
              <Text style={styles.disputeText}>Raise Dispute \u2192</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },

  // Main row
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  // Left icon
  iconSquare: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconEmoji: {
    fontSize: 24,
  },

  // Center
  centerBlock: {
    flex: 1,
    marginLeft: 14,
  },
  operatorText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  accountNoText: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 3,
  },
  dateText: {
    fontSize: 11,
    color: '#C7C7CC',
    marginTop: 2,
  },

  // Right
  rightBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  amountText: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // Expanded section
  expandedSection: {
    paddingBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(60,60,67,0.08)',
    marginHorizontal: 16,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Dispute button
  disputeBtn: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 2,
  },
  disputeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF3B30',
  },
});

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface StatusBadgeProps {
  status: 'success' | 'pending' | 'failed' | 'processing';
  label?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG = {
  success: { label: 'Success', bg: colors.successBg, text: colors.success, dot: colors.success },
  pending: { label: 'Pending', bg: colors.warningBg, text: colors.warning, dot: colors.warning },
  processing: { label: 'Processing', bg: colors.warningBg, text: colors.warning, dot: colors.warning },
  failed: { label: 'Failed', bg: colors.errorBg, text: colors.error, dot: colors.error },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const config = STATUS_CONFIG[status];
  const displayLabel = label || config.label;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text
        style={[
          styles.text,
          { color: config.text, fontSize: isSmall ? 11 : 13 },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

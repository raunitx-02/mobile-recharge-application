import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { colors } from '../../theme';
import { formatCurrency } from '../../utils/formatters';

interface RechargeConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  operator: string;
  accountNo: string;
  amount: number;
}

export const RechargeConfirmModal: React.FC<RechargeConfirmModalProps> = ({
  visible,
  onClose,
  onConfirm,
  operator,
  accountNo,
  amount
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <BlurView intensity={30} style={StyleSheet.absoluteFill} />
        
        <View style={styles.content}>
          <GlassCard style={styles.card}>
            <Text style={styles.title}>Confirm Recharge</Text>
            
            <View style={styles.row}>
              <Text style={styles.label}>Operator</Text>
              <Text style={styles.val}>{operator}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Mobile / Account</Text>
              <Text style={styles.val}>{accountNo}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Amount</Text>
              <Text style={styles.amount}>{formatCurrency(amount)}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <GlassButton 
                title="Confirm & Pay" 
                onPress={onConfirm} 
                style={styles.confirmBtn}
              />
            </View>
          </GlassCard>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    width: '88%'
  },
  card: {
    padding: 24,
    gap: 16
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary
  },
  val: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)'
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    marginVertical: 0
  }
});

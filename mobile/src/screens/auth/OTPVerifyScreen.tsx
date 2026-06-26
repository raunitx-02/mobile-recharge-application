import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { PinInput } from '../../components/ui/PinInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { colors } from '../../theme';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/auth.store';
import Toast from 'react-native-toast-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OTPVerify'>;

export const OTPVerifyScreen: React.FC<Props> = ({ route, navigation }) => {
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  const { setAuth } = useAuthStore();

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Code',
        text2: 'Verification code must be exactly 6 digits'
      });
      return;
    }

    setLoading(true);
    setError(false);

    try {
      const res = await authService.verifyOTP(phone, otp);
      const { user, accessToken, refreshToken } = res.data.data;
      
      await setAuth(user, accessToken, refreshToken);
      Toast.show({
        type: 'success',
        text1: 'Welcome to AetherPay 🎉',
        text2: 'Session authenticated successfully'
      });
    } catch (err: any) {
      setError(true);
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: err.response?.data?.message || 'Invalid verification OTP code'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Enter OTP Code</Text>
          <Text style={styles.subtitle}>Enter the 6-digit DLT authentication code sent to +91 {phone}</Text>
        </View>

        <GlassCard style={styles.card}>
          <PinInput
            length={6}
            value={otp}
            onChange={(t) => setOtp(t.replace(/[^0-9]/g, ''))}
            error={error}
          />

          <GlassButton
            title="Verify & Authenticate"
            onPress={handleVerify}
            loading={loading}
            style={styles.btn}
          />
        </GlassCard>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20
  },
  header: {
    alignItems: 'center',
    marginBottom: 32
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 20
  },
  card: {
    padding: 24,
    alignItems: 'center',
    gap: 16
  },
  btn: {
    width: '100%',
    marginTop: 8
  }
});

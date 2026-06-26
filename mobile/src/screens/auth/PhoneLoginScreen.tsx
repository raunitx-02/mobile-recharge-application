import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { colors } from '../../theme';
import { authService } from '../../services/auth.service';
import Toast from 'react-native-toast-message';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'PhoneLogin'>;

export const PhoneLoginScreen: React.FC<Props> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid 10-digit mobile number'
      });
      return;
    }

    setLoading(true);
    try {
      await authService.sendOTP(phone);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent ⚡',
        text2: `Verification code sent to +91 ${phone}`
      });
      navigation.navigate('OTPVerify', { phone });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Request Failed',
        text2: err.response?.data?.message || 'Failed to send verification SMS'
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
          <Text style={styles.title}>Secure Login</Text>
          <Text style={styles.subtitle}>Enter your mobile number to check out instantly.</Text>
        </View>

        <GlassCard style={styles.card}>
          <GlassInput
            label="Mobile Number"
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
            placeholder="98765 43210"
            keyboardType="phone-pad"
            maxLength={10}
            icon="📱"
          />
          
          <GlassButton 
            title="Get Verification Code" 
            onPress={handleSendOTP} 
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
    gap: 16
  },
  btn: {
    marginTop: 8
  }
});

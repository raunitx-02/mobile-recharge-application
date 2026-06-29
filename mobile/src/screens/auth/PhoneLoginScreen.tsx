import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
      const res = await authService.sendOTP(phone);
      const serverOtp = res.data?.data?.otp;
      Toast.show({
        type: 'success',
        text1: 'OTP Sent ⚡',
        text2: serverOtp ? `[DEV MODE] Verification Code is ${serverOtp}` : `Verification code sent to +91 ${phone}`,
        visibilityTime: serverOtp ? 10000 : 4000
      });
      navigation.navigate('OTPVerify', { phone, devOtp: serverOtp });
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
    <LinearGradient
      colors={['#E8EAF6', '#F5F5F7', '#E3F2FD']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>Æ</Text>
            </View>
            <Text style={styles.title}>Welcome to OptionsPay</Text>
            <Text style={styles.subtitle}>Enter your mobile number to sign in or get started.</Text>
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

            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              style={styles.switchContainer}
            >
              <Text style={styles.switchText}>
                Don't have an account? <Text style={styles.switchLink}>Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
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
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary
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
  },
  switchContainer: {
    alignItems: 'center',
    marginTop: 12
  },
  switchText: {
    fontSize: 13,
    color: colors.textSecondary
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '700'
  }
});

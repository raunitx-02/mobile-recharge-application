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

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Required Field',
        text2: 'Please enter your name'
      });
      return;
    }
    if (phone.length !== 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone',
        text2: 'Please enter a valid 10-digit mobile number'
      });
      return;
    }

    setLoading(true);
    try {
      // First register details on server (which saves the user info, password/auth is verified via OTP)
      await authService.register({
        name,
        phone,
        email: email.trim() || undefined,
        password: 'defaultPassword123' // Default password since OTP handles actual login securely
      });
      
      // Immediately send OTP to authenticate
      const res = await authService.sendOTP(phone);
      const serverOtp = res.data?.data?.otp;

      Toast.show({
        type: 'success',
        text1: 'Account Created 🎉',
        text2: serverOtp ? `[DEV MODE] OTP is ${serverOtp}` : 'Verification code sent to your phone',
        visibilityTime: serverOtp ? 10000 : 4000
      });

      navigation.navigate('OTPVerify', { phone, devOtp: serverOtp });
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: err.response?.data?.message || 'Could not register account'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#E3F2FD', '#F5F5F7', '#E8F5E9']}
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
            <Text style={styles.title}>Join AetherPay</Text>
            <Text style={styles.subtitle}>Create an account to start earning high commission slabs instantly.</Text>
          </View>

          <GlassCard style={styles.card}>
            <GlassInput
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="John Doe"
              icon="👤"
            />

            <GlassInput
              label="Mobile Number"
              value={phone}
              onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))}
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              icon="📱"
            />

            <GlassInput
              label="Email Address (Optional)"
              value={email}
              onChangeText={setEmail}
              placeholder="john@example.com"
              keyboardType="email-address"
              icon="✉️"
            />

            <GlassInput
              label="Referral Code (Optional)"
              value={referredBy}
              onChangeText={setReferredBy}
              placeholder="REF12345"
              autoCapitalize="characters"
              icon="🎁"
            />

            <GlassButton
              title="Sign Up & Get Code"
              onPress={handleRegister}
              loading={loading}
              style={styles.btn}
            />

            <TouchableOpacity 
              onPress={() => navigation.navigate('PhoneLogin')}
              style={styles.switchContainer}
            >
              <Text style={styles.switchText}>
                Already have an account? <Text style={styles.switchLink}>Sign In</Text>
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
    marginBottom: 24
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.8
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
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

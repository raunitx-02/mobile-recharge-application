import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PhoneLoginScreen } from '../screens/auth/PhoneLoginScreen';
import { OTPVerifyScreen } from '../screens/auth/OTPVerifyScreen';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="OTPVerify" component={OTPVerifyScreen} />
    </Stack.Navigator>
  );
};

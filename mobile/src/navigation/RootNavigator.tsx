import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AddMoneyScreen } from '../screens/wallet/AddMoneyScreen';
import { WithdrawScreen } from '../screens/wallet/WithdrawScreen';
import { CheckoutScreen } from '../screens/recharge/CheckoutScreen';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <AuthNavigator />;
  }

  if (!isAuthenticated) {
    return <AuthNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs"  component={MainNavigator} />
      <Stack.Screen name="AddMoney"  component={AddMoneyScreen} />
      <Stack.Screen name="Withdraw"  component={WithdrawScreen} />
      <Stack.Screen name="Checkout"  component={CheckoutScreen} />
    </Stack.Navigator>
  );
};

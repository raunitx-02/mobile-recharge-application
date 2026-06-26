import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/main/HomeScreen';
import { RechargeScreen } from '../screens/main/RechargeScreen';
import { WalletScreen } from '../screens/main/WalletScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { FloatingTabBar } from '../components/ui/FloatingTabBar';
import { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="RechargeTab" component={RechargeScreen} />
      <Tab.Screen name="WalletTab" component={WalletScreen} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

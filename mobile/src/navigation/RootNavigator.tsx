import React from 'react';
import { useAuthStore } from '../store/auth.store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

export const RootNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <AuthNavigator />; // Splash handles loading internally
  }

  return isAuthenticated ? <MainNavigator /> : <AuthNavigator />;
};

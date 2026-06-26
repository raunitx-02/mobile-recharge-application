import React from 'react';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return isAuthenticated ? <DashboardPage /> : <LoginPage />;
}

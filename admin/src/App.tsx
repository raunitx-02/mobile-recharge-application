import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import TransactionsPage from './pages/TransactionsPage';
import WalletPage from './pages/WalletPage';
import CommissionPage from './pages/CommissionPage';
import ReportsPage from './pages/ReportsPage';
import OperatorsPage from './pages/OperatorsPage';
import PlansPage from './pages/PlansPage';
import BannersPage from './pages/BannersPage';
import OffersPage from './pages/OffersPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/admin">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#e2e8f0',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
          },
          success: { iconTheme: { primary: '#059669', secondary: '#fff' } },
          error: { iconTheme: { primary: '#DC2626', secondary: '#fff' } },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="commission" element={<CommissionPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="operators" element={<OperatorsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="offers" element={<OffersPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;

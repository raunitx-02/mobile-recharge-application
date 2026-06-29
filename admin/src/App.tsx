import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/DashboardPage';

// Placeholders for other pages
const Placeholder = ({ title }: { title: string }) => (
  <div><h2>{title}</h2><p>Coming soon...</p></div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/admin">
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#141428',
          color: '#E2E8F0',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<Placeholder title="Users" />} />
          <Route path="transactions" element={<Placeholder title="Transactions" />} />
          <Route path="wallet" element={<Placeholder title="Wallet" />} />
          <Route path="commission" element={<Placeholder title="Commission" />} />
          <Route path="reports" element={<Placeholder title="Reports" />} />
          <Route path="operators" element={<Placeholder title="Operators" />} />
          <Route path="plans" element={<Placeholder title="Plans" />} />
          <Route path="banners" element={<Placeholder title="Banners" />} />
          <Route path="offers" element={<Placeholder title="Offers" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="api-config" element={<Placeholder title="API Config" />} />
          <Route path="settings" element={<Placeholder title="Settings" />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

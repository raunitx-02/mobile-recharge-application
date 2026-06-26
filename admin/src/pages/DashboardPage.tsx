import React, { useEffect, useState } from 'react';
import { dashboardService } from '../../services/admin.service';
import { useAuthStore } from '../../store/auth.store';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res);
      } catch (err) {
        console.error('Failed to sync dashboard analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-container">Synchronizing ledger audits...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>AetherPay Admin Console</h1>
          <p>Real-time transaction analytics and carrier routing switches.</p>
        </div>
        <button onClick={clearAuth} className="logout-btn">Log Out</button>
      </header>

      {/* Analytics widgets */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Registered Users</h3>
          <p className="stat-value">{stats?.totalUsers || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Billing Volume</h3>
          <p className="stat-value">{formatCurrency(stats?.todayRevenue || 0)}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Transactions</h3>
          <p className="stat-value">{stats?.todayTransactions || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Settle Success Rate</h3>
          <p className="stat-value">{stats?.todaySuccessRate || 100.00}%</p>
        </div>
      </div>

      {/* Recent billing logs */}
      <div className="logs-section">
        <h2>Latest Recharges</h2>
        <table className="logs-table">
          <thead>
            <tr>
              <th>Operator</th>
              <th>Account/Mobile</th>
              <th>Amount</th>
              <th>Status</th>
              <th>API Source</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {stats?.latestTransactions?.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>No transactions recorded today</td>
              </tr>
            ) : (
              stats?.latestTransactions?.map((t: any) => (
                <tr key={t.id}>
                  <td>{t.operator}</td>
                  <td>{t.account_no}</td>
                  <td>{formatCurrency(parseFloat(t.recharge_amount))}</td>
                  <td>
                    <span className={`status-badge ${t.status}`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td>{t.api_name}</td>
                  <td>{new Date(t.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

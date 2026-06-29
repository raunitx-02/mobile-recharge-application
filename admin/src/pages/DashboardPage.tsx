import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { StatCard } from '../components/ui/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getDashboard();
        setStats(res.data.data || res.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const s = stats?.stats || {};
  const revenueTrend = stats?.revenueTrend || [];
  const txnStats = stats?.txnStats || [];
  const recentTxns = stats?.recentTransactions || [];
  const topOperators = stats?.topOperators || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Dashboard Overview</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        <StatCard title="Total Users" value={loading ? '—' : (s.totalUsers ?? 0).toLocaleString()} change={s.usersChange} icon="👥" color="purple" loading={loading} />
        <StatCard title="Today's Revenue" value={loading ? '—' : `₹${(s.todayRevenue ?? 0).toLocaleString()}`} change={s.revenueChange} icon="📈" color="green" loading={loading} />
        <StatCard title="Today's Txns" value={loading ? '—' : (s.todayTxns ?? 0).toLocaleString()} change={s.txnsChange} icon="🔄" color="amber" loading={loading} />
        <StatCard title="Success Rate" value={loading ? '—' : `${s.successRate ?? 0}%`} change={s.successChange} icon="✅" color="green" loading={loading} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Revenue Trend (Last 7 Days)</h3>
          {loading ? <div className="skeleton" style={{ height: '260px' }}></div> : revenueTrend.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          ) : (
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Transactions</h3>
          {loading ? <div className="skeleton" style={{ height: '260px' }}></div> : txnStats.length === 0 ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          ) : (
            <div style={{ height: '260px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={txnStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="success" stackId="a" fill="var(--accent-green)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="failed" stackId="a" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div className="card" style={{ overflowX: 'auto' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Recent Transactions</h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: '40px' }}></div>)}
            </div>
          ) : recentTxns.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions yet</div>
          ) : (
            <table>
              <thead>
                <tr><th>TXN ID</th><th>Phone</th><th>Type / Operator</th><th>Amount</th><th>Status</th></tr>
              </thead>
              <tbody>
                {recentTxns.map((t: any) => (
                  <tr key={t.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{(t.id || '').slice(0, 12)}...</td>
                    <td>{t.account_no || t.phone || '—'}</td>
                    <td><span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.type}</span> {t.operator}</td>
                    <td style={{ fontWeight: 600 }}>₹{t.recharge_amount || t.amount}</td>
                    <td>
                      <span style={{
                        padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        background: t.status === 'success' ? 'rgba(5,150,105,0.1)' : t.status === 'failed' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                        color: t.status === 'success' ? 'var(--accent-green)' : t.status === 'failed' ? 'var(--danger)' : 'var(--accent-amber)'
                      }}>{t.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Top Operators</h3>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '48px' }}></div>)}
            </div>
          ) : topOperators.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topOperators.map((op: any, i: number) => (
                <div key={op.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: i !== topOperators.length - 1 ? '16px' : 0, borderBottom: i !== topOperators.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {(op.name || '?').charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '14px' }}>{op.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(op.txns || 0).toLocaleString()} txns</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '14px' }}>
                    ₹{(op.revenue / 1000).toFixed(1)}k
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

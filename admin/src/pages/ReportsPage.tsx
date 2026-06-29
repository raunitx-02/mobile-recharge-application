import React, { useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#6C3CE1', '#059669', '#D97706', '#DC2626', '#0EA5E9'];

const ReportsPage: React.FC = () => {
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports({ dateFrom, dateTo });
      setData(res.data.data || res.data);
    } catch { toast.error('Failed to load report'); }
    finally { setLoading(false); }
  };

  const exportExcel = async () => {
    try {
      const res = await adminApi.exportReport('summary', { dateFrom, dateTo });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `report_${dateFrom}_${dateTo}.xlsx`; a.click();
    } catch { toast.error('Export failed'); }
  };

  const summaryCards = data ? [
    { label: 'Total Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString()}`, icon: '💰', color: '#059669' },
    { label: 'Total Txns', value: (data.totalTxns || 0).toLocaleString(), icon: '🔄', color: '#6C3CE1' },
    { label: 'Success Txns', value: (data.successTxns || 0).toLocaleString(), icon: '✅', color: '#059669' },
    { label: 'Failed Txns', value: (data.failedTxns || 0).toLocaleString(), icon: '❌', color: '#DC2626' },
    { label: 'New Users', value: (data.newUsers || 0).toLocaleString(), icon: '👥', color: '#D97706' },
    { label: 'Avg Txn Value', value: `₹${(data.avgTxnValue || 0).toFixed(0)}`, icon: '📊', color: '#0EA5E9' },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Reports & Analytics</h2>

      {/* Date Filter */}
      <div className="card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <label className="input-label">From</label>
          <input className="input-field" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '10px 14px' }} />
        </div>
        <div>
          <label className="input-label">To</label>
          <input className="input-field" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '10px 14px' }} />
        </div>
        {/* Quick ranges */}
        {[['Today', 0], ['7 Days', 7], ['30 Days', 30], ['90 Days', 90]].map(([label, days]) => (
          <button key={label} onClick={() => {
            const from = new Date();
            if (days > 0) from.setDate(from.getDate() - (days as number));
            setDateFrom(from.toISOString().split('T')[0]);
            setDateTo(new Date().toISOString().split('T')[0]);
          }} className="btn" style={{ padding: '10px 16px', background: 'var(--border)', borderRadius: '8px', fontWeight: 600, fontSize: '13px', marginTop: '20px' }}>{label}</button>
        ))}
        <button onClick={load} className="btn btn-primary" style={{ marginTop: '20px', padding: '10px 24px' }}>Generate Report</button>
        {data && <button onClick={exportExcel} className="btn" style={{ marginTop: '20px', padding: '10px 20px', background: 'var(--accent-green)', color: 'white', borderRadius: '8px', fontWeight: 600 }}>📥 Export Excel</button>}
      </div>

      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: '90px' }}></div>)}
        </div>
      )}

      {!loading && data && (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {summaryCards.map(c => (
              <div key={c.label} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, marginBottom: '8px' }}>{c.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.color }}>{c.value}</div>
                  </div>
                  <div style={{ fontSize: '28px' }}>{c.icon}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
            {/* Revenue Trend */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Revenue Trend</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueTrend || []}>
                    <defs>
                      <linearGradient id="rGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#rGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Txn by Type Pie */}
            <div className="card">
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '20px' }}>Transactions by Type</h3>
              <div style={{ height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.txnByType || []} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`} fontSize={11}>
                      {(data.txnByType || []).map((_: any, index: number) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Legend />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Daily Breakdown Table */}
          {(data.dailyBreakdown || []).length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>Daily Breakdown</div>
              <table>
                <thead><tr><th>Date</th><th>Transactions</th><th>Success</th><th>Failed</th><th>Revenue</th><th>New Users</th></tr></thead>
                <tbody>
                  {data.dailyBreakdown.map((row: any) => (
                    <tr key={row.date}>
                      <td style={{ fontWeight: 600 }}>{row.date}</td>
                      <td>{row.total}</td>
                      <td style={{ color: 'var(--accent-green)', fontWeight: 600 }}>{row.success}</td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>{row.failed}</td>
                      <td style={{ fontWeight: 700 }}>₹{(row.revenue || 0).toLocaleString()}</td>
                      <td>{row.newUsers || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && !data && (
        <div className="card" style={{ textAlign: 'center', padding: '80px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '16px' }}>Select a date range and click "Generate Report"</div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;

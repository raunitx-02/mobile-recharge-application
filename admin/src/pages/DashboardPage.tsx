import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import { StatCard } from '../components/ui/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import toast from 'react-hot-toast';

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // Since we don't have the API yet, we'll mock it for the UI preview
        // const res = await adminApi.getDashboard();
        // setData(res.data);
        
        setTimeout(() => {
          setData({
            stats: {
              totalUsers: 12450,
              usersChange: '+12% this week',
              todayRevenue: 45600,
              revenueChange: '+5% from yesterday',
              todayTxns: 124,
              txnsChange: '-2% from yesterday',
              successRate: 94.5,
              successChange: '+1.2% this week'
            },
            revenueTrend: [
              { date: 'Jun 20', amount: 30000 },
              { date: 'Jun 21', amount: 35000 },
              { date: 'Jun 22', amount: 28000 },
              { date: 'Jun 23', amount: 42000 },
              { date: 'Jun 24', amount: 38000 },
              { date: 'Jun 25', amount: 45000 },
              { date: 'Jun 26', amount: 45600 },
            ],
            txnStats: [
              { date: 'Mon', success: 120, failed: 10 },
              { date: 'Tue', success: 130, failed: 15 },
              { date: 'Wed', success: 110, failed: 5 },
              { date: 'Thu', success: 140, failed: 20 },
              { date: 'Fri', success: 150, failed: 12 },
              { date: 'Sat', success: 160, failed: 8 },
              { date: 'Sun', success: 124, failed: 7 },
            ],
            recentTxns: [
              { id: 'TXN123456789', phone: '9876543210', type: 'prepaid', operator: 'Airtel', amount: 299, status: 'success', time: '10 mins ago' },
              { id: 'TXN123456788', phone: '9876543211', type: 'dth', operator: 'Tata Play', amount: 500, status: 'success', time: '25 mins ago' },
              { id: 'TXN123456787', phone: '9876543212', type: 'postpaid', operator: 'Jio', amount: 499, status: 'failed', time: '1 hour ago' },
              { id: 'TXN123456786', phone: '9876543213', type: 'electricity', operator: 'UPPCL', amount: 1250, status: 'pending', time: '2 hours ago' },
            ],
            topOperators: [
              { name: 'Jio', txns: 1250, revenue: 250000 },
              { name: 'Airtel', txns: 980, revenue: 180000 },
              { name: 'Vi', txns: 450, revenue: 85000 },
            ]
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Dashboard Overview</h2>
      
      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <StatCard title="Total Users" value={data?.stats.totalUsers.toLocaleString()} change={data?.stats.usersChange} icon="👥" color="purple" loading={loading} />
        <StatCard title="Today's Revenue" value={`₹${data?.stats.todayRevenue.toLocaleString()}`} change={data?.stats.revenueChange} icon="📈" color="green" loading={loading} />
        <StatCard title="Today's Txns" value={data?.stats.todayTxns.toLocaleString()} change={data?.stats.txnsChange} icon="🔄" color="amber" loading={loading} />
        <StatCard title="Success Rate" value={`${data?.stats.successRate}%`} change={data?.stats.successChange} icon="✅" color="green" loading={loading} />
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Revenue Trend (Last 7 Days)</h3>
          {loading ? (
            <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
          ) : (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueTrend}>
                  <defs>
                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Transactions</h3>
          {loading ? (
            <div className="skeleton" style={{ height: '300px', width: '100%' }}></div>
          ) : (
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.txnStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px' }} cursor={{fill: 'rgba(255,255,255,0.05)'}}/>
                  <Bar dataKey="success" stackId="a" fill="var(--accent-green)" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="failed" stackId="a" fill="var(--danger)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card" style={{ overflowX: 'auto' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Recent Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>TXN ID</th>
                <th>User / Phone</th>
                <th>Operator</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length: 4}).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ height: '20px', width: '100px' }}></div></td>
                    <td><div className="skeleton" style={{ height: '20px', width: '80px' }}></div></td>
                    <td><div className="skeleton" style={{ height: '20px', width: '60px' }}></div></td>
                    <td><div className="skeleton" style={{ height: '20px', width: '50px' }}></div></td>
                    <td><div className="skeleton" style={{ height: '20px', width: '60px', borderRadius: '12px' }}></div></td>
                  </tr>
                ))
              ) : (
                data?.recentTxns.map((txn: any) => (
                  <tr key={txn.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '13px' }}>{txn.id}</td>
                    <td>{txn.phone}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{txn.type}</span>
                        {txn.operator}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>₹{txn.amount}</td>
                    <td>
                      <span style={{
                        padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                        background: txn.status === 'success' ? 'rgba(16,185,129,0.1)' : txn.status === 'failed' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                        color: txn.status === 'success' ? 'var(--accent-green)' : txn.status === 'failed' ? 'var(--danger)' : 'var(--accent-amber)'
                      }}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Top Operators</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loading ? (
               Array.from({length: 3}).map((_, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                   <div className="skeleton" style={{ height: '40px', width: '40px', borderRadius: '50%' }}></div>
                   <div style={{ flex: 1, marginLeft: '12px' }}>
                     <div className="skeleton" style={{ height: '16px', width: '80px', marginBottom: '8px' }}></div>
                     <div className="skeleton" style={{ height: '12px', width: '60px' }}></div>
                   </div>
                   <div className="skeleton" style={{ height: '24px', width: '60px' }}></div>
                </div>
               ))
            ) : (
              data?.topOperators.map((op: any, i: number) => (
                <div key={op.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: i !== data.topOperators.length - 1 ? '16px' : 0, borderBottom: i !== data.topOperators.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {op.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{op.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{op.txns.toLocaleString()} txns</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--accent-green)' }}>
                    ₹{(op.revenue/1000).toFixed(1)}k
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

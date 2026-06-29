import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const WalletPage: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFundRequests({ status: filter });
      const d = res.data.data || res.data;
      setRequests(d.requests || d.rows || d || []);
    } catch { toast.error('Failed to load fund requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filter]);

  const approve = async (id: string) => {
    try {
      await adminApi.approveFundRequest(id);
      toast.success('Fund request approved & wallet credited');
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const reject = async (id: string) => {
    try {
      await adminApi.rejectFundRequest(id);
      toast.success('Fund request rejected');
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Wallet / Fund Requests</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['pending', 'approved', 'rejected', 'all'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', border: 'none',
              background: filter === s ? 'var(--primary)' : 'var(--border)',
              color: filter === s ? 'white' : 'var(--text-muted)'
            }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>User</th><th>Amount</th><th>Payment Mode</th><th>UTR / Ref</th><th>Requested At</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: '16px', width: '80px' }}></div></td>)}</tr>
            )) : requests.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No fund requests</td></tr>
            ) : requests.map((r: any) => (
              <tr key={r.id}>
                <td>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{r.User?.name || '—'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{r.User?.phone}</div>
                </td>
                <td style={{ fontWeight: 700, fontSize: '16px', color: 'var(--accent-green)' }}>₹{r.amount}</td>
                <td style={{ fontSize: '13px' }}>{r.payment_mode || r.mode || '—'}</td>
                <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r.utr || r.reference || '—'}</td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(r.created_at || r.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                <td>
                  <span style={{
                    padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase',
                    background: r.status === 'approved' ? 'rgba(5,150,105,0.1)' : r.status === 'rejected' ? 'rgba(220,38,38,0.1)' : 'rgba(217,119,6,0.1)',
                    color: r.status === 'approved' ? 'var(--accent-green)' : r.status === 'rejected' ? 'var(--danger)' : 'var(--accent-amber)'
                  }}>{r.status}</span>
                </td>
                <td>
                  {r.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => approve(r.id)} style={{ padding: '5px 12px', borderRadius: '6px', background: 'rgba(5,150,105,0.1)', color: 'var(--accent-green)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>✅ Approve</button>
                      <button onClick={() => reject(r.id)} style={{ padding: '5px 12px', borderRadius: '6px', background: 'rgba(220,38,38,0.1)', color: 'var(--danger)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>✗ Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WalletPage;

import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const statusColor = (s: string) =>
  s === 'active' ? { bg: 'rgba(5,150,105,0.1)', color: '#059669' } :
  s === 'blocked' ? { bg: 'rgba(220,38,38,0.1)', color: '#DC2626' } :
  { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [walletModal, setWalletModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState<'credit' | 'debit'>('credit');
  const [walletReason, setWalletReason] = useState('');

  const load = async (p = page, q = search) => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({ page: p, limit: 20, search: q });
      const d = res.data.data || res.data;
      setUsers(d.users || d.rows || d || []);
      setTotal(d.total || d.count || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, search);
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await adminApi.updateUserStatus(userId, status);
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed to update status'); }
  };

  const handleWalletAdjust = async () => {
    if (!walletAmount || !selected) return;
    try {
      await adminApi.adjustWallet(selected.id, { type: walletType, amount: parseFloat(walletAmount), reason: walletReason });
      toast.success(`Wallet ${walletType}ed ₹${walletAmount}`);
      setWalletModal(false);
      setWalletAmount('');
      setWalletReason('');
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Users <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '16px' }}>({total})</span></h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input className="input-field" placeholder="Search phone / name..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '260px', padding: '10px 14px' }} />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>#</th><th>Name / Phone</th><th>Email</th><th>Wallet</th><th>KYC</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j}><div className="skeleton" style={{ height: '18px', width: j === 0 ? '30px' : '80px' }}></div></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No users found</td></tr>
              ) : users.map((u, i) => {
                const sc = statusColor(u.status);
                return (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{(page - 1) * 20 + i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>{u.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.phone}</div>
                    </td>
                    <td style={{ fontSize: '13px' }}>{u.email || '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '14px' }}>₹{parseFloat(u.wallet_balance || 0).toFixed(2)}</td>
                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: u.kyc_status === 'verified' ? 'var(--accent-green)' : u.kyc_status === 'rejected' ? 'var(--danger)' : 'var(--accent-amber)' }}>
                        {u.kyc_status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={u.status}
                        onChange={e => handleStatusChange(u.id, e.target.value)}
                        style={{ background: sc.bg, color: sc.color, border: 'none', borderRadius: '6px', padding: '4px 8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                      >
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => { setSelected(u); setWalletModal(true); }}
                        style={{ padding: '5px 12px', borderRadius: '6px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}
                      >
                        💰 Wallet
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button onClick={() => { setPage(p => p - 1); load(page - 1); }} disabled={page === 1} className="btn" style={{ padding: '6px 14px', background: page === 1 ? 'var(--border)' : 'var(--primary)', color: 'white', borderRadius: '6px' }}>← Prev</button>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Page {page} of {Math.ceil(total / 20)}</span>
            <button onClick={() => { setPage(p => p + 1); load(page + 1); }} disabled={page >= Math.ceil(total / 20)} className="btn" style={{ padding: '6px 14px', background: page >= Math.ceil(total / 20) ? 'var(--border)' : 'var(--primary)', color: 'white', borderRadius: '6px' }}>Next →</button>
          </div>
        )}
      </div>

      {/* Wallet Modal */}
      {walletModal && selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '420px', padding: '32px' }}>
            <h3 style={{ marginBottom: '4px' }}>💰 Wallet Adjustment</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>{selected.name} — Current: ₹{parseFloat(selected.wallet_balance || 0).toFixed(2)}</p>
            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="input-field" value={walletType} onChange={e => setWalletType(e.target.value as any)}>
                <option value="credit">Credit (Add Money)</option>
                <option value="debit">Debit (Remove Money)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Amount (₹)</label>
              <input className="input-field" type="number" value={walletAmount} onChange={e => setWalletAmount(e.target.value)} placeholder="Enter amount" />
            </div>
            <div className="input-group">
              <label className="input-label">Reason</label>
              <input className="input-field" value={walletReason} onChange={e => setWalletReason(e.target.value)} placeholder="e.g. Manual adjustment, refund" />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={handleWalletAdjust} className="btn btn-primary" style={{ flex: 1 }}>Confirm</button>
              <button onClick={() => setWalletModal(false)} className="btn" style={{ flex: 1, background: 'var(--border)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

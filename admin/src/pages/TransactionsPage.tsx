import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const TransactionsPage: React.FC = () => {
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: '', status: '', type: '', dateFrom: '', dateTo: '' });
  const [selected, setSelected] = useState<any>(null);

  const load = async (p = page, f = filters) => {
    setLoading(true);
    try {
      const res = await adminApi.getTransactions({ page: p, limit: 20, ...f });
      const d = res.data.data || res.data;
      setTxns(d.transactions || d.rows || d || []);
      setTotal(d.total || d.count || 0);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const statusBadge = (s: string) => {
    const map: any = {
      success: { bg: 'rgba(5,150,105,0.1)', color: '#059669' },
      failed: { bg: 'rgba(220,38,38,0.1)', color: '#DC2626' },
      pending: { bg: 'rgba(217,119,6,0.1)', color: '#D97706' },
      refunded: { bg: 'rgba(99,102,241,0.1)', color: '#6366F1' },
    };
    const c = map[s] || { bg: 'rgba(107,114,128,0.1)', color: '#6B7280' };
    return <span style={{ ...c, padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase' }}>{s}</span>;
  };

  const handleStatusUpdate = async (id: string, status: string, remarks: string) => {
    try {
      await adminApi.updateTxnStatus(id, { status, remarks });
      toast.success('Transaction updated');
      setSelected(null);
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Transactions <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '16px' }}>({total})</span></h2>
        <button onClick={() => adminApi.exportReport('transactions', filters).then(r => {
          const url = URL.createObjectURL(new Blob([r.data]));
          const a = document.createElement('a'); a.href = url; a.download = 'transactions.xlsx'; a.click();
        }).catch(() => toast.error('Export failed'))} className="btn" style={{ background: 'var(--accent-green)', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}>
          📥 Export
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <input className="input-field" placeholder="Search TXN ID / Phone..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} style={{ flex: '1', minWidth: '180px', padding: '8px 12px' }} />
        <select className="input-field" value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} style={{ padding: '8px 12px', minWidth: '130px' }}>
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <select className="input-field" value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))} style={{ padding: '8px 12px', minWidth: '130px' }}>
          <option value="">All Types</option>
          <option value="prepaid">Prepaid</option>
          <option value="postpaid">Postpaid</option>
          <option value="dth">DTH</option>
          <option value="bbps">BBPS</option>
        </select>
        <input className="input-field" type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} style={{ padding: '8px 12px' }} />
        <input className="input-field" type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} style={{ padding: '8px 12px' }} />
        <button onClick={() => { setPage(1); load(1, filters); }} className="btn btn-primary" style={{ padding: '8px 20px' }}>Filter</button>
        <button onClick={() => { const f = { search: '', status: '', type: '', dateFrom: '', dateTo: '' }; setFilters(f); setPage(1); load(1, f); }} className="btn" style={{ padding: '8px 16px', background: 'var(--border)' }}>Clear</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr><th>TXN ID</th><th>User</th><th>Type</th><th>Operator</th><th>Amount</th><th>API</th><th>Status</th><th>Time</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 9 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: '16px', width: j === 0 ? '120px' : '70px' }}></div></td>)}</tr>
              )) : txns.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No transactions found</td></tr>
              ) : txns.map((t: any) => (
                <tr key={t.id} style={{ cursor: 'pointer' }}>
                  <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{(t.id || '').slice(0, 8)}...</td>
                  <td style={{ fontSize: '13px' }}>{t.account_no || '—'}</td>
                  <td><span style={{ fontSize: '11px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{t.type?.toUpperCase()}</span></td>
                  <td style={{ fontSize: '13px' }}>{t.operator}</td>
                  <td style={{ fontWeight: 700 }}>₹{t.recharge_amount}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.api_name || '—'}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(t.created_at || t.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td>
                    <button onClick={() => setSelected(t)} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 20 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
            <button onClick={() => { setPage(p => p - 1); load(page - 1); }} disabled={page === 1} className="btn" style={{ padding: '6px 14px', background: page === 1 ? 'var(--border)' : 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>← Prev</button>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Page {page} / {Math.ceil(total / 20)}</span>
            <button onClick={() => { setPage(p => p + 1); load(page + 1); }} disabled={page >= Math.ceil(total / 20)} className="btn" style={{ padding: '6px 14px', background: page >= Math.ceil(total / 20) ? 'var(--border)' : 'var(--primary)', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>Next →</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '520px', maxHeight: '80vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <h3 style={{ marginBottom: '4px' }}>Transaction Detail</h3>
                <p style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '13px' }}>{selected.id}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {[
                ['Status', statusBadge(selected.status)],
                ['Amount', `₹${selected.recharge_amount}`],
                ['Type', selected.type],
                ['Operator', selected.operator],
                ['Account', selected.account_no],
                ['Circle', selected.circle || '—'],
                ['API', selected.api_name || '—'],
                ['Commission', `₹${selected.commission || 0}`],
                ['Opening Bal', `₹${selected.opening_balance}`],
                ['Closing Bal', `₹${selected.closing_balance}`],
              ].map(([label, val]) => (
                <div key={label as string} style={{ background: 'var(--bg)', borderRadius: '8px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>{label}</div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{val}</div>
                </div>
              ))}
            </div>
            {(selected.status === 'failed' || selected.status === 'pending') && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <p style={{ fontWeight: 600, marginBottom: '12px' }}>Update Status</p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleStatusUpdate(selected.id, 'success', 'Manual success by admin')} style={{ flex: 1, padding: '10px', background: 'rgba(5,150,105,0.1)', color: 'var(--accent-green)', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>✅ Mark Success</button>
                  <button onClick={() => handleStatusUpdate(selected.id, 'refunded', 'Refunded by admin')} style={{ flex: 1, padding: '10px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary)', fontWeight: 600, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>💸 Refund</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;

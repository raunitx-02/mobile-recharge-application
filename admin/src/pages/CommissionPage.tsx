import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const CommissionPage: React.FC = () => {
  const [slabs, setSlabs] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ operator_id: '', type: 'prepaid', min_amount: '', max_amount: '', commission_type: 'percent', commission_value: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [cRes, oRes] = await Promise.all([adminApi.getCommissions(), adminApi.getOperators()]);
      const cd = cRes.data.data || cRes.data;
      const od = oRes.data.data || oRes.data;
      setSlabs(Array.isArray(cd) ? cd : cd.commissions || cd.rows || []);
      setOperators(Array.isArray(od) ? od : od.operators || od.rows || []);
    } catch { toast.error('Failed to load commissions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.commission_value) { toast.error('Commission value required'); return; }
    try {
      if (editing) { await adminApi.updateCommission(editing.id, form); toast.success('Commission updated'); }
      else { await adminApi.createCommission(form); toast.success('Commission slab created'); }
      setShowForm(false); setEditing(null);
      setForm({ operator_id: '', type: 'prepaid', min_amount: '', max_amount: '', commission_type: 'percent', commission_value: '' });
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this commission slab?')) return;
    try { await adminApi.deleteCommission(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Commission Slabs</h2>
        <button onClick={() => { setEditing(null); setForm({ operator_id: '', type: 'prepaid', min_amount: '', max_amount: '', commission_type: 'percent', commission_value: '' }); setShowForm(true); }} className="btn btn-primary">+ Add Commission</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '20px' }}>{editing ? 'Edit Commission Slab' : 'New Commission Slab'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Operator (optional)</label>
              <select className="input-field" value={form.operator_id} onChange={e => setForm(f => ({ ...f, operator_id: e.target.value }))}>
                <option value="">All Operators</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
                <option value="dth">DTH</option>
                <option value="electricity">Electricity</option>
                <option value="all">All Types</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Commission Type</label>
              <select className="input-field" value={form.commission_type} onChange={e => setForm(f => ({ ...f, commission_type: e.target.value }))}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Min Amount (₹)</label>
              <input className="input-field" type="number" value={form.min_amount} onChange={e => setForm(f => ({ ...f, min_amount: e.target.value }))} placeholder="0" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Max Amount (₹)</label>
              <input className="input-field" type="number" value={form.max_amount} onChange={e => setForm(f => ({ ...f, max_amount: e.target.value }))} placeholder="99999" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Commission Value *</label>
              <input className="input-field" type="number" step="0.01" value={form.commission_value} onChange={e => setForm(f => ({ ...f, commission_value: e.target.value }))} placeholder={form.commission_type === 'percent' ? '2.5 (%)' : '10 (₹)'} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={save} className="btn btn-primary">Save</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn" style={{ background: 'var(--border)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>Operator</th><th>Type</th><th>Amount Range</th><th>Commission</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: '16px', width: '80px' }}></div></td>)}</tr>
            )) : slabs.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No commission slabs. Add one above.</td></tr>
            ) : slabs.map((s: any) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.Operator?.name || 'All Operators'}</td>
                <td><span style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{s.type}</span></td>
                <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>₹{s.min_amount || 0} – ₹{s.max_amount || '∞'}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '16px' }}>
                  {s.commission_value}{s.commission_type === 'percent' ? '%' : ' ₹'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setForm({ operator_id: s.operator_id || '', type: s.type, min_amount: s.min_amount || '', max_amount: s.max_amount || '', commission_type: s.commission_type, commission_value: s.commission_value }); setEditing(s); setShowForm(true); }} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Edit</button>
                    <button onClick={() => del(s.id)} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(220,38,38,0.08)', color: 'var(--danger)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionPage;

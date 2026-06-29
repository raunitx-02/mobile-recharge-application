import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const OperatorsPage: React.FC = () => {
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', type: 'prepaid', status: 'active' });
  const [editing, setEditing] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOperators();
      const d = res.data.data || res.data;
      setOperators(Array.isArray(d) ? d : d.operators || d.rows || []);
    } catch { toast.error('Failed to load operators'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.code) { toast.error('Name and code required'); return; }
    try {
      if (editing) {
        await adminApi.updateOperator(editing, form);
        toast.success('Operator updated');
      } else {
        await adminApi.createOperator(form);
        toast.success('Operator created');
      }
      setShowForm(false); setEditing(null); setForm({ name: '', code: '', type: 'prepaid', status: 'active' });
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this operator?')) return;
    try { await adminApi.deleteOperator(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const typeColor = (t: string) => {
    const m: any = { prepaid: '#6366F1', postpaid: '#059669', dth: '#D97706', electricity: '#DC2626', broadband: '#0EA5E9' };
    return m[t] || '#6B7280';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Operators</h2>
        <button onClick={() => { setShowForm(true); setEditing(null); setForm({ name: '', code: '', type: 'prepaid', status: 'active' }); }} className="btn btn-primary">+ Add Operator</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '20px' }}>{editing ? 'Edit Operator' : 'New Operator'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Name *</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Airtel" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Code *</label>
              <input className="input-field" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. AL" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
                <option value="dth">DTH</option>
                <option value="electricity">Electricity</option>
                <option value="broadband">Broadband</option>
                <option value="gas">Gas</option>
                <option value="water">Water</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
          <thead><tr><th>#</th><th>Name</th><th>Code</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 6 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: '16px', width: '80px' }}></div></td>)}</tr>
            )) : operators.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No operators found. Add one above.</td></tr>
            ) : operators.map((op: any, i: number) => (
              <tr key={op.id}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                <td style={{ fontWeight: 600 }}>{op.name}</td>
                <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{op.code}</td>
                <td><span style={{ background: `${typeColor(op.type)}20`, color: typeColor(op.type), padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>{op.type}</span></td>
                <td><span style={{ background: op.status === 'active' ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)', color: op.status === 'active' ? 'var(--accent-green)' : 'var(--danger)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{op.status}</span></td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setForm({ name: op.name, code: op.code, type: op.type, status: op.status }); setEditing(op.id); setShowForm(true); }} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Edit</button>
                    <button onClick={() => del(op.id)} style={{ padding: '4px 10px', borderRadius: '6px', background: 'rgba(220,38,38,0.08)', color: 'var(--danger)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Delete</button>
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

export default OperatorsPage;

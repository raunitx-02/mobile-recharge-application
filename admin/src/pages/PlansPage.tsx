import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterOp, setFilterOp] = useState('');
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ operator_id: '', name: '', amount: '', validity: '', description: '', type: 'prepaid', status: 'active' });

  const load = async () => {
    setLoading(true);
    try {
      const [plansRes, opsRes] = await Promise.all([adminApi.getPlans({ operator_id: filterOp }), adminApi.getOperators()]);
      const pd = plansRes.data.data || plansRes.data;
      const od = opsRes.data.data || opsRes.data;
      setPlans(Array.isArray(pd) ? pd : pd.plans || pd.rows || []);
      setOperators(Array.isArray(od) ? od : od.operators || od.rows || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterOp]);

  const save = async () => {
    if (!form.name || !form.amount) { toast.error('Name and amount required'); return; }
    try {
      if (editing) { await adminApi.updatePlan(editing.id, form); toast.success('Plan updated'); }
      else { await adminApi.createPlan(form); toast.success('Plan created'); }
      setShowForm(false); setEditing(null); setForm({ operator_id: '', name: '', amount: '', validity: '', description: '', type: 'prepaid', status: 'active' });
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this plan?')) return;
    try { await adminApi.deletePlan(id); toast.success('Plan deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Recharge Plans</h2>
        <button onClick={() => { setEditing(null); setForm({ operator_id: '', name: '', amount: '', validity: '', description: '', type: 'prepaid', status: 'active' }); setShowForm(true); }} className="btn btn-primary">+ Add Plan</button>
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <select className="input-field" value={filterOp} onChange={e => setFilterOp(e.target.value)} style={{ padding: '8px 12px', minWidth: '180px' }}>
          <option value="">All Operators</option>
          {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '20px' }}>{editing ? 'Edit Plan' : 'New Plan'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Operator</label>
              <select className="input-field" value={form.operator_id} onChange={e => setForm(f => ({ ...f, operator_id: e.target.value }))}>
                <option value="">Select Operator</option>
                {operators.map(op => <option key={op.id} value={op.id}>{op.name}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Plan Name *</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. 84 Days Unlimited" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Amount (₹) *</label>
              <input className="input-field" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="239" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Validity (days)</label>
              <input className="input-field" type="number" value={form.validity} onChange={e => setForm(f => ({ ...f, validity: e.target.value }))} placeholder="84" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Type</label>
              <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="prepaid">Prepaid</option>
                <option value="postpaid">Postpaid</option>
                <option value="dth">DTH</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 3' }}>
              <label className="input-label">Description</label>
              <input className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="2GB/day, Unlimited calls, 100 SMS" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={save} className="btn btn-primary">Save Plan</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn" style={{ background: 'var(--border)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: '140px' }}></div>) :
        plans.length === 0 ? <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No plans found</div> :
        plans.map((plan: any) => (
          <div key={plan.id} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)' }}>₹{plan.amount}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>{plan.name}</div>
              </div>
              <span style={{ background: plan.status === 'active' ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)', color: plan.status === 'active' ? 'var(--accent-green)' : 'var(--danger)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{plan.status}</span>
            </div>
            {plan.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>{plan.description}</p>}
            {plan.validity && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>⏱ {plan.validity} days validity</div>}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => { setForm({ operator_id: plan.operator_id || '', name: plan.name, amount: plan.amount, validity: plan.validity || '', description: plan.description || '', type: plan.type || 'prepaid', status: plan.status }); setEditing(plan); setShowForm(true); }} style={{ flex: 1, padding: '7px', borderRadius: '6px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Edit</button>
              <button onClick={() => del(plan.id)} style={{ flex: 1, padding: '7px', borderRadius: '6px', background: 'rgba(220,38,38,0.08)', color: 'var(--danger)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;

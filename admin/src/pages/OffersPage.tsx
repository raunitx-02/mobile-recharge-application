import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    title: '', description: '', code: '', discount_type: 'percent',
    discount_value: '', min_amount: '', max_discount: '',
    valid_from: '', valid_to: '', usage_limit: '', status: 'active'
  });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOffers();
      const d = res.data.data || res.data;
      setOffers(Array.isArray(d) ? d : d.offers || d.rows || []);
    } catch { toast.error('Failed to load offers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.discount_value) { toast.error('Title and discount value are required'); return; }
    try {
      if (editing) { await adminApi.updateOffer(editing.id, form); toast.success('Offer updated'); }
      else { await adminApi.createOffer(form); toast.success('Offer created'); }
      setShowForm(false); setEditing(null);
      setForm({ title: '', description: '', code: '', discount_type: 'percent', discount_value: '', min_amount: '', max_discount: '', valid_from: '', valid_to: '', usage_limit: '', status: 'active' });
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    try { await adminApi.deleteOffer(id); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const isExpired = (validTo: string) => validTo && new Date(validTo) < new Date();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Offers & Coupons</h2>
        <button onClick={() => { setEditing(null); setForm({ title: '', description: '', code: '', discount_type: 'percent', discount_value: '', min_amount: '', max_discount: '', valid_from: '', valid_to: '', usage_limit: '', status: 'active' }); setShowForm(true); }} className="btn btn-primary">+ Add Offer</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '20px' }}>{editing ? 'Edit Offer' : 'New Offer'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Title *</label>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="First Recharge Bonus" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Coupon Code</label>
              <input className="input-field" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="WELCOME10" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Discount Type</label>
              <select className="input-field" value={form.discount_type} onChange={e => setForm(f => ({ ...f, discount_type: e.target.value }))}>
                <option value="percent">Percentage (%)</option>
                <option value="flat">Flat Amount (₹)</option>
                <option value="cashback">Cashback (₹)</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Discount Value *</label>
              <input className="input-field" type="number" value={form.discount_value} onChange={e => setForm(f => ({ ...f, discount_value: e.target.value }))} placeholder={form.discount_type === 'percent' ? '10 (%)' : '50 (₹)'} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Min Recharge Amount</label>
              <input className="input-field" type="number" value={form.min_amount} onChange={e => setForm(f => ({ ...f, min_amount: e.target.value }))} placeholder="100" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Max Discount (₹)</label>
              <input className="input-field" type="number" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} placeholder="50" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Valid From</label>
              <input className="input-field" type="datetime-local" value={form.valid_from} onChange={e => setForm(f => ({ ...f, valid_from: e.target.value }))} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Valid To</label>
              <input className="input-field" type="datetime-local" value={form.valid_to} onChange={e => setForm(f => ({ ...f, valid_to: e.target.value }))} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Usage Limit</label>
              <input className="input-field" type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} placeholder="Unlimited" />
            </div>
            <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 3' }}>
              <label className="input-label">Description</label>
              <input className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Get 10% off on first recharge" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={save} className="btn btn-primary">Save Offer</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn" style={{ background: 'var(--border)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: '180px' }}></div>) :
        offers.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No offers. Add one above.</div>
        ) : offers.map((o: any) => {
          const expired = isExpired(o.valid_to);
          return (
            <div key={o.id} className="card" style={{ border: expired ? '1px solid var(--danger)' : '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{o.title}</div>
                  {o.code && (
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, letterSpacing: '1px', fontFamily: 'monospace' }}>{o.code}</span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)' }}>
                    {o.discount_value}{o.discount_type === 'percent' ? '%' : ' ₹'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{o.discount_type}</div>
                </div>
              </div>
              {o.description && <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{o.description}</p>}
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {o.min_amount && <span>Min: ₹{o.min_amount}</span>}
                {o.max_discount && <span>Max Off: ₹{o.max_discount}</span>}
                {o.usage_count !== undefined && <span>Used: {o.usage_count}/{o.usage_limit || '∞'}</span>}
              </div>
              {(o.valid_from || o.valid_to) && (
                <div style={{ fontSize: '11px', color: expired ? 'var(--danger)' : 'var(--text-muted)', marginBottom: '12px' }}>
                  {expired ? '⚠️ Expired: ' : '📅 '}{o.valid_from ? new Date(o.valid_from).toLocaleDateString('en-IN') : '—'} → {o.valid_to ? new Date(o.valid_to).toLocaleDateString('en-IN') : '—'}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setForm({ title: o.title, description: o.description || '', code: o.code || '', discount_type: o.discount_type, discount_value: o.discount_value, min_amount: o.min_amount || '', max_discount: o.max_discount || '', valid_from: o.valid_from?.slice(0, 16) || '', valid_to: o.valid_to?.slice(0, 16) || '', usage_limit: o.usage_limit || '', status: o.status }); setEditing(o); setShowForm(true); }} style={{ flex: 1, padding: '7px', borderRadius: '6px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Edit</button>
                <button onClick={() => del(o.id)} style={{ flex: 1, padding: '7px', borderRadius: '6px', background: 'rgba(220,38,38,0.08)', color: 'var(--danger)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OffersPage;

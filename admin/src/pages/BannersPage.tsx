import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const BannersPage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', image_url: '', link: '', position: 'home_top', status: 'active' });
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getBanners();
      const d = res.data.data || res.data;
      setBanners(Array.isArray(d) ? d : d.banners || d.rows || []);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setUploading(true);
    try {
      const res = await adminApi.uploadImage(file);
      const url = res.data.data?.url || res.data.url;
      setForm(f => ({ ...f, image_url: url }));
      toast.success('Image uploaded!');
    } catch { toast.error('Image upload failed'); }
    finally { setUploading(false); }
  };

  const save = async () => {
    if (!form.title || !form.image_url) { toast.error('Title and image are required'); return; }
    try {
      if (editing) { await adminApi.updateBanner(editing.id, form); toast.success('Banner updated'); }
      else { await adminApi.createBanner(form); toast.success('Banner created'); }
      setShowForm(false); setEditing(null);
      setForm({ title: '', image_url: '', link: '', position: 'home_top', status: 'active' });
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed'); }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    try { await adminApi.deleteBanner(id); toast.success('Banner deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const toggleStatus = async (b: any) => {
    try {
      await adminApi.updateBanner(b.id, { ...b, status: b.status === 'active' ? 'inactive' : 'active' });
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Banners</h2>
        <button onClick={() => { setEditing(null); setForm({ title: '', image_url: '', link: '', position: 'home_top', status: 'active' }); setShowForm(true); }} className="btn btn-primary">+ Add Banner</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: '24px', border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '20px' }}>{editing ? 'Edit Banner' : 'New Banner'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Title *</label>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Banner title" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Position</label>
              <select className="input-field" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                <option value="home_top">Home Top</option>
                <option value="home_middle">Home Middle</option>
                <option value="offers">Offers Section</option>
                <option value="splash">Splash Screen</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Link / Deep Link</label>
              <input className="input-field" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="https://... or optionspay://offers" />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="input-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="input-label">Banner Image *</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="bannerImg" />
                <label htmlFor="bannerImg" style={{ padding: '10px 20px', background: 'var(--border)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}>
                  {uploading ? '⏳ Uploading...' : '📁 Choose Image'}
                </label>
                {form.image_url && <img src={form.image_url} alt="preview" style={{ height: '50px', borderRadius: '6px', objectFit: 'cover' }} />}
                {form.image_url && <input className="input-field" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="or paste image URL" style={{ flex: 1 }} />}
              </div>
              {!form.image_url && (
                <input className="input-field" style={{ marginTop: '8px' }} value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste image URL directly" />
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button onClick={save} className="btn btn-primary">Save Banner</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn" style={{ background: 'var(--border)', padding: '12px 24px', borderRadius: '8px', fontWeight: 600 }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card skeleton" style={{ height: '200px' }}></div>) :
        banners.length === 0 ? (
          <div className="card" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No banners. Add one above.</div>
        ) : banners.map((b: any) => (
          <div key={b.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <img src={b.image_url} alt={b.title} style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }}
                onError={e => { (e.target as any).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="150" viewBox="0 0 320 150"><rect fill="%23141428" width="320" height="150"/><text fill="%23555" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="14">No Image</text></svg>'; }} />
              <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '6px' }}>
                <span style={{ background: b.status === 'active' ? 'rgba(5,150,105,0.9)' : 'rgba(220,38,38,0.9)', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>{b.status}</span>
              </div>
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{b.title}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>📍 {b.position}</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => toggleStatus(b)} style={{ flex: 1, padding: '7px', borderRadius: '6px', background: b.status === 'active' ? 'rgba(220,38,38,0.08)' : 'rgba(5,150,105,0.08)', color: b.status === 'active' ? 'var(--danger)' : 'var(--accent-green)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>
                  {b.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => { setForm({ title: b.title, image_url: b.image_url, link: b.link || '', position: b.position, status: b.status }); setEditing(b); setShowForm(true); }} style={{ flex: 1, padding: '7px', borderRadius: '6px', background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Edit</button>
                <button onClick={() => del(b.id)} style={{ flex: 1, padding: '7px', borderRadius: '6px', background: 'rgba(220,38,38,0.08)', color: 'var(--danger)', fontWeight: 600, fontSize: '12px', cursor: 'pointer', border: 'none' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannersPage;

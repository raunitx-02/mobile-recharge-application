import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const NotificationsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', body: '', target: 'all', data: '' });
  const [sending, setSending] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotificationLogs();
      const d = res.data.data || res.data;
      setLogs(Array.isArray(d) ? d : d.logs || d.rows || []);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadLogs(); }, []);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) { toast.error('Title and message are required'); return; }
    setSending(true);
    try {
      await adminApi.sendNotification(form);
      toast.success(`Notification sent to ${form.target === 'all' ? 'all users' : form.target}!`);
      setForm({ title: '', body: '', target: 'all', data: '' });
      loadLogs();
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to send'); }
    finally { setSending(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Push Notifications</h2>

      {/* Broadcast Form */}
      <div className="card" style={{ border: '2px solid var(--primary)' }}>
        <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🔔</span> Send Broadcast Notification
        </h3>
        <form onSubmit={send} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Title *</label>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Notification title" maxLength={100} />
            </div>
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label">Target Audience</label>
              <select className="input-field" value={form.target} onChange={e => setForm(f => ({ ...f, target: e.target.value }))}>
                <option value="all">All Users</option>
                <option value="active">Active Users Only</option>
                <option value="kyc_pending">KYC Pending Users</option>
              </select>
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Message *</label>
            <textarea
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Notification message body..."
              maxLength={200}
              style={{ padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', resize: 'vertical', minHeight: '80px', outline: 'none' }}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{form.body.length}/200</div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Extra Data (JSON, optional)</label>
            <input className="input-field" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} placeholder='{"screen": "recharge"}' />
          </div>
          <div>
            <button type="submit" disabled={sending} className="btn btn-primary" style={{ padding: '12px 32px', opacity: sending ? 0.7 : 1 }}>
              {sending ? '⏳ Sending...' : '🚀 Send Notification'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Logs */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '15px' }}>
          Notification History
        </div>
        <table>
          <thead><tr><th>Title</th><th>Message</th><th>Target</th><th>Sent To</th><th>Status</th><th>Sent At</th></tr></thead>
          <tbody>
            {loading ? Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j}><div className="skeleton" style={{ height: '16px', width: '90px' }}></div></td>)}</tr>
            )) : logs.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No notifications sent yet</td></tr>
            ) : logs.map((n: any) => (
              <tr key={n.id}>
                <td style={{ fontWeight: 600, maxWidth: '200px' }}>{n.title}</td>
                <td style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '250px' }}>{n.body}</td>
                <td><span style={{ background: 'rgba(79,70,229,0.08)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>{n.target}</span></td>
                <td style={{ fontWeight: 600 }}>{(n.sent_count || n.sentCount || '—').toLocaleString()}</td>
                <td>
                  <span style={{ background: n.status === 'sent' ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)', color: n.status === 'sent' ? 'var(--accent-green)' : 'var(--danger)', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                    {n.status || 'sent'}
                  </span>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(n.created_at || n.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NotificationsPage;

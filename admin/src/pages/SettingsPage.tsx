import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/api';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      setSettings(res.data.data || res.data || {});
    } catch { toast.error('Failed to load settings'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast.success('Settings saved!');
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    try {
      await adminApi.changePassword(pwForm);
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e: any) { toast.error(e.response?.data?.message || 'Failed to change password'); }
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="card" style={{ marginBottom: 0 }}>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>{title}</h3>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: 700 }}>Settings</h2>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {[1, 2, 3].map(i => <div key={i} className="card skeleton" style={{ height: '200px' }}></div>)}
        </div>
      ) : (
        <>
          <Section title="🏪 App Settings">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">App Name</label>
                <input className="input-field" value={settings.app_name || ''} onChange={e => setSettings((s: any) => ({ ...s, app_name: e.target.value }))} placeholder="OptionsPay" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Support Email</label>
                <input className="input-field" type="email" value={settings.support_email || ''} onChange={e => setSettings((s: any) => ({ ...s, support_email: e.target.value }))} placeholder="support@optionspay.in" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Support Phone</label>
                <input className="input-field" value={settings.support_phone || ''} onChange={e => setSettings((s: any) => ({ ...s, support_phone: e.target.value }))} placeholder="18001234567" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Min Recharge Amount (₹)</label>
                <input className="input-field" type="number" value={settings.min_recharge || ''} onChange={e => setSettings((s: any) => ({ ...s, min_recharge: e.target.value }))} placeholder="10" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Max Recharge Amount (₹)</label>
                <input className="input-field" type="number" value={settings.max_recharge || ''} onChange={e => setSettings((s: any) => ({ ...s, max_recharge: e.target.value }))} placeholder="10000" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Referral Bonus (₹)</label>
                <input className="input-field" type="number" value={settings.referral_bonus || ''} onChange={e => setSettings((s: any) => ({ ...s, referral_bonus: e.target.value }))} placeholder="25" />
              </div>
            </div>
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div style={{
                  width: '48px', height: '26px', borderRadius: '13px',
                  background: settings.maintenance_mode ? 'var(--danger)' : 'var(--accent-green)',
                  position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
                }} onClick={() => setSettings((s: any) => ({ ...s, maintenance_mode: !s.maintenance_mode }))}>
                  <div style={{
                    position: 'absolute', top: '3px', left: settings.maintenance_mode ? '25px' : '3px',
                    width: '20px', height: '20px', borderRadius: '50%', background: 'white', transition: 'left 0.2s'
                  }} />
                </div>
                <span style={{ fontWeight: 600, color: settings.maintenance_mode ? 'var(--danger)' : 'var(--accent-green)' }}>
                  {settings.maintenance_mode ? '⚠️ Maintenance Mode ON' : '✅ App is Live'}
                </span>
              </label>
            </div>
          </Section>

          <Section title="💳 Payment Settings">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Payment Gateway</label>
                <select className="input-field" value={settings.payment_gateway || 'payu'} onChange={e => setSettings((s: any) => ({ ...s, payment_gateway: e.target.value }))}>
                  <option value="payu">PayU</option>
                  <option value="razorpay">Razorpay</option>
                  <option value="cashfree">Cashfree</option>
                </select>
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Wallet Min Add (₹)</label>
                <input className="input-field" type="number" value={settings.min_wallet_add || ''} onChange={e => setSettings((s: any) => ({ ...s, min_wallet_add: e.target.value }))} placeholder="10" />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Wallet Max Add (₹)</label>
                <input className="input-field" type="number" value={settings.max_wallet_add || ''} onChange={e => setSettings((s: any) => ({ ...s, max_wallet_add: e.target.value }))} placeholder="50000" />
              </div>
            </div>
          </Section>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={saveSettings} disabled={saving} className="btn btn-primary" style={{ padding: '12px 32px', opacity: saving ? 0.7 : 1 }}>
              {saving ? '⏳ Saving...' : '💾 Save Settings'}
            </button>
          </div>

          <Section title="🔒 Change Admin Password">
            <form onSubmit={changePassword} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Current Password</label>
                <input className="input-field" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">New Password</label>
                <input className="input-field" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} />
              </div>
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Confirm New Password</label>
                <input className="input-field" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} />
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <button type="submit" className="btn btn-primary">Change Password</button>
              </div>
            </form>
          </Section>
        </>
      )}
    </div>
  );
};

export default SettingsPage;

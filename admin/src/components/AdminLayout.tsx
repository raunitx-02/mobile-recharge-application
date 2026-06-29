import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const navItems = [
  { section: 'OVERVIEW', items: [{ to: '/', label: 'Dashboard', icon: '📊' }] },
  {
    section: 'USERS', items: [
      { to: '/users', label: 'Users', icon: '👥' },
    ]
  },
  {
    section: 'FINANCE', items: [
      { to: '/transactions', label: 'Transactions', icon: '🔄' },
      { to: '/wallet', label: 'Wallet / Funds', icon: '💳' },
      { to: '/commission', label: 'Commission', icon: '📈' },
      { to: '/reports', label: 'Reports', icon: '📋' },
    ]
  },
  {
    section: 'CONTENT', items: [
      { to: '/operators', label: 'Operators', icon: '🗂️' },
      { to: '/plans', label: 'Plans', icon: '📦' },
      { to: '/banners', label: 'Banners', icon: '🖼️' },
      { to: '/offers', label: 'Offers', icon: '🎁' },
    ]
  },
  {
    section: 'COMMS', items: [
      { to: '/notifications', label: 'Notifications', icon: '🔔' },
    ]
  },
  {
    section: 'SYSTEM', items: [
      { to: '/settings', label: 'Settings', icon: '⚙️' },
    ]
  },
];

const AdminLayout: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '64px',
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        position: 'fixed',
        height: '100vh',
        top: 0,
        left: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: '14px' }}>OP</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px' }}>OptionsPay</div>
                <div style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Admin</div>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px', padding: '4px' }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {navItems.map(group => (
            <div key={group.section}>
              {sidebarOpen && (
                <div style={{ padding: '12px 16px 6px', fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                  {group.section}
                </div>
              )}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: sidebarOpen ? '10px 16px' : '12px',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    margin: '2px 8px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '13px',
                    transition: 'all 0.15s',
                    background: isActive ? 'rgba(108,60,225,0.12)' : 'transparent',
                    color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                    borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                  })}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{item.icon}</span>
                  {sidebarOpen && item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User Info */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          {sidebarOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin?.name || 'Admin'}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{admin?.email}</div>
              </div>
              <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px', padding: '4px', flexShrink: 0 }}>↩</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white' }}>
                {admin?.name?.charAt(0) || 'A'}
              </div>
              <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>↩</button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: sidebarOpen ? '240px' : '64px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s ease' }}>
        {/* Top Bar */}
        <header style={{ height: '60px', background: 'var(--sidebar-bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>OptionsPay Admin Console</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>🟢 System Live</div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, padding: '24px', maxWidth: '1400px', width: '100%' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

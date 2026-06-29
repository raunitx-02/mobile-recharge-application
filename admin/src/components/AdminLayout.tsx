import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const AdminLayout: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const navGroups = [
    {
      label: 'OVERVIEW',
      links: [{ to: '/', icon: '📊', label: 'Dashboard' }]
    },
    {
      label: 'USERS',
      links: [{ to: '/users', icon: '👥', label: 'Users' }]
    },
    {
      label: 'FINANCE',
      links: [
        { to: '/transactions', icon: '💳', label: 'Transactions' },
        { to: '/wallet', icon: '👛', label: 'Wallet' },
        { to: '/commission', icon: '📊', label: 'Commission' },
        { to: '/reports', icon: '📄', label: 'Reports' }
      ]
    },
    {
      label: 'CONTENT',
      links: [
        { to: '/operators', icon: '📡', label: 'Operators' },
        { to: '/plans', icon: '📋', label: 'Plans' },
        { to: '/banners', icon: '🖼️', label: 'Banners' },
        { to: '/offers', icon: '🎁', label: 'Offers' }
      ]
    },
    {
      label: 'COMMS',
      links: [{ to: '/notifications', icon: '🔔', label: 'Notifications' }]
    },
    {
      label: 'SYSTEM',
      links: [
        { to: '/api-config', icon: '⚙️', label: 'API Config' },
        { to: '/settings', icon: '🔧', label: 'Settings' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 240,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '24px' }}>💳</span>
          <div style={{ fontWeight: 800, fontSize: '18px', color: '#fff' }}>OptionsPay</div>
          <span style={{
            background: 'rgba(108,60,225,0.2)',
            color: 'var(--primary-light)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 700
          }}>ADMIN</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          {navGroups.map((group, idx) => (
            <div key={idx} style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '8px',
                paddingLeft: '12px',
                letterSpacing: '0.05em'
              }}>{group.label}</div>
              {group.links.map(link => {
                const isActive = location.pathname === link.to || 
                               (link.to !== '/' && location.pathname.startsWith(link.to));
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      color: isActive ? 'var(--primary-light)' : 'var(--text-main)',
                      background: isActive ? 'var(--primary-hover)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      marginBottom: '4px',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: isActive ? 600 : 500
                    }}
                  >
                    <span>{link.icon}</span>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
          }}>
            {admin?.name?.charAt(0) || 'A'}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{admin?.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{admin?.email}</div>
          </div>
          <button onClick={logout} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer' }} title="Logout">
            🚪
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 60,
          background: 'var(--sidebar-bg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px'
        }}>
          <div style={{ fontWeight: 600, fontSize: '16px' }}>OptionsPay Admin Console</div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ cursor: 'pointer' }}>🔔</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px' }}>{admin?.name}</span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

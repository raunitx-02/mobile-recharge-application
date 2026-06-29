import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: string;
  color?: 'purple' | 'green' | 'amber' | 'red';
  loading?: boolean;
}

const colorMap = {
  purple: 'var(--primary)',
  green: 'var(--accent-green)',
  amber: 'var(--accent-amber)',
  red: 'var(--danger)',
};

const bgMap = {
  purple: 'rgba(108, 60, 225, 0.1)',
  green: 'rgba(16, 185, 129, 0.1)',
  amber: 'rgba(245, 158, 11, 0.1)',
  red: 'rgba(239, 68, 68, 0.1)',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color = 'purple', loading }) => {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
      <div style={{
        width: '48px', height: '48px',
        borderRadius: '12px',
        background: bgMap[color],
        color: colorMap[color],
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>{title}</div>
        {loading ? (
          <div className="skeleton" style={{ height: '28px', width: '80px' }}></div>
        ) : (
          <div style={{ fontSize: '24px', fontWeight: 800 }}>{value}</div>
        )}
        {change && (
          <div style={{ fontSize: '12px', color: change.startsWith('+') ? 'var(--accent-green)' : 'var(--danger)', marginTop: '4px' }}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

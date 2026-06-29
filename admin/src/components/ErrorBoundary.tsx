import React from 'react';

interface State { hasError: boolean; error?: Error; }

export class ErrorBoundary extends React.Component<{ children: React.ReactNode; pageName?: string }, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('Admin panel error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '400px', gap: '16px', padding: '40px'
        }}>
          <div style={{ fontSize: '48px' }}>⚠️</div>
          <h3 style={{ color: 'var(--danger)', fontSize: '18px' }}>Something went wrong</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', textAlign: 'center', fontSize: '14px' }}>
            {this.state.error?.message || 'An unexpected error occurred on this page.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '10px 24px', background: 'var(--primary)', color: 'white',
              borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

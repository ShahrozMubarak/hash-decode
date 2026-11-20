import type { HTMLAttributes } from 'react';

export default function TerminalMock(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="visual-panel terminal-mock" {...props}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          paddingBottom: '12px',
          borderBottom: '1px solid currentColor',
          opacity: 0.5,
          marginBottom: '16px',
        }}
      >
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
        <span style={{ marginLeft: '8px', fontSize: '11px', fontFamily: 'var(--font-sans)', opacity: 0.6 }}>
          terminal
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          lineHeight: '1.6',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ opacity: 0.5 }}>›</span>
          <span>release --verify</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', opacity: 0.75 }}>
          <span>✓</span>
          <span>0 vulnerabilities detected</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', opacity: 0.75 }}>
          <span>✓</span>
          <span>zero-trust headers enforced</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', opacity: 0.75 }}>
          <span>✓</span>
          <span>architecture audit passed</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontWeight: 600 }}>
          <span style={{ opacity: 0.5 }}>›</span>
          <span>ready for deployment</span>
        </div>
      </div>
    </div>
  );
}


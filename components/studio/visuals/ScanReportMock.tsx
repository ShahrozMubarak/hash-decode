import type { HTMLAttributes } from 'react';
import { Check } from 'lucide-react';

export default function ScanReportMock(props: HTMLAttributes<HTMLDivElement>) {
  const items = [
    { label: 'Content Security Policy', status: 'Enforced' },
    { label: 'Strict Transport Security', status: 'Preloaded' },
    { label: 'Frame Protection & Sandbox', status: 'Active' },
    { label: 'Automated Exploit Scan', status: 'Verified' },
  ];

  return (
    <div className="visual-panel scan-report-mock" {...props}>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 600,
          textTransform: 'none',
          paddingBottom: '12px',
          borderBottom: '1px solid currentColor',
          opacity: 0.6,
          marginBottom: '12px',
        }}
      >
        Security audit sign-off
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              padding: '6px 0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  border: '1.5px solid currentColor',
                }}
              >
                <Check size={10} strokeWidth={3} />
              </span>
              <span>{item.label}</span>
            </div>
            <span style={{ opacity: 0.6, fontWeight: 500 }}>{item.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


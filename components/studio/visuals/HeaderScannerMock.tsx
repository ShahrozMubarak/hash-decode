import type { HTMLAttributes } from 'react';
import { Check } from 'lucide-react';

export default function HeaderScannerMock(props: HTMLAttributes<HTMLDivElement>) {
  const headers = [
    { name: 'Strict-Transport-Security', value: 'max-age=63072000' },
    { name: 'Content-Security-Policy', value: 'default-src \'self\'' },
    { name: 'X-Content-Type-Options', value: 'nosniff' },
    { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ];

  return (
    <div className="visual-panel header-scanner-mock" {...props}>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 600,
          paddingBottom: '12px',
          borderBottom: '1px solid currentColor',
          opacity: 0.6,
          marginBottom: '12px',
        }}
      >
        HTTP security headers
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {headers.map((h) => (
          <div
            key={h.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontFamily: 'var(--font-sans)',
              fontSize: '12px',
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
              <span style={{ fontWeight: 600 }}>{h.name}</span>
            </div>
            <span style={{ opacity: 0.5, fontSize: '11px' }}>{h.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


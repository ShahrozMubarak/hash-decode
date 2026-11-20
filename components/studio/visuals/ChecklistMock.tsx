import type { HTMLAttributes } from 'react';
import { Check } from 'lucide-react';

export default function ChecklistMock(props: HTMLAttributes<HTMLDivElement>) {
  const steps = [
    'Exploit surface identified and scoped',
    'Automated and manual penetration complete',
    'Vulnerability remediation verified',
    'Architectural sign-off document delivered',
  ];

  return (
    <div className="visual-panel checklist-mock" {...props}>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 600,
          paddingBottom: '12px',
          borderBottom: '1px solid currentColor',
          opacity: 0.6,
          marginBottom: '14px',
        }}
      >
        Verification protocol
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((step) => (
          <div
            key={step}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'var(--font-sans)',
              fontSize: '13px',
              lineHeight: '1.4',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: '1.5px solid currentColor',
                flexShrink: 0,
              }}
            >
              <Check size={11} strokeWidth={3} />
            </span>
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}


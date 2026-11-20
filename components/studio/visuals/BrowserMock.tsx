import type { HTMLAttributes } from 'react';

export default function BrowserMock(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="visual-panel browser-mock" {...props}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          paddingBottom: '16px',
          borderBottom: '1px solid currentColor',
          opacity: 0.85,
        }}
      >
        <div style={{ display: 'flex', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor', opacity: 0.4 }} />
        </div>
        <div
          style={{
            marginLeft: 'auto',
            padding: '2px 12px',
            borderRadius: '980px',
            fontSize: '11px',
            fontFamily: 'var(--font-sans)',
            border: '1px solid currentColor',
            opacity: 0.6,
          }}
        >
          hashdecode.com/app
        </div>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '80px 1fr',
          gap: '12px',
          paddingTop: '16px',
          flex: 1,
        }}
      >
        <div
          style={{
            borderRadius: '8px',
            border: '1px solid currentColor',
            opacity: 0.25,
            height: '100%',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            style={{
              height: '24px',
              borderRadius: '6px',
              border: '1px solid currentColor',
              opacity: 0.35,
              width: '65%',
            }}
          />
          <div
            style={{
              height: '14px',
              borderRadius: '4px',
              border: '1px solid currentColor',
              opacity: 0.2,
              width: '90%',
            }}
          />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              marginTop: 'auto',
            }}
          >
            <div
              style={{
                height: '56px',
                borderRadius: '8px',
                border: '1px solid currentColor',
                opacity: 0.2,
              }}
            />
            <div
              style={{
                height: '56px',
                borderRadius: '8px',
                border: '1px solid currentColor',
                opacity: 0.2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


import type { HTMLAttributes } from 'react';

export default function CostEstimatorMock(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="visual-panel cost-estimator-mock" {...props}>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '13px',
          fontWeight: 600,
          paddingBottom: '12px',
          borderBottom: '1px solid currentColor',
          opacity: 0.6,
          marginBottom: '16px',
        }}
      >
        Project scope configuration
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Step indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-sans)', opacity: 0.8 }}>
          <span style={{ fontWeight: 600 }}>01 Foundation</span>
          <span>02 Features</span>
          <span>03 Scale</span>
        </div>
        {/* Progress visual bar */}
        <div style={{ height: '6px', borderRadius: '3px', background: 'currentColor', opacity: 0.15, position: 'relative' }}>
          <div style={{ width: '45%', height: '100%', borderRadius: '3px', background: 'currentColor', opacity: 0.8 }} />
        </div>
        {/* Abstract option blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '6px' }}>
          <div style={{ padding: '10px', borderRadius: '8px', border: '1px solid currentColor', opacity: 0.8, fontSize: '12px', fontWeight: 600 }}>
            Custom Platform
          </div>
          <div style={{ padding: '10px', borderRadius: '8px', border: '1px solid currentColor', opacity: 0.35, fontSize: '12px' }}>
            Internal Tool
          </div>
        </div>
        {/* Metric outline */}
        <div
          style={{
            marginTop: 'auto',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid currentColor',
            opacity: 0.6,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
          }}
        >
          <span>Delivery cadence</span>
          <span style={{ fontWeight: 600 }}>Weekly milestones</span>
        </div>
      </div>
    </div>
  );
}


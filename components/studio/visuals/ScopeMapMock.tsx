import type { HTMLAttributes } from 'react';

export default function ScopeMapMock(props: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="visual-panel scope-map-mock" {...props}>
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
        Attack surface mapping
      </div>
      <svg
        viewBox="0 0 380 160"
        fill="none"
        stroke="currentColor"
        style={{ width: '100%', height: 'auto', flex: 1 }}
      >
        {/* Connection Lines */}
        <line x1="60" y1="80" x2="150" y2="80" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
        <line x1="190" y1="80" x2="270" y2="40" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
        <line x1="190" y1="80" x2="270" y2="120" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />

        {/* Node 1: Entry */}
        <circle cx="50" cy="80" r="18" strokeWidth="1.5" />
        <circle cx="50" cy="80" r="6" fill="currentColor" />
        <text x="50" y="116" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600" opacity="0.8">
          Entry
        </text>

        {/* Node 2: Gateway */}
        <circle cx="170" cy="80" r="22" strokeWidth="1.5" />
        <circle cx="170" cy="80" r="8" fill="currentColor" />
        <text x="170" y="122" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600" opacity="0.8">
          Gateway
        </text>

        {/* Node 3: API Service */}
        <circle cx="290" cy="40" r="16" strokeWidth="1.5" />
        <circle cx="290" cy="40" r="5" fill="currentColor" />
        <text x="290" y="70" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600" opacity="0.8">
          Services
        </text>

        {/* Node 4: Storage */}
        <circle cx="290" cy="120" r="16" strokeWidth="1.5" />
        <circle cx="290" cy="120" r="5" fill="currentColor" />
        <text x="290" y="150" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="var(--font-sans)" fontWeight="600" opacity="0.8">
          Storage
        </text>
      </svg>
    </div>
  );
}


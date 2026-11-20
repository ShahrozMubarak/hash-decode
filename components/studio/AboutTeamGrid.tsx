'use client';

import type { Founder } from '@/lib/studio-data';

export default function AboutTeamGrid({ founders }: { founders?: Founder[] }) {
  if (!founders || founders.length === 0) return null;

  return (
    <div
      className="about-founders-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--s-6)',
        marginTop: 'var(--s-5)',
      }}
    >
      {founders.map((founder) => (
        <article
          key={founder.id || founder.name}
          className="about-founder-card"
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <div
            style={{
              width: '100%',
              aspectRatio: '4 / 5',
              borderRadius: '28px',
              overflow: 'hidden',
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <img
              src={founder.image}
              alt={founder.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0, color: '#000000' }}>
              {founder.name}
            </h3>
            <p style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: '#000000' }}>
              {founder.role}
            </p>
            <p
              style={{
                fontSize: '15px',
                fontWeight: 400,
                lineHeight: 1.5,
                margin: '8px 0 0',
                color: '#000000',
              }}
            >
              {founder.bio}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

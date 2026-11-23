'use client';

import { defaultFounders, type Founder } from '@/lib/studio-defaults';
import WideCard from './WideCard';
import type { LiquidPalette } from './Liquid';

export default function AboutTeamGrid({ founders }: { founders?: Founder[] }) {
  const list = (founders && founders.length > 0) ? founders : defaultFounders;
  const palettes: LiquidPalette[] = ['midnight', 'mint', 'peach', 'teal'];

  return (
    <div
      className="about-founders-wide-stack"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--s-5)',
        marginTop: 'var(--s-6)',
        width: '100%',
      }}
    >
      {list.map((founder, idx) => {
        const palette = palettes[idx % palettes.length];
        const isDark = palette === 'midnight' || palette === 'teal';

        return (
          <WideCard
            key={founder.id || founder.name}
            palette={palette}
            reverse={idx % 2 === 1}
            eyebrow={founder.role}
            title={founder.name}
            desc={
              <>
                <p style={{ margin: 0 }}>{founder.bio}</p>
                {founder.quote && (
                  <p className="desktop-only-quote" style={{ margin: '8px 0 0', fontStyle: 'italic', opacity: 0.85 }}>
                    “{founder.quote}”
                  </p>
                )}
              </>
            }
            linkText={founder.url ? 'Connect on LinkedIn ›' : undefined}
            linkHref={founder.url || 'https://linkedin.com/company/hash-decode'}
            visual={
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    maxWidth: '460px',
                    aspectRatio: '4 / 5',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: 'rgba(0,0,0,0.06)',
                    border: isDark
                      ? '1px solid rgba(255, 255, 255, 0.12)'
                      : '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  <img
                    src={founder.image}
                    alt={founder.name}
                    width={819}
                    height={1024}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    loading="lazy"
                  />
                </div>
              </div>
            }
          />
        );
      })}
    </div>
  );
}

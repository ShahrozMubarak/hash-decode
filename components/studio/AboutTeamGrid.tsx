'use client';

import { useState, useEffect } from 'react';
import type { Founder } from '@/lib/studio-data';

function TypewriterText({ text, speed = 28 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const timer = setInterval(() => {
      index++;
      if (index <= text.length) {
        setDisplayed(text.slice(0, index));
      } else {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="typewriter-cursor" aria-hidden="true">|</span>
      )}
    </span>
  );
}

const cardThemes = [
  {
    bg: '#0A2540', // Founder 1: Deep Midnight Sapphire
    text: '#ffffff',
    subText: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(14, 165, 233, 0.28)',
  },
  {
    bg: '#edf7f2', // Founder 2: Muted Sage Mist
    text: '#064e3b',
    subText: '#047857',
    border: '1px solid rgba(16, 185, 129, 0.24)',
  },
  {
    bg: '#fffbeb', // Founder 3: Warm Amber Sand
    text: '#78350f',
    subText: '#b45309',
    border: '1px solid rgba(245, 158, 11, 0.26)',
  },
  {
    bg: '#0B1F3A', // Founder 4: Deep Azure Navy
    text: '#ffffff',
    subText: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(37, 99, 235, 0.28)',
  },
];

export default function AboutTeamGrid({ founders }: { founders?: Founder[] }) {
  if (!founders || founders.length === 0) return null;

  return (
    <div
      className="about-founders-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--s-6)',
        marginTop: 'var(--s-6)',
      }}
    >
      {founders.map((founder, idx) => {
        const theme = cardThemes[idx % cardThemes.length];
        return (
          <article
            key={founder.id || founder.name}
            className="about-founder-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              background: theme.bg,
              color: theme.text,
              borderRadius: '32px',
              padding: 'clamp(24px, 4vw, 36px)',
              border: theme.border,
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.05)',
              transition: 'transform 0.28s ease, box-shadow 0.28s ease',
            }}
          >
            <div
              style={{
                width: '100%',
                aspectRatio: '4 / 5',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={founder.image}
                alt={founder.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: theme.text }}>
                {founder.name}
              </h3>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  margin: 0,
                  color: theme.subText,
                  letterSpacing: '-0.01em',
                }}
              >
                <TypewriterText text={founder.role} speed={32} />
              </p>
              <p
                style={{
                  fontSize: '15px',
                  fontWeight: 400,
                  lineHeight: 1.55,
                  margin: '12px 0 0',
                  color: theme.text,
                  opacity: 0.9,
                }}
              >
                {founder.bio}
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

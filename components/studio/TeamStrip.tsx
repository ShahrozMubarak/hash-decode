'use client';

import { useState } from 'react';
import type { Founder } from '@/lib/studio-data';

function FounderAvatar({ name, image }: { name: string; image?: string }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (!image || image.endsWith('.svg') || imgError) {
    return (
      <div className="team-monogram-avatar" aria-label={`Monogram avatar for ${name}`}>
        <span className="team-monogram-initials">{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <div className="team-avatar-container">
      <img
        src={image}
        alt={name}
        width={96}
        height={96}
        loading="lazy"
        className="team-avatar-image"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default function TeamStrip({ founders }: { founders?: Founder[] }) {
  const list = (founders || []).slice(0, 4);

  return (
    <div className="team-strip-grid" data-stagger>
      {list.map((f) => (
        <article key={f.id || f.name} className="team-strip-card hd-card" data-reveal="up">
          <div className="card-glare" aria-hidden="true" />
          <FounderAvatar name={f.name} image={f.image} />
          <h3 className="team-member-name">{f.name}</h3>
          <span className="team-role-tag">{f.role}</span>
        </article>
      ))}
    </div>
  );
}

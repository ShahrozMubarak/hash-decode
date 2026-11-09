'use client';

import { useState } from 'react';
import type { Founder } from '@/lib/studio-data';
import { ChevronDown, ChevronUp } from 'lucide-react';

function FounderAvatar({ name, image }: { name: string; image?: string }) {
  const [imgError, setImgError] = useState(false);

  const getInitials = (n: string) =>
    n
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

  if (!image || imgError) {
    return (
      <div className="about-monogram-avatar" aria-label={`Monogram avatar for ${name}`}>
        <span className="about-monogram-initials">{getInitials(name)}</span>
      </div>
    );
  }

  return (
    <div className="about-avatar-container">
      <img
        src={image}
        alt={name}
        width={96}
        height={96}
        loading="lazy"
        className="about-avatar-image"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

function FounderGridCard({ founder, index }: { founder: Founder; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article
      className="about-founder-card hd-card"
      data-reveal="up"
      data-reveal-delay={index * 90}
    >
      <div className="card-glare" aria-hidden="true" />
      <div className="about-card-top">
        <FounderAvatar name={founder.name} image={founder.image} />
        <div className="about-card-header">
          <h3 className="about-founder-name">{founder.name}</h3>
          <span className="about-founder-role">{founder.role}</span>
        </div>
      </div>

      {founder.quote && (
        <blockquote className="about-founder-quote">
          <p>&ldquo;{founder.quote}&rdquo;</p>
        </blockquote>
      )}

      {founder.bio && (
        <div className="about-founder-bio-wrap">
          <div className={`about-bio-accordion ${expanded ? 'is-expanded' : 'is-clamped'}`}>
            <p className="about-bio-text">{founder.bio}</p>
          </div>
          {founder.bio.length > 160 && (
            <button
              type="button"
              className="about-bio-toggle-btn"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              <span>{expanded ? 'Read less' : 'Read more'}</span>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      )}

      {founder.skills && founder.skills.length > 0 && (
        <div className="about-card-skills">
          {founder.skills.map((skill) => (
            <span key={skill} className="about-skill-pill">
              {skill}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export default function AboutTeamGrid({ founders }: { founders: Founder[] }) {
  return (
    <div className="about-team-grid" data-stagger>
      {founders.map((f, idx) => (
        <FounderGridCard key={f.id || f.name} founder={f} index={idx} />
      ))}
    </div>
  );
}

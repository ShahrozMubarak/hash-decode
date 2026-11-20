'use client';

import { useState } from 'react';
import type { Founder } from '@/lib/studio-data';

function formatRole(role: string): string {
  return role.replace(/\bhead\b/gi, 'Head');
}

interface MemberTheme {
  key: string;
  defaultName: string;
  defaultRole: string;
  image: string;
  themeClass: string;
}

const MEMBERS: MemberTheme[] = [
  {
    key: 'fawad',
    defaultName: 'Fawad Feroz',
    defaultRole: 'Founder and Sales Head',
    image: '/team/fawad.jpeg',
    themeClass: 'team-card-black',
  },
  {
    key: 'junaid',
    defaultName: 'Junaid Jawaid',
    defaultRole: 'Editor and Marketing Head',
    image: '/team/junaid.jpeg',
    themeClass: 'team-card-white',
  },
  {
    key: 'shahmeer',
    defaultName: 'Shahmeer Hasan',
    defaultRole: 'Automation and Digital Marketing Head',
    image: '/team/shahmeer.jpeg',
    themeClass: 'team-card-tint',
  },
  {
    key: 'shahroz',
    defaultName: 'Shahroz Mubarak',
    defaultRole: 'Development Director',
    image: '/team/shahroz.jpeg',
    themeClass: 'team-card-navy',
  },
];

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
        width={88}
        height={88}
        loading="lazy"
        className="team-avatar-image"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

export default function TeamStrip({ founders }: { founders?: Founder[] }) {
  const founderList = founders || [];

  const members = MEMBERS.map((slot) => {
    const matched = founderList.find(
      (f) =>
        f.id?.toLowerCase().includes(slot.key) ||
        f.name?.toLowerCase().includes(slot.key) ||
        f.image?.toLowerCase().includes(slot.key)
    );

    let name = slot.defaultName;
    let role = slot.defaultRole;

    if (matched) {
      const isOldPlaceholderName =
        matched.name === 'Fawad Ahmed' ||
        matched.name === 'Junaid Tariq' ||
        matched.name === 'Shahmeer Khan' ||
        matched.name === 'Shahroz Dogar';

      const isOldPlaceholderRole =
        matched.role === 'Senior DevOps & Security Engineer' ||
        matched.role === 'Co-Founder & Full-Stack Systems Engineer' ||
        matched.role === 'Lead Product & Interaction Designer' ||
        matched.role === 'Co-Founder & Lead Systems Architect';

      name = isOldPlaceholderName ? slot.defaultName : matched.name || slot.defaultName;
      role = isOldPlaceholderRole ? slot.defaultRole : matched.role || slot.defaultRole;
    }

    return {
      key: slot.key,
      name,
      role: formatRole(role),
      image: matched?.image || slot.image,
      themeClass: slot.themeClass,
    };
  });

  return (
    <div className="team-strip-grid" data-stagger>
      {members.map((m) => (
        <article
          key={m.key}
          className={`team-strip-card hd-card ${m.themeClass}`}
          data-reveal="up"
        >
          <FounderAvatar name={m.name} image={m.image} />
          <h3 className="team-member-name">{m.name}</h3>
          <span className="team-role-tag">{m.role}</span>
        </article>
      ))}
    </div>
  );
}

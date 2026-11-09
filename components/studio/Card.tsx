'use client';

import React from 'react';
import Link from 'next/link';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
  tilt?: boolean;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export default function Card({
  href,
  tilt = true,
  children,
  className = '',
  ariaLabel,
  ...rest
}: CardProps) {
  const cardClasses = [
    'hd-card',
    tilt ? 'hd-card-tilt' : '',
    href ? 'is-clickable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...rest}>
      {/* Glare overlay following pointer */}
      <div className="card-glare" aria-hidden="true" />
      {children}
      {href && (
        <Link
          href={href}
          className="stretched-link"
          aria-label={ariaLabel || 'View details'}
        />
      )}
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text-link' | 'icon';
  href?: string;
  loading?: boolean;
  success?: boolean;
  magnetic?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  href,
  loading = false,
  success = false,
  magnetic = false,
  icon,
  className = '',
  children,
  disabled,
  onClick,
  ...rest
}: ButtonProps) {
  const [internalSuccess, setInternalSuccess] = useState(success);

  const baseClass =
    variant === 'primary'
      ? 'hd-btn-primary'
      : variant === 'secondary'
      ? 'hd-btn-secondary'
      : variant === 'text-link'
      ? 'hd-text-link'
      : 'hd-icon-btn';

  const classes = [
    baseClass,
    magnetic ? 'cta-magnetic' : '',
    loading ? 'is-loading' : '',
    internalSuccess ? 'is-success' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      <span className="btn-label">{children}</span>

      {variant === 'primary' && (
        <span className="btn-arrow-circle" aria-hidden="true">
          <span className="btn-arrow-track">
            <span className="btn-arrow-icon btn-arrow-primary">
              <ArrowUpRight size={15} />
            </span>
            <span className="btn-arrow-icon btn-arrow-clone">
              <ArrowUpRight size={15} />
            </span>
          </span>
        </span>
      )}

      {variant === 'text-link' && (
        <span className="link-arrow" aria-hidden="true">
          <ArrowUpRight size={15} />
        </span>
      )}

      {variant === 'icon' && icon}

      {/* Loading Spinner */}
      <span className="btn-spinner" aria-hidden="true" />

      {/* Success Checkmark */}
      <span className="btn-check" aria-hidden="true">
        <Check size={18} strokeWidth={2.5} />
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        aria-busy={loading}
        aria-disabled={disabled}
        role="button"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      onClick={onClick}
      {...rest}
    >
      {content}
    </button>
  );
}


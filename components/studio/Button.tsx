'use client';

import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react';
import Link from 'next/link';

export type ButtonMode = 'light' | 'dark';
export type ButtonVariant = 'coral' | 'azure' | 'dark' | 'white' | 'glass';

interface BaseButtonProps {
  mode?: ButtonMode;
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

export type ButtonProps = BaseButtonProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
  );

export default function Button({
  mode = 'light',
  variant = 'coral',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const classes = `hd-btn-primary hd-btn-primary--${mode} hd-btn--${variant} ${className}`.trim();

  if ('href' in props && props.href) {
    const { href, ...rest } = props;
    return (
      <Link href={href} className={classes} {...(rest as any)}>
        <span className="btn-label">{children}</span>
      </Link>
    );
  }

  const { ...rest } = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...rest}>
      <span className="btn-label">{children}</span>
    </button>
  );
}

interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  className?: string;
  mode?: ButtonMode;
  variant?: 'azure' | 'coral' | 'dark';
}

export function TextLink({
  href,
  children,
  className = '',
  mode = 'light',
  variant = 'azure',
  ...props
}: TextLinkProps) {
  return (
    <Link
      href={href}
      className={`hd-text-link hd-text-link--${mode} hd-text-link--${variant} ${className}`.trim()}
      {...props}
    >
      <span>{children}</span>
      <span className="link-arrow" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}

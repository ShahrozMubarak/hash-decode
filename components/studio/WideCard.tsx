'use client';

import { useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react';
import type { LiquidPalette } from './Liquid';
import { getPaletteMode } from './Liquid';

export interface WideCardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  palette?: LiquidPalette;
  reverse?: boolean;
  stepNumber?: string | number;
  eyebrow?: string;
  title?: ReactNode;
  desc?: ReactNode;
  linkText?: string;
  linkHref?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaVariant?: 'coral' | 'azure' | 'dark' | 'white';
  visual?: ReactNode;
  children?: ReactNode;
  minHeight?: number | string;
  className?: string;
}

export default function WideCard({
  palette = 'cloud',
  reverse = false,
  stepNumber,
  eyebrow,
  title,
  desc,
  linkText,
  linkHref,
  ctaText,
  ctaHref,
  ctaVariant,
  visual,
  children,
  minHeight,
  className = '',
  ...props
}: WideCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const mode = getPaletteMode(palette);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('is-visible');
            el.classList.add('is-in');
          } else {
            el.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const reverseClass = reverse ? 'wide-card--reverse' : '';
  const style = minHeight ? { minHeight: typeof minHeight === 'number' ? `${minHeight}px` : minHeight } : undefined;

  return (
    <article
      ref={cardRef}
      className={`wide-card liquid liquid--${palette} ${reverseClass} ${className}`.trim()}
      data-mode={mode}
      style={style}
      {...props}
    >
      <span className="liquid__blob liquid__blob--a" aria-hidden="true" />
      <span className="liquid__blob liquid__blob--b" aria-hidden="true" />

      {children ? (
        children
      ) : (
        <>
          <div className="wide-card__text">
            {stepNumber !== undefined && (
              <span className="wide-card__step-num" aria-hidden="true">
                {stepNumber}
              </span>
            )}
            {eyebrow && <p className="wide-card__eyebrow">{eyebrow}</p>}
            {title && <h3 className="wide-card__title">{title}</h3>}
            {desc && <div className="wide-card__desc">{desc}</div>}
            {linkText && linkHref && (
              <a href={linkHref} className="hd-text-link">
                <span>{linkText}</span>
              </a>
            )}
            {ctaText && ctaHref && (
              <a
                href={ctaHref}
                target={ctaHref.startsWith('http') ? '_blank' : undefined}
                rel={ctaHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={
                  ctaVariant === 'azure'
                    ? 'hd-btn-azure'
                    : ctaVariant === 'white'
                    ? 'hd-btn-white'
                    : ctaVariant === 'dark'
                    ? 'hd-btn-dark'
                    : 'hd-btn-primary hd-btn-coral'
                }
              >
                <span className="btn-label">{ctaText}</span>
              </a>
            )}
          </div>
          {visual && <div className="wide-card__visual">{visual}</div>}
        </>
      )}
    </article>
  );
}


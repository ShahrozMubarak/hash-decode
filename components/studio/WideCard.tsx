'use client';

import { useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react';
import type { LiquidPalette } from './Liquid';
import { getPaletteMode } from './Liquid';

export interface WideCardProps extends HTMLAttributes<HTMLElement> {
  palette?: LiquidPalette;
  reverse?: boolean;
  stepNumber?: string | number;
  title?: string;
  desc?: string;
  linkText?: string;
  linkHref?: string;
  visual?: ReactNode;
  children?: ReactNode;
  minHeight?: number | string;
  className?: string;
}

export default function WideCard({
  palette = 'cloud',
  reverse = false,
  stepNumber,
  title,
  desc,
  linkText,
  linkHref,
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
            {title && <h3 className="wide-card__title">{title}</h3>}
            {desc && <p className="wide-card__desc">{desc}</p>}
            {linkText && linkHref && (
              <a href={linkHref} className="hd-text-link">
                <span>{linkText}</span>
              </a>
            )}
          </div>
          {visual && <div className="wide-card__visual">{visual}</div>}
        </>
      )}
    </article>
  );
}


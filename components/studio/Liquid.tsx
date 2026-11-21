'use client';

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from 'react';

export type LiquidPalette =
  | 'cloud'
  | 'mint'
  | 'peach'
  | 'lilac'
  | 'white'
  | 'ink'
  | 'midnight'
  | 'violet'
  | 'teal';

export interface LiquidProps extends HTMLAttributes<HTMLDivElement> {
  palette?: LiquidPalette;
  children?: ReactNode;
  className?: string;
}

export function getPaletteMode(palette: LiquidPalette): 'light' | 'dark' {
  switch (palette) {
    case 'ink':
    case 'midnight':
    case 'violet':
    case 'teal':
      return 'dark';
    default:
      return 'light';
  }
}

export default function Liquid({
  palette = 'cloud',
  children,
  className = '',
  ...props
}: LiquidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mode = getPaletteMode(palette);

  useEffect(() => {
    const el = containerRef.current;
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

  return (
    <div
      ref={containerRef}
      className={`liquid liquid--${palette} ${className}`.trim()}
      data-mode={mode}
      {...props}
    >
      <span className="liquid__blob liquid__blob--a" aria-hidden="true" />
      <span className="liquid__blob liquid__blob--b" aria-hidden="true" />
      {children}
    </div>
  );
}


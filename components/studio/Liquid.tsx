'use client';

import type { HTMLAttributes, ReactNode } from 'react';

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
  const mode = getPaletteMode(palette);

  return (
    <div
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


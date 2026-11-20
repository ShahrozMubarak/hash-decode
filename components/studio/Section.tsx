import type { HTMLAttributes, ReactNode } from 'react';

export type SectionBg = 'white' | 'off-white' | 'grey' | 'black';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  bg?: SectionBg;
  pad?: 'regular' | 'none';
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({
  bg = 'white',
  pad = 'regular',
  children,
  className = '',
  id,
  ...props
}: SectionProps) {
  const mode = bg === 'black' ? 'dark' : 'light';
  const bgClass = bg === 'grey' ? 'hd-section--off-white hd-section--grey' : `hd-section--${bg}`;
  const padClass = pad === 'none' ? 'hd-section--pad-none' : '';
  return (
    <section
      id={id}
      data-mode={mode}
      className={`hd-section ${bgClass} ${padClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

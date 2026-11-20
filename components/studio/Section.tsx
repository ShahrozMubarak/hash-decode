import type { HTMLAttributes, ReactNode } from 'react';

export type SectionBg = 'white' | 'off-white' | 'black';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  bg?: SectionBg;
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Section({
  bg = 'white',
  children,
  className = '',
  id,
  ...props
}: SectionProps) {
  const mode = bg === 'black' ? 'dark' : 'light';
  return (
    <section
      id={id}
      data-mode={mode}
      className={`hd-section hd-section--${bg} ${className}`.trim()}
      {...props}
    >
      {children}
    </section>
  );
}

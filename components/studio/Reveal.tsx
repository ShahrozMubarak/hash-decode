'use client';

import { useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react';

interface RevealProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delayMs?: number;
  className?: string;
}

export default function Reveal({
  children,
  delayMs = 0,
  className = '',
  ...props
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-in');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              setTimeout(() => {
                el.classList.add('is-in');
              }, delayMs);
            } else {
              el.classList.add('is-in');
            }
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delayMs]);

  return (
    <div ref={ref} data-reveal className={className} {...props}>
      {children}
    </div>
  );
}


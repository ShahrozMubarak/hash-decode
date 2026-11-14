'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Mark document as JS-enabled
    document.documentElement.classList.add('js');

    let observer: IntersectionObserver | null = null;
    let safetyTimer: NodeJS.Timeout | null = null;

    const runObserver = () => {
      // 2. Setup stagger delays for parents with data-stagger
      const staggeredParents = document.querySelectorAll<HTMLElement>('[data-stagger]');
      staggeredParents.forEach((parent) => {
        const children = Array.from(parent.children) as HTMLElement[];
        children.forEach((child, index) => {
          if (!child.hasAttribute('data-reveal')) {
            child.setAttribute('data-reveal', 'up');
          }
          if (!child.hasAttribute('data-reveal-delay') && !child.style.transitionDelay) {
            const step = Math.min(index, 7);
            child.style.transitionDelay = `${step * 70}ms`;
          }
        });
      });

      // 3. Create observer with generous margins so content reveals smoothly ahead of scroll
      observer = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const target = entry.target as HTMLElement;
              const customDelay = target.getAttribute('data-reveal-delay');
              if (customDelay && !target.style.transitionDelay) {
                target.style.transitionDelay = `${customDelay}ms`;
              }
              target.classList.add('is-in');
              obs.unobserve(target);
            }
          });
        },
        {
          threshold: 0.05,
          rootMargin: '100px 0px 50px 0px',
        }
      );

      const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
      const vh = window.innerHeight;

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // Immediately reveal anything currently visible or near the top
        if (rect.top <= vh + 120) {
          el.classList.add('is-in');
        } else {
          observer?.observe(el);
        }
      });

      // 4. Safety net: never leave content hidden if observer didn't trigger
      safetyTimer = setTimeout(() => {
        elements.forEach((el) => {
          el.classList.add('is-in');
        });
      }, 500);
    };

    const initialTimer = setTimeout(runObserver, 40);

    return () => {
      clearTimeout(initialTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}

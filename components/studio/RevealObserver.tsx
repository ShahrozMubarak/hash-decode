'use client';

import { useEffect } from 'react';

export default function RevealObserver() {
  useEffect(() => {
    if (typeof document === 'undefined') return;

    // 1. Mark document as JS-enabled
    document.documentElement.classList.add('js');

    let observer: IntersectionObserver | null = null;
    const timer = setTimeout(() => {
      // 2. Setup stagger delays for parents with data-stagger
      const staggeredParents = document.querySelectorAll<HTMLElement>('[data-stagger]');
      staggeredParents.forEach((parent) => {
        const children = Array.from(parent.children) as HTMLElement[];
        children.forEach((child, index) => {
          if (!child.hasAttribute('data-reveal')) {
            child.setAttribute('data-reveal', 'up');
          }
          if (!child.hasAttribute('data-reveal-delay') && !child.style.transitionDelay) {
            const step = Math.min(index, 7); // max 8 steps (0-7)
            child.style.transitionDelay = `${step * 80}ms`;
          }
        });
      });

      // 3. ONE IntersectionObserver (threshold 0.15, rootMargin "0px 0px -8% 0px")
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
          threshold: 0.15,
          rootMargin: '0px 0px -8% 0px',
        }
      );

      const elements = document.querySelectorAll('[data-reveal]');
      elements.forEach((el) => observer?.observe(el));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  return null;
}
